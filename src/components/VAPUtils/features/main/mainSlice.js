import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { updateAtlas } from "../atlas/atlasSlice";
import { setSelectedIds, updateAtlasOrder } from "../atlas/atlasSlice";
import { pubsub } from "@/components/VAPUtils/pubsub";
const { publish } = pubsub;

const initialState = {
  loading: false,
  matrices: [],
  types: [],
  measures: [],
  diff_measures: [],
  bands: [],
  original_bands: [],
  filtering_expr: "",
  bool_matrix: [],
  populations: [],
  statistics: [],
  atlas: null,
  base: null,
  isAllowed: false,
  scenarioRunId: null,
};

function manageAtlas(data, dispatch, getState, options) {
  const matrix_order = data.matrix_order;
  const base = data.base;

  const actual_base = getState().atlas.atlas_3d?.base;
  const actual_matrix_order = getState().atlas.matrix_order;

  if (
    actual_base === base &&
    JSON.stringify(actual_matrix_order) === JSON.stringify(matrix_order)
  )
    return;

  if (actual_base != base) {
    const atlases = getState().atlas.atlases;
    const atlas = atlases.find((atlas) => atlas.base === base);
    dispatch(updateAtlas({ atlas, options }));
  }

  if (JSON.stringify(actual_matrix_order) != JSON.stringify(matrix_order)) {
    dispatch(updateAtlasOrder(matrix_order));
  }
}

export const updateData = createAsyncThunk(
  "main/updateData",
  async (data, { getState, rejectWithValue, dispatch }) => {
    try {
      console.log("data to request", data);
      const response = await axios.post(data.url, data.data);
      console.log("response data", response.data);
      const conn_data = response.data;
      manageAtlas(conn_data, dispatch, getState, data.options);
      return conn_data;
    } catch (error) {
      return rejectWithValue(error.message || "Error retrieving data");
    }
  }
);

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setIsAllowed: (state, action) => {
      state.isAllowed = action.payload;
    },
    setData: (state, action) => {
      console.log("------> NEW DATA SETTED ON MAIN <------");
      const {
        matrices,
        bands,
        original_bands,
        statistics,
        measures,
        diff_measures,
        types,
        populations,
        atlas,
        base,
      } = action.payload;
      state.matrices = matrices;
      state.bands = bands;
      state.original_bands = original_bands;
      state.statistics = statistics;
      state.measures = measures;
      state.diff_measures = diff_measures;
      state.types = types;
      state.populations = populations;
      state.atlas = atlas;
      state.base = base;
    },

    setFilteringExpr: (state, action) => {
      state.filtering_expr = action.payload;
    },
    setBoolMatrix: (state, action) => {
      state.bool_matrix = action.payload;
    },
    setActiveMeasure: (state, action) => {
      const payload = action.payload;
      state.measures = state.measures.map((measure) =>
        measure.acronim === payload.acronim
          ? { ...measure, active: payload.active }
          : measure
      );
    },
    setActiveBand: (state, action) => {
      const payload = action.payload;
      state.bands = state.bands.map((band) =>
        band.acronim === payload.acronim
          ? { ...band, active: payload.active }
          : band
      );
    },
    setScenarioRunId(state, action) {
      state.scenarioRunId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateData.pending, (state, action) => {
      state.loading = true;
    }),
      builder.addCase(updateData.fulfilled, (state, action) => {
        state.loading = false;
        const {
          matrices,
          bands,
          original_bands,
          statistics,
          measures,
          diff_measures,
          types,
          populations,
          atlas,
          base,
        } = action.payload;
        state.matrices = matrices;
        state.bands = bands;
        state.original_bands = original_bands;
        state.statistics = statistics;
        state.measures = measures;
        state.diff_measures = diff_measures;
        state.types = types;
        state.populations = populations;
        state.atlas = atlas;
        state.base = base;

        const configuration = {
          message: "Data Loaded",
          description: "",
          placement: "bottomRight",
          type: "success",
        };
        publish("notification", configuration);
      }),
      builder.addCase(updateData.rejected, (state, action) => {
        state.loading = false;
        console.error(action.payload);
      });
  },
});

export default mainSlice.reducer;
export const {
  setLoading,
  setData,
  setFilteringExpr,
  setBoolMatrix,
  setActiveMeasure,
  setActiveBand,
  setIsAllowed,
  setScenarioRunId,
} = mainSlice.actions;
