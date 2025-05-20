import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { startWorker } from "./startWorker";
import { pubsub } from "@/components/VAPUtils/pubsub";
const { publish } = pubsub;

const initialState = {
  init: false,

  selectedVar: null,
  nBars: 15,
  desc: true,
  filterList: [],
  isNumeric: true,
  pValue: 1,

  estimator: "swarm",
  nPoints: 100,
  distrRange: 0.5,
  pointSize: 5,
  blurGroups: [],
  hideGroups: [],

  result: null,
  loading: false,
};

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

    // BARPLOT
    setSelectedVar: (state, action) => {
      state.selectedVar = action.payload;
    },
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
      state.result = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(startWorker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startWorker.fulfilled, (state, action) => {
        state.loading = false;
        console.log("UPDATING RESULT");
        state.result = action.payload;
      })
      .addCase(startWorker.rejected, (state, action) => {
        state.loading = false;
        const configuration = {
          message: "Error computing data on worker",
          description: action.payload,
          type: "error",
          pauseOnHover: true,
        };
        publish("notification", configuration);
      });
  },
});

export default compareSlice.reducer;
export const {
  setInit,
  setIsNumeric,

  setSelectedVar,
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
} = compareSlice.actions;
