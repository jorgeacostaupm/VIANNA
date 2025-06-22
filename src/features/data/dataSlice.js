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

import { ORDER_VARIABLE } from "@/utils/Constants";

import { updateHierarchy } from "../metadata/metaSlice";

import { generateTree, getVisibleNodes } from "@/utils/functions";

const initialState = {
  filename: null,
  dataframe: null,
  original: null,
  navioColumns: null,
  version: -1,
};

export const getVariableTypes = (df) => {
  const rows = df.objects();
  const result = {};
  rows.forEach((obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value === null) {
          continue;
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

export const updateData = createAsyncThunk(
  "dataframe/load-import",
  async (
    { data, filename, isGenerateHierarchy },
    { dispatch, rejectWithValue }
  ) => {
    try {
      let dt = aq.from(data);
      let meta = getVariableTypes(dt);
      dt = dt.derive({ [ORDER_VARIABLE]: aq.op.row_number() });

      if (isGenerateHierarchy) {
        dispatch(buildMetaFromVariableTypes(meta));
      }

      return {
        filename: filename,
        items: dt.objects(),
        column_names: dt.columnNames().filter((d) => d !== ORDER_VARIABLE),
        isNewColumns: isGenerateHierarchy,
      };
    } catch (err) {
      return rejectWithValue("Something is wrong with API data");
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
      state.navioColumns = action.payload;
    }),
    setDataframe: create.reducer((state, action) => {
      state.dataframe = action.payload;
      state.version += 1;
    }),
  }),
  extraReducers: (builder) => {
    builder.addCase(updateHierarchy.fulfilled, (state, action) => {
      const { hierarchy } = action.payload;
      const tree = generateTree(hierarchy, 0);
      const filtered = getVisibleNodes(tree);
      state.navioColumns = filtered;
    }),
      builder.addCase(updateData.fulfilled, (state, action) => {
        state.filename = action.payload.filename;
        state.dataframe = action.payload.items;
        if (action.payload.isNewColumns) {
          state.navioColumns = action.payload.column_names;
          state.original = action.payload.column_names;
        }

        state.version += 1;
      }),
      builder.addCase(generateAggregation.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(generateAggregation.rejected, (state, action) => {});
    builder.addCase(generateAggregationBatch.fulfilled, (state, action) => {
      state.dataframe = action.payload;
      state.version += 1;
    }),
      builder.addCase(generateEmpty.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(removeColumn.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(removeBatch.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      });
  },
});

export const { renameColumn, setNavioColumns, setDataframe } =
  dataSlice.actions;
export default dataSlice.reducer;

export const selectDataframe = (state) => state.dataframe.dataframe;
