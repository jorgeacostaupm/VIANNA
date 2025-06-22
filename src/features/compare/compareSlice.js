import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { pubsub } from "@/utils/pubsub";
import tests from "@/utils/tests";
import { runShapiroWilk, runLevene } from "@/utils/stats";
import { updateData } from "../data/dataSlice";
import * as aq from "arquero";

const { publish } = pubsub;

const initialState = {
  init: false,

  selectedVar: null,
  assumptions: {
    normality: null,
    equalVariance: null,
  },
  assumptionsLoading: false,
  assumptionsError: null,

  selectedTest: null,

  rankingResult: null,
  rankingLoading: false,
  nBars: 15,
  desc: true,
  filterList: [],
  isNumeric: true,
  pValue: 0.05,

  pwShowCaps: true,
  pwCapSize: 6,
  pwShape: "circle",
  pwShapeSize: 6,

  prShowCaps: true,
  prCapSize: 6,
  prShape: "circle",
  prShapeSize: 6,

  estimator: "histogram",
  nPoints: 100,
  distrRange: 0.5,
  pointSize: 5,
  blurGroups: [],
  hideGroups: [],

  testResult: null,
  testLoading: false,
};

export const runAllComparisonTests = createAsyncThunk(
  "compare/runAllComparisonTests",
  async (payload, thunkAPI) => {
    try {
      const { selection, groupVar, variables, test } = payload;
      const testObj = tests.find((t) => t.label === test);

      const table = aq.from(selection);
      const gTable = table.groupby(groupVar);
      const raw = gTable.objects({ grouped: "entries" });
      const allVars = variables;

      const data = [];

      for (const variable of allVars) {
        const groups = raw.map(([name, rows]) => ({
          name,
          values: rows.map((r) => r[variable]),
        }));

        const res = testObj.run(groups);
        data.push({
          variable,
          value: res.metric.value,
          p_value: res.pValue,
          ...res,
        });
      }
      return { data: data, measure: testObj.metric.symbol };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const runComparisonTest = createAsyncThunk(
  "compare/runTest",
  async (payload, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const variable = state.compare.selectedVar;
      const selectedTest = state.compare.selectedTest;
      const groupVar = state.cantab.groupVar;

      const table = aq.from(payload.selection);
      const gTable = table.groupby(groupVar);
      const rawGroups = gTable.objects({ grouped: "entries" });

      const groups = rawGroups.map(([name, rows]) => ({
        name,
        values: rows.map((r) => r[variable]),
      }));

      const testObj = tests.find((t) => t.label === selectedTest);
      if (!testObj) {
        throw new Error(`Test no encontrado: ${selectedTest}`);
      }
      const result = testObj.run(groups);
      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const checkAssumptions = createAsyncThunk(
  "compare/checkAssumptions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { selection, groupVar } = getState().cantab;
      const { selectedVar } = getState().compare;

      const table = aq.from(selection);
      const raw = table.groupby(groupVar).objects({ grouped: "entries" });

      const groups = raw.map(([name, rows]) => ({
        name,
        values: rows.map((r) => r[selectedVar]),
      }));

      const normality = groups.map((g) => {
        const { W, pValue, normal } = runShapiroWilk(g.values);
        return { group: g.name, W, pValue, normal };
      });

      const {
        F,
        pValue: levP,
        equalVariance,
      } = runLevene(groups.map((g) => g.values));

      return { normality, equalVariance, levP, F };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },
    setIsNumeric: (state, action) => {
      state.isNumeric = action.payload;
    },

    setSelectedVar: (state, action) => {
      state.selectedVar = action.payload;
    },
    setSelectedTest: (state, action) => {
      state.selectedTest = action.payload;
    },
    setTestResult: (state, action) => {
      state.testResult = action.payload;
    },

    // BARCHART
    setNBars: (state, action) => {
      state.nBars = action.payload;
    },
    setDesc: (state, action) => {
      state.desc = action.payload;
    },
    addFilteringVariable: (state, action) => {
      state.filterList.push(action.payload);
    },
    setFilteringList: (state, action) => {
      state.filterList = action.payload;
    },
    setPValue: (state, action) => {
      state.pValue = action.payload;
    },
    setResult: (state, action) => {
      state.rankingResult = action.payload;
    },

    // DISTRCHART
    setEstimator: (state, action) => {
      state.estimator = action.payload;
    },
    setPointSize: (state, action) => {
      state.pointSize = action.payload;
    },
    setDistrRange: (state, action) => {
      state.distrRange = action.payload;
    },
    setNPoints: (state, action) => {
      state.nPoints = action.payload;
    },
    setBlurGroups: (state, action) => {
      state.blurGroups = action.payload;
    },
    setHideGroups: (state, action) => {
      state.hideGroups = action.payload;
    },

    // PWCHART
    setPwShowCaps: (state, action) => {
      state.pwShowCaps = action.payload;
    },
    setPwCapSize: (state, action) => {
      state.pwCapSize = action.payload;
    },
    setPwShape: (state, action) => {
      state.pwShape = action.payload;
    },
    setPwShapeSize: (state, action) => {
      state.pwShapeSize = action.payload;
    },

    // PRCHART
    setPrShowCaps: (state, action) => {
      state.prShowCaps = action.payload;
    },
    setPrCapSize: (state, action) => {
      state.prCapSize = action.payload;
    },
    setPrShape: (state, action) => {
      state.prShape = action.payload;
    },
    setPrShapeSize: (state, action) => {
      state.prShapeSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runAllComparisonTests.pending, (state) => {
        state.rankingLoading = true;
        state.error = null;
      })
      .addCase(runAllComparisonTests.fulfilled, (state, action) => {
        state.rankingLoading = false;
        state.rankingResult = action.payload;
      })
      .addCase(runAllComparisonTests.rejected, (state, action) => {
        state.rankingLoading = false;
        state.error = action.payload || action.error.message;
        publish("notification", {
          message: "Error executing test for all variables",
          description: state.error,
          type: "error",
        });
      });

    builder
      .addCase(runComparisonTest.pending, (state) => {
        state.testLoading = true;
        state.error = null;
      })
      .addCase(runComparisonTest.fulfilled, (state, action) => {
        state.testLoading = false;
        state.testResult = action.payload;
      })
      .addCase(runComparisonTest.rejected, (state, action) => {
        state.testLoading = false;
        state.error = action.payload || action.error.message;
        publish("notification", {
          message: "Error executing test",
          description: state.error,
          type: "error",
        });
      });

    builder
      .addCase(checkAssumptions.pending, (state) => {
        state.assumptionsLoading = true;
        state.assumptionsError = null;
      })
      .addCase(checkAssumptions.fulfilled, (state, action) => {
        state.assumptionsLoading = false;
        state.assumptions = action.payload;
      })
      .addCase(checkAssumptions.rejected, (state, action) => {
        state.assumptionsLoading = false;
        state.assumptionsError = action.error.message;
      });

    builder.addCase(updateData.fulfilled, (state) => {
      state.selectedVar = null;
      state.selectedTest = null;
    });
  },
});

export default compareSlice.reducer;
export const {
  setInit,
  setIsNumeric,

  setSelectedVar,
  setSelectedTest,
  setTestResult,

  setNBars,
  setPValue,
  setDesc,
  setFilteringList,
  addFilteringVariable,
  setResult,

  setEstimator,
  setDistrRange,
  setPointSize,
  setNPoints,
  setBlurGroups,
  setHideGroups,

  setPwShowCaps,
  setPwCapSize,
  setPwShape,
  setPwShapeSize,

  setPrShowCaps,
  setPrCapSize,
  setPrShape,
  setPrShapeSize,
} = compareSlice.actions;
