import { createSlice } from "@reduxjs/toolkit";
import { pubsub } from "@/utils/pubsub";

const { publish } = pubsub;

const initialState = {
  init: false,
  is_scatter: true,
  columns: [],
  points_size: 5,
  selectedChart: null,

  selectedPopulations: [],

  result: [],
  loading: false,

  isOnlyCorrelations: false,
  nVariables: 10,
};

const correlationSlice = createSlice({
  name: "correlation",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },
    setIsScatter: (state, action) => {
      state.is_scatter = action.payload;
    },
    setColumns: (state, action) => {
      state.columns = action.payload;
    },
    setPointsSize: (state, action) => {
      state.points_size = action.payload;
    },
    setIsOnlyCorrelations: (state, action) => {
      state.isOnlyCorrelations = action.payload;
    },
    setNVariables: (state, action) => {
      state.nVariables = action.payload;
    },
    setSelectedPopulations: (state, action) => {
      state.selectedPopulations = action.payload;
    },
    setSelectedChart: (state, action) => {
      state.selectedChart = action.payload;
    },
  },

  extraReducers: (builder) => {},
});

export default correlationSlice.reducer;
export const {
  setInit,
  setIsScatter,
  setColumns,
  setPointsSize,
  setIsOnlyCorrelations,
  setNVariables,
  setSelectedPopulations,
  setSelectedChart,
} = correlationSlice.actions;
