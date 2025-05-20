/*
Slice con el dataframe original

dataframe
original columns ( para poder ocultar cosas)

*/

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { from as loadObjects, loadCSV, addFunction } from "arquero";
import * as XLSX from "xlsx";
import * as aq from "arquero";
import * as d3 from "d3";

import { buildMetaFromVariableTypes } from "../metadata/metaCreatorReducer";
import {
  generateAggregation,
  generateAggregationBatch,
  generateEmpty,
  removeBatch,
  removeColumn,
} from "./modifyReducers";

import {
  DEFAULT_POPULATION_VARIABLE,
  DEFAULT_TIME_VARIABLE,
  DEFAULT_ORDER_VARIABLE,
  HIDDEN_VARIABLES,
} from "@/components/VAPCANTAB/Utils/constants/Constants";

import {
  setPreTransforms,
  setTimeVar,
  setGroupVar,
} from "../cantab/cantabSlice";
import { setFullMeta } from "../metadata/metaSlice";

const initialState = {
  dataframe: null,
  original: null,
  navioColumns: null,
  loadedState: "ready", // 'loading', 'done',
  version: -1,
};

// takes an array of objects and returns the type of each field
export const getVariableTypes = (df) => {
  const rows = df.objects();
  const result = {};
  rows.forEach((obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value === null) {
          continue; // Exit the loop for this object
        }
        const type = typeof value;
        const dtype =
          type !== "object" ? type : value instanceof Date ? "date" : "object";
        result[key] = dtype;
      }
    }
  });
  return result;
};

const deriveOperation = (a, o, t, f) => {
  switch (t) {
    case "string":
      return `(r) => string(r[\"${a}\"])`;
    case "number":
      return `(r) => parse_float(r[\"${a}\"])`;
    case "date":
      if (o == "string") {
        return `(r) => parseDate(r[\"${a}\"], \"${f}\")`; // todo add format
      } else if (o == "number") {
        return `(r) => parseUnixDate(r[\"${a}\"])`; // todo add format
      } else {
        return `(r) => r[\"${a}\"]`;
      }
    default:
      return "(r) => null";
  }
};

// function to give variable type to the attributes
function applyTransformations(df, trans) {
  const transformations = {};
  trans.forEach((t) => {
    if (t.original == t.transform) return;
    const op = deriveOperation(t.attribute, t.original, t.transform, t.format);
    transformations[t.attribute] = op;
  });

  return df.derive(transformations);
}

export const updateFromCSV = createAsyncThunk(
  "dataframe/load-csv",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const delimiter = payload.opts.delimiter || ",";
      const decimal = payload.opts.decimal || ".";
      let dt = await loadCSV(payload.fileURL, {
        delimiter: delimiter,
        decimal: decimal,
      });
      dt = applyTransformations(dt, payload.transforms);
      const meta = getVariableTypes(dt);
      dispatch(buildMetaFromVariableTypes(meta));
      return dt;
    } catch (err) {
      return rejectWithValue("Invalid CSV File");
    }
  }
);

export function transformInitialData(data, population, time) {
  let dt = aq.from(data);
  let meta = getVariableTypes(dt);
  const transformations = [];
  const preTransformations = [];
  const variables = [population, time];

  variables.forEach((v) => {
    if (dt.columnNames().includes(v)) {
      //the transformation applied to the variable
      transformations.push({
        attribute: v,
        original: meta[v],
        transform: "string",
        other: "",
      });
      //its original type to restored in case it changes
      preTransformations.push({
        attribute: v,
        original: "string",
        transform: meta[v],
        other: "",
      });
    }
  });
  //applying the transformations, population and time variables should be strings
  dt = applyTransformations(dt, transformations);
  //data can bring my hidden variables?
  //const filterDt = dt.select(aq.not(aq.escape((d) => HIDDEN_VARIABLES.includes(d.columnName))))
  meta = getVariableTypes(dt);

  return { dt, meta, pre_ret: preTransformations };
}

function getInitialData(data) {
  let tmp = aq.from(data);

  let { dt, meta, pre_ret } = transformInitialData(
    tmp,
    DEFAULT_POPULATION_VARIABLE,
    DEFAULT_TIME_VARIABLE
  );

  if (!dt.columnNames().includes(DEFAULT_ORDER_VARIABLE)) {
    dt = dt.derive({ [DEFAULT_ORDER_VARIABLE]: aq.op.row_number() });
  }

  return { dt, meta, pre_ret };
}

// ASUMES THAT THE LOADED HIERARCHY IS CORRECT
export const updateFromJSON = createAsyncThunk(
  "dataframe/load-api",
  async (payload, { dispatch, rejectWithValue, getState }) => {
    try {
      if (payload?.length === 0) {
        throw new Error(`Retrieved data is empty...`);
      }
      let tmp = aq.from(payload);
      console.log(tmp.columnNames(), tmp.columnNames().length);
      const cols = getState().metadata.attributes;

      const hierarchy_cols = cols.map((col) => col.name);
      const data_cols = tmp.columnNames();

      const diff = hierarchy_cols.filter((item) => !data_cols.includes(item));
      let updatedData = tmp;

      diff.map((col) => {
        updatedData = updatedData.derive(
          { [col]: (r) => null },
          { drop: false }
        );
      });

      let formated = {};
      cols.forEach((m) => {
        if (m?.info?.exec) formated[m.name] = m.info.exec;
      });

      const result = tmp.derive(formated, { drop: false });
      let { dt, meta, pre_ret } = getInitialData(result.objects());

      return {
        items: dt.objects(),
        column_names: dt
          .columnNames()
          .filter((d) => d !== DEFAULT_ORDER_VARIABLE),
      };
    } catch (err) {
      console.error(err);
      return rejectWithValue("Something is wrong with API data");
    }
  }
);

