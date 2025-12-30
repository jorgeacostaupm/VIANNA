import { createSlice } from "@reduxjs/toolkit";
import * as aq from "arquero";

import undoable, { includeAction } from "redux-undo";
import {
  generateColumn,
  generateColumnBatch,
  generateEmpty,
  removeBatch,
  removeColumn,
} from "../async/dataAsyncReducers";

import { updateHierarchy } from "../async/metaAsyncReducers";

import {
  generateTree,
  getVisibleNodes,
  hasEmptyValues,
  pickColumns,
} from "@/utils/functions";

import { updateData, replaceValuesWithNull } from "../async/dataAsyncReducers";

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

  nullifiedValues: [],
};

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
      const selection = pickColumns(state.dataframe, state.navioColumns);
      state.selection = selection;
      hasEmptyValues(selection, state);
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
      const selection = pickColumns(state.dataframe, state.navioColumns);
      state.selection = selection;
    });

    builder.addCase(updateData.fulfilled, (state, action) => {
      const { columnNames, filename, items, isNewColumns } = action.payload;
      state.filename = filename;

      if (isNewColumns) {
        state.navioColumns = columnNames;
        state.original = columnNames;
      }

      const selection = pickColumns(items, state.navioColumns);
      hasEmptyValues(selection, state);

      state.dataframe = items;
      state.selection = selection;
      state.version = 0;
      state.nullifiedValues = [];
    });

    builder
      .addCase(generateColumn.fulfilled, (state, action) => {
        state.dataframe = action.payload.data;
        state.version += 1;
      })
      .addCase(generateColumn.rejected, (state, action) => {});

    builder.addCase(generateColumnBatch.fulfilled, (state, action) => {
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

    builder.addCase(replaceValuesWithNull.fulfilled, (state, action) => {
      state.nullifiedValues = [...state.nullifiedValues, action.payload.value];
    });
  },
});

export default undoable(dataSlice.reducer, {
  limit: 0,
  undoType: "UNDO_DATA_SLICE",
  redoType: "REDO_DATA_SLICE",
  filter: includeAction([]),
});
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
