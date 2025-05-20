import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import createWorker from '../workers/workerCreator';
import { pubsub } from '../../../VAPUtils/pubsub';
const { publish } = pubsub;
import { computeCorrelationMatrixData } from '../../functions';

const initialState = {
  init: false,
  is_scatter: true,
  columns: [],
  points_size: 5,

  selectedPopulations: [],

  result: [],
  loading: false,

  isOnlyCorrelations: false,
  nVariables: 10
};

export const startWorker = createAsyncThunk(
  'correlation/startWorker',
  async (d, { rejectWithValue }) => {
    try {
      const [data, columns, groups, groupVar] = d;
      const result = computeCorrelationMatrixData(data, columns, groups, groupVar);
      console.log(result);
      return result;
    } catch (error) {
      console.error('Error starting worker:', error);
      return rejectWithValue(error.message || 'Failed to start worker');
    }
  }
);

const correlationSlice = createSlice({
  name: 'correlation',
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

export default correlationSlice.reducer;
export const {
  setInit,
  setIsScatter,
  setColumns,
  setPointsSize,
  setIsOnlyCorrelations,
  setNVariables,
  setSelectedPopulations
} = correlationSlice.actions;
