import { createSlice } from "@reduxjs/toolkit";
import { updateData } from "../async/dataAsyncReducers";

const initialState = {
  init: false,
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
  },

  extraReducers: (builder) => {
    builder.addCase(updateData.fulfilled, (state) => {
      state.selectedVar = null;
    });
  },
});

export default evolutionSlice.reducer;
export const { setInit, setSelectedVar } = evolutionSlice.actions;
