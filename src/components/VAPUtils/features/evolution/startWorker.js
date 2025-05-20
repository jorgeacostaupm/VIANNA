import createWorker from '../workers/workerCreator';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const { sendMessageToWorker, terminateWorker } = createWorker('evolution');

export const startWorker = createAsyncThunk(
  'evolution/startWorker',
  async (data, { rejectWithValue }) => {
    try {
      const result = await sendMessageToWorker(data);
      return result;
    } catch (error) {
      console.error('Error starting worker:', error);
      return rejectWithValue(error.message || 'Failed sending message to worker');
    }
  }
);
