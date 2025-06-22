import { createSlice } from "@reduxjs/toolkit";
import { pubsub } from "@/utils/pubsub";
const { publish } = pubsub;

const initialState = {
  init: false,

  selectedVar: null,
  selectedTest: null,
  selectedPopulation: null,
  nBars: 15,
  desc: true,
  filterList: [],
  isNumeric: true,
  pValue: 0.05,

  blurGroups: [],
  hideGroups: [],

  result: null,
  loading: false,
};

const evolutionSlice = createSlice({
  name: "evolution",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },

    // BARPLOT
    setSelectedVar: (state, action) => {
      state.selectedVar = action.payload;
    },
    setSelectedTest: (state, action) => {
      state.selectedTest = action.payload;
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
  },
  extraReducers: (builder) => {},
});

export default evolutionSlice.reducer;
export const {
  setInit,

  setSelectedVar,
  setSelectedTest,
  setSelectedPopulation,
  setNBars,
  setPValue,
  setDesc,
  setFilteringList,
  addFilteringVariable,
  setResult,
} = evolutionSlice.actions;
