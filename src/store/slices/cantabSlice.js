import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
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

import { pubsub } from "@/utils/pubsub";
import { getVariableTypes } from "@/utils/functions";
import { HIDDEN_VARIABLES, VariableTypes } from "@/utils/Constants";
import {
  applyOperation,
  updateAttribute,
  updateDescriptions,
} from "../async/metaAsyncReducers";
const { publish } = pubsub;

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

  quarantineData: null,
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
      .addCase(updateData.fulfilled, (state, action) => {
        const { varTypes } = action.payload;
        state.varTypes = varTypes;

        state.quarantineData = null;
        state.timeVar = null;
        state.groupVar = null;
        state.idVar = null;
        state.groups = [];
        state.timestamps = [];
        state.selectionGroups = [];
        state.selectionTimestamps = [];

        const configuration = {
          message: "Data updated",
          type: "success",
        };
        publish("notification", configuration);
      })
      .addCase(updateData.rejected, (state, action) => {
        const configuration = {
          message: "Error loading data",
          description: action.payload,
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(updateDescriptions.fulfilled, (state, action) => {
      const configuration = {
        message: "Descriptions Updated",
        type: "success",
      };
      publish("notification", configuration);
    });
    builder.addCase(updateDescriptions.rejected, (state, action) => {
      const configuration = {
        message: "Error updating descriptions",
        description: action.payload,
        type: "error",
        pauseOnHover: true,
      };
      publish("notification", configuration);
    });

    builder
      .addCase(generateColumn.fulfilled, (state, action) => {
        const { data, quarantineData, filteredData } = action.payload;
        state.quarantineData = quarantineData;
        state.varTypes = getVariableTypes(data);
        const configuration = {
          message: "Aggregation computed",
          type: "success",
        };
        publish("notification", configuration);
      })
      .addCase(generateColumn.rejected, (state, action) => {
        const configuration = {
          message: "Error computing aggregation",
          type: "error",
        };
        publish("notification", configuration);
      });

    builder
      .addCase(generateColumnBatch.fulfilled, (state, action) => {
        const { data, quarantineData, filteredData } = action.payload;
        state.quarantineData = quarantineData;
        state.varTypes = getVariableTypes(data);
        const configuration = {
          message: "Aggregations computed",
          type: "success",
        };
        publish("notification", configuration);
      })
      .addCase(generateColumnBatch.rejected, (state, action) => {
        const configuration = {
          message: "Error computing aggregations",
          description: action.payload,
          type: "error",
        };
        publish("notification", configuration);
      });

    builder
      .addCase(applyOperation.fulfilled, (state, action) => {})
      .addCase(applyOperation.rejected, (state, action) => {
        const configuration = {
          message: "Error applying operations",
          description: action.payload,
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(replaceValuesWithNull.rejected, (state, action) => {
      const configuration = {
        message: "Error nullifying values",
        description: action.payload,
        type: "error",
      };
      publish("notification", configuration);
    });

    builder.addCase(convertColumnType.fulfilled, (state, action) => {
      state.varTypes = getVariableTypes(action.payload);
    });

    builder
      .addCase(updateAttribute.fulfilled, (state, action) => {
        const configuration = {
          message: `Attribute ${action.payload.node.name} updated`,
          type: "success",
        };
        publish("notification", configuration);
      })
      .addCase(updateAttribute.rejected, (state, action) => {
        const configuration = {
          message: `Error updating ${action.payload.node.name}`,
          description: action.payload.error,
          type: "error",
        };
        publish("notification", configuration);
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

export const selectNumericVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) => {
    return Object.entries(varTypes)
      .filter(
        ([key, type]) =>
          type === VariableTypes.NUMERICAL && navioColumns?.includes(key)
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
          type === VariableTypes.CATEGORICAL && navioColumns?.includes(key)
      )
      .map(([key]) => key)
);

export const selectUnkownVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key, type]) =>
          type === VariableTypes.UNKNOWN && navioColumns?.includes(key)
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
          navioColumns?.includes(key) &&
          !HIDDEN_VARIABLES.includes(key)
      )
      .map(([key]) => key)
);

export const selectNavioVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key]) =>
          navioColumns?.includes(key) && !HIDDEN_VARIABLES.includes(key)
      )
      .map(([key]) => key)
);
