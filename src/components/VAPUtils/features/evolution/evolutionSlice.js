import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { startWorker } from './startWorker';
import { pubsub } from '@/components/VAPUtils/pubsub';
const { publish } = pubsub;

const initialState = {
  init: false,

  selectedVar: null,
  selectedPopulation: null,
  nBars: 15,
  desc: true,
  filterList: [],
  isNumeric: true,
  pValue: 0.05,

  showStds: true,
  showMeans: true,
  meanPointSize: 20,
  subjectPointSize: 5,
  meanStrokeWidth: 10,
  subjectStrokeWidth: 2,
  blurGroups: [],
  hideGroups: [],

  result: null,
  loading: false
};

const evolutionSlice = createSlice({
  name: 'evolution',
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
    setSelectedPopulation: (state, action) => {
      state.selectedPopulation = action.payload;
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

    // EVOLUTIONPLOTS
    setShowStd: (state, action) => {
      state.showStds = action.payload;
    },
    setShowMeans: (state, action) => {
      state.showMeans = action.payload;
    },
    setMeanPointSize: (state, action) => {
      state.meanPointSize = action.payload;
    },
    setSubjectPointSize: (state, action) => {
      state.subjectPointSize = action.payload;
    },
    setMeanStrokeWidth: (state, action) => {
      state.meanStrokeWidth = action.payload;
    },
    setSubjectStrokeWidth: (state, action) => {
      state.subjectStrokeWidth = action.payload;
    },
    setBlurGroups: (state, action) => {
      state.blurGroups = action.payload;
    },
    setHideGroups: (state, action) => {
      state.hideGroups = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startWorker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(startWorker.rejected, (state, action) => {
        state.loading = false;
        const configuration = {
          message: 'Error computing data on worker',
          description: action.payload,
          type: 'error',
          pauseOnHover: true
        };
        publish('notification', configuration);
      });
  }
});

export default evolutionSlice.reducer;
export const {
  setInit,
  setIsNumeric,

  setSelectedVar,
  setSelectedPopulation,
  setNBars,
  setPValue,
  setDesc,
  setFilteringList,
  addFilteringVariable,
  setResult,

  setShowStd,
  setShowMeans,
  setMeanPointSize,
  setSubjectPointSize,
  setMeanStrokeWidth,
  setSubjectStrokeWidth,
  setBlurGroups,
  setHideGroups
} = evolutionSlice.actions;
