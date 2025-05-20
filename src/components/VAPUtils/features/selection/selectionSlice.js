import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  populations: [],
  subjects: [],
  visits: [],
  measures: null,
  measure_range: [0.3, 1],
  diff_range: [1.6, 7],
  atlas: null,
  bands: [],
  statistics: [],
  loading_populations: false,
  loading_subjects: false,
  error_populations: '',
  error_subjects: ''
};

export const fetchAvailablePopulations = createAsyncThunk(
  'global/fetchAvailablePopulations',
  (payload) => {
    console.log('requesting data with payload ', payload);
    return axios.get(`${API_PATH}/populations/`, payload).then(
      (response) => {
        return response.data;
      },
      (error) => {
        console.log(error);
        return [];
      }
    );
  }
);

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setPopulations: (state, action) => {
      state.populations = action.payload;
    },
    setSubjects: (state, action) => {
      state.selected_subjects = action.payload;
    },
    setVisits: (state, action) => {
      const index = action.payload.index;
      const value = action.payload.value;
      let visits = [...state.visits];
      visits[index] = value;
      state.visits = visits;
    },
    setMeasures: (state, action) => {
      state.measures = action.payload;
    },
    setMeasureRange: (state, action) => {
      state.measure_range = action.payload;
    },
    setDiffRange: (state, action) => {
      state.diff_range = action.payload;
    },
    setAtlas: (state, action) => {
      state.atlas = action.payload;
    },
    setBands: (state, action) => {
      state.bands = action.payload;
    },
    setStatistics: (state, action) => {
      state.statistics = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAvailablePopulations.pending, (state) => {
      state.loading_populations = true;
    });
    builder.addCase(fetchAvailablePopulations.fulfilled, (state, action) => {
      state.loading_populations = false;
      state.available_populations = action.payload.populations;
      state.error = '';
    });
    builder.addCase(fetchAvailablePopulations.rejected, (state, action) => {
      state.loading_populations = false;
      state.available_populations = [];
      state.error = action.error.message;
    });
  }
});

export default selectionSlice.reducer;
export const { setPopulations, setVisits, setMeasures, setAtlas, setBands, setStatistics } =
  selectionSlice.actions;
