import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setDataframe, updateData } from "../data/dataSlice";
import {
  generateAggregation,
  generateAggregationBatch,
} from "../data/modifyReducers";
import {
  DEFAULT_GROUP_VARIABLE,
  DEFAULT_TIMESTAMP_VARIABLE,
  DEFAULT_ID_VARIABLE,
} from "@/utils/Constants";

import { pubsub } from "@/utils/pubsub";
import { identifyTypes } from "@/utils/functions";
import { HIDDEN_VARIABLES, VariableTypes } from "@/utils/Constants";
const { publish } = pubsub;

export const setTimeVar = createAsyncThunk(
  "cantab/setTimeVar",
  async (timeVar, { getState }) => {
    const state = getState();
    const dataframe = state.dataframe.dataframe;
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
    const dataframe = state.dataframe.dataframe;
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
    const dataframe = state.dataframe.dataframe;
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

  attrWidth: 20,

  quarantineData: null,
  quarantineSelection: null,
  filteredData: null,

  pop_metadata: null,

  descriptions: {},

  timestamps: null,
  groups: null,
  ids: null,

  selection: null,
  selectionTimestamps: null,
  selectionGroups: null,
  selectionIds: null,
  varTypes: {},

  idVar: null,
  groupVar: null,
  timeVar: null,
};

const cantabSlice = createSlice({
  name: "cantab",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },
    setInitQuarantine: (state, action) => {
      state.initQuarantine = action.payload;
    },
    setFilteredData: (state, action) => {
      state.filteredData = action.payload;
    },

    setQuarantineData: (state, action) => {
      state.quarantineData = action.payload;
      state.quarantineSelection = action.payload;
    },

    setScenarioRunResults: (state, action) => {
      state.scenarioRunResults = action.payload;
    },
    setSelectedIds: (state, action) => {
      state.selectedIds = action.payload;
    },

    setSelection: (state, action) => {
      state.selection = action.payload;
      state.selectionGroups = [
        ...new Set(action.payload.map((d) => d[state.groupVar])),
      ];
      state.selectionTimestamps = [
        ...new Set(action.payload.map((d) => d[state.timeVar])),
      ];
    },
    setQuarantineSelection: (state, action) => {
      state.quarantineSelection = action.payload;
    },
    setAttrWidth: (state, action) => {
      state.attrWidth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setDataframe, (state, action) => {
        const items = action.payload;
        state.selection = items;
        const groups = [...new Set(items?.map((d) => d[state.groupVar]))];
        const timestamps = [...new Set(items?.map((d) => d[state.timeVar]))];
        state.groups = groups;
        state.selectionGroups = groups;
        state.timestamps = timestamps;
        state.selectionTimestamps = timestamps;
      })
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

    builder.addCase(updateData.fulfilled, (state, action) => {
      const items = action.payload.items;
      state.quarantineData = null;
      state.selection = items;
      state.varTypes = identifyTypes(items);
      state.timeVar = null;
      state.groupVar = null;
      state.idVar = null;
      const groups = [];
      const timestamps = [];

      state.groups = groups;
      state.selectionGroups = groups;
      state.timestamps = timestamps;
      state.selectionTimestamps = timestamps;

      const configuration = {
        message: "Data Loaded",
        description: "",
        placement: "bottomRight",
        type: "success",
      };
      publish("notification", configuration);
    }),
      builder.addCase(updateData.rejected, (state, action) => {
        const configuration = {
          message: "Error Loading Data",
          description: action.payload,
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(generateAggregation.fulfilled, (state, action) => {
      const items = action.payload;
      state.varTypes = identifyTypes(items);
      const configuration = {
        message: "Aggregation Computed",
        type: "success",
      };
      publish("notification", configuration);
    }),
      builder.addCase(generateAggregation.rejected, (state, action) => {
        const configuration = {
          message: "Error Computing Aggregation",
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(generateAggregationBatch.fulfilled, (state, action) => {
      const items = action.payload;
      state.varTypes = identifyTypes(items);
      const configuration = {
        message: "Aggregations Computed",
        type: "success",
      };
      publish("notification", configuration);
    }),
      builder.addCase(generateAggregationBatch.rejected, (state, action) => {
        const configuration = {
          message: "Error Computing Aggregations",
          type: "error",
        };
        publish("notification", configuration);
      });
  },
});

export default cantabSlice.reducer;
export const {
  setInit,

  setSelection,
  setFilteredData,

  setAttrWidth,

  setScenarioRunResults,
  setSelectedIds,

  setInitQuarantine,
  setQuarantineData,
  setQuarantineSelection,
} = cantabSlice.actions;

import { createSelector } from "reselect";

const selectVarTypes = (state) => state.cantab.varTypes;
const selectNavioColumns = (state) => state.dataframe.navioColumns;

export const selectNumericVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key, type]) =>
          type === VariableTypes.NUMERICAL && navioColumns?.includes(key)
      )
      .map(([key]) => key)
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

export const selectAllVars = createSelector(
  [selectVarTypes, selectNavioColumns],
  (varTypes, navioColumns) =>
    Object.entries(varTypes)
      .filter(
        ([key]) =>
          navioColumns?.includes(key) && !HIDDEN_VARIABLES.includes(key)
      )
      .map(([key]) => key)
);
