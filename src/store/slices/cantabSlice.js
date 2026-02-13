import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import undoable, { includeAction } from "redux-undo";

import { setDataframe, setSelection } from "./dataSlice";
import {
  updateData,
  convertColumnType,
  replaceValuesWithNull,
} from "../async/dataAsyncReducers";

import {
  generateColumn,
  generateColumnBatch,
} from "../async/dataAsyncReducers";

import { getVariableTypes } from "@/utils/functions";
import { HIDDEN_VARIABLES, VariableTypes } from "@/utils/Constants";
import { notifyError, notifyInfo, notifySuccess } from "@/utils/notifications";
import {
  applyOperation,
  updateAttribute,
  updateDescriptions,
} from "../async/metaAsyncReducers";
import { nullsToQuarantine } from "../async/cantabAsyncReducers";

export const setTimeVar = createAsyncThunk(
  "cantab/setTimeVar",
  async (timeVar, { getState }) => {
    const state = getState();
    const dataframe = state.dataframe.present.dataframe;
    const timestamps = [...new Set(dataframe.map((d) => d[timeVar]))];
    return {
      timeVar: timeVar,
      timestamps: timestamps,
    };
  }
);

export const setGroupVar = createAsyncThunk(
  "cantab/setGroupVar",
  async (groupVar, { getState }) => {
    const state = getState();
    const dataframe = state.dataframe.present.dataframe;
    const groups = [...new Set(dataframe.map((d) => d[groupVar]))];
    return {
      groupVar: groupVar,
      groups: groups,
    };
  }
);

export const setIdVar = createAsyncThunk(
  "cantab/setIdVar",
  async (idVar, { getState }) => {
    const state = getState();
    const dataframe = state.dataframe.present.dataframe;
    const timestamps = [...new Set(dataframe.map((d) => d[idVar]))];
    return {
      idVar: idVar,
      ids: timestamps,
    };
  }
);

const initialState = {
  selectedIds: [],
  scenarioRunResults: [],

  notApi: null,

  init: false,
  initQuarantine: false,

  hasEmptyValues: false,

  quarantineData: [],
  quarantineSelection: null,
  filteredData: null,

  pop_metadata: null,

  descriptions: {},

  idVar: null,
  groupVar: null,
  timeVar: null,

  ids: null,
  groups: null,
  timestamps: null,

  selectionIds: null,
  selectionGroups: null,
  selectionTimestamps: null,

  varTypes: {},

  config: {
    attrWidth: 30,
    navioLabelHeight: 150,
    navioHeight: 700,
  },
};

const isUserCanceledAction = (payload, error) => {
  const message = String(
    payload?.error || payload?.message || payload || error?.message || "",
  ).toLowerCase();
  return message.includes("canceled by user");
};

