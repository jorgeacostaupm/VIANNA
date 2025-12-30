import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  init: false,
  selectedChart: null,
};

const correlationSlice = createSlice({
  name: "correlation",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },
    setSelectedChart: (state, action) => {
      state.selectedChart = action.payload;
    },
  },
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