export const updateFromImport = createAsyncThunk(
  "dataframe/load-import",
  async ({ data, isGenerateHierarchy }, { dispatch, rejectWithValue }) => {
    try {
      const { dt, meta, pre_ret } = getInitialData(data);
      if (isGenerateHierarchy) {
        dispatch(setPreTransforms(pre_ret));
        dispatch(buildMetaFromVariableTypes(meta));
      }
      return {
        items: dt.objects(),
        column_names: dt
          .columnNames()
          .filter((d) => d !== DEFAULT_ORDER_VARIABLE),
        isNewColumns: isGenerateHierarchy,
      };
    } catch (err) {
      return rejectWithValue("Something is wrong with API data");
    }
  }
);

export const updateDataAppVariables = createAsyncThunk(
  "cantab/updateDataAppVariables",
  async (payload, { dispatch, rejectWithValue, getState }) => {
    try {
      const preTransforms = getState().cantab.preTransforms;
      const time = payload.time;
      const population = payload.population;
      let tmp = aq.from(getState().dataframe.dataframe);
      tmp = applyTransformations(tmp, preTransforms);

      const { dt, meta, pre_ret } = transformInitialData(tmp, population, time);

      dispatch(setGroupVar(population));
      dispatch(setTimeVar(time));
      //ESTO SE DEBERIA LANZAR PARA ACTUALIZAR EL ARBOL Y GUARDAR LAS NUEVAS TRANSFORMS
      //dispatch(setPreTransforms(pre_ret));
      //dispatch(buildMetaFromData(meta));

      return dt.objects();
    } catch (err) {
      return rejectWithValue("Something is wrong with API data");
    }
  }
);

export const updateFromExcel = createAsyncThunk(
  "dataframe/load-excel",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { fileURL, opts, transforms } = payload;
      const response = await fetch(fileURL);
      const data = await response.arrayBuffer();

      const workbook = XLSX.read(data, { type: "buffer" });
      const worksheet = workbook.Sheets[opts.sheetname];
      let dt = loadObjects(XLSX.utils.sheet_to_json(worksheet));
      dt = applyTransformations(dt, transforms);

      const meta = getVariableTypes(dt);
      dispatch(buildMetaFromVariableTypes(meta));
      return dt;
    } catch (err) {
      return rejectWithValue("Invalid Excel File");
    }
  }
);

export const dataSlice = createSlice({
  name: "dataframe",
  initialState: initialState,
  reducers: (create) => ({
    renameColumn: create.reducer((state, action) => {
      const { prevName, newName } = action.payload;
      state.dataframe = aq
        .from(state.dataframe)
        .rename({ [prevName]: newName })
        .objects();

      const navColIdx = state.navioColumns.findIndex((n) => n === prevName);
      state.navioColumns[navColIdx] = newName;

      state.version += 1;
    }),
    setNavioColumns: create.reducer((state, action) => {
      console.log("settin nabio colums ", action.payload);
      state.navioColumns = action.payload;
    }),
    setDataframe: create.reducer((state, action) => {
      state.dataframe = action.payload;
      state.version += 1;
    }),
  }),
  extraReducers: (builder) => {
    builder.addCase(setFullMeta, (state, action) => {
      const data = action.payload;
      const tree = generateTree(data, 0);
      const filtered = getFilteredNodes(tree);
      state.navioColumns = filtered;
      console.log("filtered", filtered);
    }),
      builder.addCase(updateFromJSON.pending, (state, action) => {
        state.loadedState = "loading";
      }),
      builder.addCase(updateFromJSON.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload.items;
        state.original = action.payload.column_names;
        state.version += 1;
      }),
      builder.addCase(updateFromJSON.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(updateFromImport.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(updateFromImport.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload.items;
        if (action.payload.isNewColumns) {
          state.navioColumns = action.payload.column_names;
          state.original = action.payload.column_names;
        }

        state.version += 1;
      }),
      builder.addCase(updateFromImport.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(generateAggregation.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(generateAggregation.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(generateAggregation.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(generateAggregationBatch.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(generateAggregationBatch.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(generateAggregationBatch.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(generateEmpty.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(generateEmpty.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(generateEmpty.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(removeColumn.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(removeColumn.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(removeColumn.rejected, (state, action) => {
        state.loadedState = "error";
      });
    builder.addCase(removeBatch.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(removeBatch.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(removeBatch.rejected, (state, action) => {
        state.loadedState = "error";
      });
  },
});

export const { renameColumn, setNavioColumns, setDataframe } =
  dataSlice.actions;
export default dataSlice.reducer;

// selector para no duplicar datos
export const selectDataframe = (state) => state.dataframe.dataframe;

function generateTree(meta, nodeID) {
  const node = meta.find((item) => item.id === nodeID);
  // console.log(nodeID, node);
  if (node == null) return null;

  const children = node.related.map((childID) => generateTree(meta, childID));
  return {
    id: node.id,
    name: node.name,
    children: children,
    isShown: node.isShown,
    type: node.type,
    formula: node?.info?.formula,
  };
}

function getFilteredNodes(tree) {
  const filteredNodes = [];
  const queue = [tree];

  while (queue.length > 0) {
    const node = queue.shift();

    if (
      node.isShown === false ||
      !node.children ||
      node.children.length === 0
    ) {
      if (node?.type === "aggregation" || node?.formula === "") {
      } else filteredNodes.push(node.name);
    } else if (node.children && node.children.length > 0) {
      queue.push(...node.children);
    }
  }

  return filteredNodes;
}