const cantabSlice = createSlice({
  name: "cantab",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },
    setFilteredData: (state, action) => {
      state.filteredData = action.payload;
    },
    setInitQuarantine: (state, action) => {
      state.initQuarantine = action.payload;
    },
    setQuarantineData: (state, action) => {
      state.quarantineData = action.payload;
      state.quarantineSelection = action.payload;
    },
    setQuarantineSelection: (state, action) => {
      state.quarantineSelection = action.payload;
    },
    setAttrWidth: (state, action) => {
      state.attrWidth = action.payload;
    },
    setScenarioRunResults: (state, action) => {
      state.scenarioRunResults = action.payload;
    },
    setSelectedIds: (state, action) => {
      state.selectedIds = action.payload;
    },
    updateConfig: (state, action) => {
      const { field, value } = action.payload;
      state.config = { ...state.config, [field]: value };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setDataframe, (state, action) => {
      const items = action.payload;
      const groups = [...new Set(items?.map((d) => d[state.groupVar]))];
      const timestamps = [...new Set(items?.map((d) => d[state.timeVar]))];
      state.groups = groups;
      state.timestamps = timestamps;
      state.selectionGroups = groups;
      state.selectionTimestamps = timestamps;
    });

    builder.addCase(setSelection, (state, action) => {
      const items = action.payload;
      const groups = [...new Set(items?.map((d) => d[state.groupVar]))];
      const timestamps = [...new Set(items?.map((d) => d[state.timeVar]))];
      state.selectionGroups = groups;
      state.selectionTimestamps = timestamps;
    });

    builder
      .addCase(setTimeVar.fulfilled, (state, action) => {
        state.timeVar = action.payload.timeVar;
        state.timestamps = action.payload.timestamps;
        state.selectionTimestamps = action.payload.timestamps;
      })
      .addCase(setGroupVar.fulfilled, (state, action) => {
        state.groupVar = action.payload.groupVar;
        state.groups = action.payload.groups;
        state.selectionGroups = action.payload.groups;
      })
      .addCase(setIdVar.fulfilled, (state, action) => {
        state.idVar = action.payload.idVar;
        state.ids = action.payload.ids;
        state.selectionIds = action.payload.ids;
      });

    builder
      .addCase(nullsToQuarantine.fulfilled, (state, action) => {
        const quarantineData = action.payload.quarantineData;
        state.quarantineData = [...state.quarantineData, ...quarantineData];
        state.quarantineSelection = [
          ...state.quarantineData,
          ...quarantineData,
        ];
      })
      .addCase(nullsToQuarantine.rejected, (_, action) => {
        notifyError({
          message: "Could not update quarantine data",
          error: action.payload || action.error,
          fallback: "Failed to move null values into quarantine.",
        });
      });

    builder
      .addCase(updateData.fulfilled, (state, action) => {
        const { varTypes } = action.payload;
        state.varTypes = varTypes;

        state.quarantineData = [];
        state.timeVar = null;
        state.groupVar = null;
        state.idVar = null;
        state.groups = [];
        state.timestamps = [];
        state.selectionGroups = [];
        state.selectionTimestamps = [];

        notifySuccess({
          message: "Data updated",
        });
      })
      .addCase(updateData.rejected, (_, action) => {
        notifyError({
          message: "Could not update dataset",
          error: action.payload || action.error,
          fallback: "The dataset could not be processed.",
        });
      });

    builder.addCase(updateDescriptions.fulfilled, () => {
      notifySuccess({
        message: "Descriptions updated",
      });
    });
    builder.addCase(updateDescriptions.rejected, (_, action) => {
      notifyError({
        message: "Could not update descriptions",
        error: action.payload || action.error,
        fallback: "Description update failed.",
        pauseOnHover: true,
      });
    });

    builder
      .addCase(generateColumn.fulfilled, (state, action) => {
        const { data, quarantineData } = action.payload;
        state.quarantineData = quarantineData;
        state.varTypes = getVariableTypes(data);
        notifySuccess({
          message: "Aggregation created",
        });
      })
      .addCase(generateColumn.rejected, (_, action) => {
        if (isUserCanceledAction(action.payload, action.error)) {
          notifyInfo({
            message: "Aggregation update canceled",
          });
          return;
        }
        notifyError({
          message: "Could not compute aggregation",
          error: action.payload || action.error,
          fallback: "Aggregation column generation failed.",
        });
      });

    builder
      .addCase(generateColumnBatch.fulfilled, (state, action) => {
        const { data, quarantineData } = action.payload;
        state.quarantineData = quarantineData;
        state.varTypes = getVariableTypes(data);
        notifySuccess({
          message: "Aggregations created",
        });
      })
      .addCase(generateColumnBatch.rejected, (_, action) => {
        notifyError({
          message: "Could not compute aggregations",
          error: action.payload || action.error,
          fallback: "Batch aggregation failed.",
        });
      });

    builder
      .addCase(applyOperation.fulfilled, () => {})
      .addCase(applyOperation.rejected, (_, action) => {
        notifyError({
          message: "Could not apply operations",
          error: action.payload || action.error,
          fallback: "Operation execution failed.",
        });
      });

    builder.addCase(replaceValuesWithNull.rejected, (_, action) => {
      notifyError({
        message: "Could not nullify values",
        error: action.payload || action.error,
        fallback: "Failed to replace selected values with null.",
      });
    });

    builder.addCase(convertColumnType.fulfilled, (state, action) => {
      state.varTypes = getVariableTypes(action.payload);
    });

    builder
      .addCase(updateAttribute.fulfilled, (state, action) => {
        notifySuccess({
          message: `Attribute ${action.payload.node.name} updated`,
        });
      })
      .addCase(updateAttribute.rejected, (_, action) => {
        if (isUserCanceledAction(action.payload, action.error)) {
          notifyInfo({
            message: "Attribute update canceled",
          });
          return;
        }
        const nodeName = action.payload?.node?.name || "attribute";

        notifyError({
          message: `Could not update ${nodeName}`,
          error: action.payload?.error || action.payload || action.error,
          fallback: `Update failed for ${nodeName}.`,
        });
      });
  },
});

export default undoable(cantabSlice.reducer, {
  limit: 0,
  undoType: "UNDO_DATA_SLICE",
  redoType: "REDO_DATA_SLICE",
  filter: includeAction([]),
});

export const {
  setInit,

  setFilteredData,

  setAttrWidth,

  setScenarioRunResults,
  setSelectedIds,

  setInitQuarantine,
  setQuarantineData,
  setQuarantineSelection,

  updateConfig,
} = cantabSlice.actions;

export const selectVarTypes = (state) => state.cantab.present.varTypes;
export const selectNavioColumns = (state) =>
  state.dataframe.present.navioColumns;

const isSelectableColumn = (key, navioColumns) =>
  typeof key === "string" &&
  key.trim().length > 0 &&
  navioColumns?.includes(key) &&
  !HIDDEN_VARIABLES.includes(key);

export const selectNumericVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) => {
    return Object.entries(varTypes)
      .filter(
        ([key, type]) =>
          type === VariableTypes.NUMERICAL &&
          isSelectableColumn(key, navioColumns)
      )
      .map(([key]) => key);
  }
);

export const selectCategoricalVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key, type]) =>
          type === VariableTypes.CATEGORICAL &&
          isSelectableColumn(key, navioColumns)
      )
      .map(([key]) => key)
);

export const selectUnkownVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key, type]) =>
          type === VariableTypes.UNKNOWN &&
          isSelectableColumn(key, navioColumns)
      )
      .map(([key]) => key)
);

export const selectVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key, type]) =>
          (type === VariableTypes.CATEGORICAL ||
            type === VariableTypes.NUMERICAL) &&
          isSelectableColumn(key, navioColumns)
      )
      .map(([key]) => key)
);

export const selectNavioVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key]) => isSelectableColumn(key, navioColumns)
      )
      .map(([key]) => key)
);
