import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as aq from "arquero";

import { buildMetaFromVariableTypes } from "../metadata/metaCreatorReducer";
import {
  generateAggregation,
  generateAggregationBatch,
  generateEmpty,
  removeBatch,
  removeColumn,
} from "./modifyReducers";

import { navioLabelHeight, ORDER_VARIABLE } from "@/utils/Constants";

import { updateHierarchy } from "../metadata/metaSlice";
import { setTimeVar, setGroupVar, setIdVar } from "../cantab/cantabSlice";

import {
  generateTree,
  getVisibleNodes,
  hasEmptyValues,
  pickColumns,
  getVariableTypes,
} from "@/utils/functions";

const initialState = {
  filename: null,

  dataframe: null,
  original: null,

  selection: null,
  selectionIds: null,

  hasEmptyValues: false,

  navioColumns: [],
  version: -1,

  config: {
    attrWidth: 30,
    navioLabelHeight: 150,
    navioHeight: 700,
  },
};

export const updateData = createAsyncThunk(
  "dataframe/load-import",
  async (
    { data, filename, isGenerateHierarchy },
    { dispatch, rejectWithValue }
  ) => {
    try {
      let dt = aq.from(data);
      let meta = getVariableTypes(data);
      dt = dt.derive({ [ORDER_VARIABLE]: aq.op.row_number() });
      if (isGenerateHierarchy) {
        dispatch(buildMetaFromVariableTypes(meta));
      }
      return {
        filename: filename,
        items: dt.objects(),
        column_names: dt.columnNames().filter((d) => d !== ORDER_VARIABLE),
        isNewColumns: isGenerateHierarchy,
        varTypes: meta,
      };
    } catch (err) {
      return rejectWithValue("Something is wrong with API data");
    }
  }
);

export const dataSlice = createSlice({
  name: "dataframe",
  initialState: initialState,
  reducers: {
    setDataframe: (state, action) => {
      const selection = pickColumns(action.payload, state.navioColumns);
      state.dataframe = action.payload;
      state.selection = selection;
      state.version += 1;

      hasEmptyValues(selection, state);
    },

    setNavioColumns: (state, action) => {
      state.navioColumns = action.payload;
    },

    setSelection: (state, action) => {
      const selection = pickColumns(action.payload, state.navioColumns);
      state.selection = selection;

      hasEmptyValues(selection, state);
    },

    renameColumn: (state, action) => {
      const { prevName, newName } = action.payload;
      state.dataframe = aq
        .from(state.dataframe)
        .rename({ [prevName]: newName })
        .objects();

      const navColIdx = state.navioColumns.findIndex((n) => n === prevName);
      state.navioColumns[navColIdx] = newName;

      state.version += 1;
    },

    updateConfig: (state, action) => {
      const { field, value } = action.payload;
      state.config = { ...state.config, [field]: value };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateHierarchy.fulfilled, (state, action) => {
      const { hierarchy } = action.payload;
      const tree = generateTree(hierarchy, 0);
      const filtered = getVisibleNodes(tree);

      state.navioColumns = filtered;
    });

    builder.addCase(updateData.fulfilled, (state, action) => {
      state.filename = action.payload.filename;

      if (action.payload.isNewColumns) {
        state.navioColumns = action.payload.column_names;
        state.original = action.payload.column_names;
      }

      const selection = pickColumns(action.payload.items, state.navioColumns);
      hasEmptyValues(selection, state);

      state.dataframe = action.payload.items;
      state.selection = selection;
      state.selectionGroups = [];
      state.selectionTimestamps = [];

      state.version += 1;
    });

    builder
      .addCase(generateAggregation.fulfilled, (state, action) => {
        state.dataframe = action.payload.data;
        state.version += 1;
      })
      .addCase(generateAggregation.rejected, (state, action) => {});

    builder.addCase(generateAggregationBatch.fulfilled, (state, action) => {
      console.log("generateAggregationBatch", action.payload);
      state.dataframe = action.payload.data;
      state.version += 1;
    });

    builder
      .addCase(generateEmpty.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      })
      .addCase(removeColumn.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      })
      .addCase(removeBatch.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      });

    builder
      .addCase(setTimeVar.fulfilled, (state, action) => {
        state.selectionTimestamps = action.payload.timestamps;
      })
      .addCase(setGroupVar.fulfilled, (state, action) => {
        state.selectionGroups = action.payload.groups;
      })
      .addCase(setIdVar.fulfilled, (state, action) => {
        state.selectionIds = action.payload.ids;
      });
  },
});

export default dataSlice.reducer;
export const {
  renameColumn,
  setNavioColumns,
  setDataframe,
  setSelection,
  updateConfig,
  editData,
} = dataSlice.actions;

/* const deriveOperation = (a, o, t, f) => {
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
}; */
