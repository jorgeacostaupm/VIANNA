import { createSlice } from "@reduxjs/toolkit";
import { updateData } from "../async/dataAsyncReducers";

const initialState = {
  init: false,
  groupVar: null,
  timeVar: null,
  selectedVar: null,
};

const evolutionSlice = createSlice({
  name: "evolution",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },
    setSelectedVar: (state, action) => {
      state.selectedVar = action.payload;
    },
    setGroupVar: (state, action) => {
      state.groupVar = action.payload;
    },
    setTimeVar: (state, action) => {
      state.timeVar = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(updateData.fulfilled, (state) => {
      state.groupVar = null;
      state.timeVar = null;
      state.selectedVar = null;
    });
  },
});

export default evolutionSlice.reducer;
export const { setInit, setSelectedVar, setGroupVar, setTimeVar } =
  evolutionSlice.actions;
