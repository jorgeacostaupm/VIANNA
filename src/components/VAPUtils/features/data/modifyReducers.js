import { createAsyncThunk } from '@reduxjs/toolkit';
import { not } from 'arquero';
import { setDataframe } from './dataSlice';
import * as aq from 'arquero';

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export const generateAggregation = createAsyncThunk(
  'dataframe/agg-generate',
  async ({ colName, formula }, { getState, dispatch }) => {
    return new Promise((resolve, reject) => {
      const state = deepCopy(getState().dataframe);
      try {
        const result = aq
          .from(state.dataframe)
          .derive({ [colName]: formula }, { drop: false })
          .objects();
        dispatch(setDataframe(result));
        resolve(result);
      } catch (error) {
        console.error(error);
        reject('Failed to create the aggregation ');
      }
    });
  }
);

export const generateAggregationBatch = createAsyncThunk(
  'dataframe/agg-generate-batch',
  async ({ cols }, { getState }) => {
    return new Promise((resolve, reject) => {
      let formated = {};
      cols.forEach((m) => {
        if (m?.info?.exec) formated[m.name] = m.info.exec;
      });
      try {
        const state = getState().dataframe;
        const result = aq.from(state.dataframe).derive(formated, { drop: false }).objects();
        resolve(result);
      } catch (error) {
        console.error(error);
        reject('Failed to create the aggregation ');
      }
    });
  }
);

export const generateEmpty = createAsyncThunk(
  'dataframe/agg-empty',
  async ({ colName }, { getState }) => {
    return new Promise((resolve, reject) => {
      const state = getState().dataframe;
      try {
        const result = aq
          .from(state.dataframe)
          .derive({ [colName]: (r) => null }, { drop: false })
          .objects();
        resolve(result);
      } catch (error) {
        reject('Failed to create the aggregation');
      }
    });
  }
);

export const removeColumn = createAsyncThunk(
  'dataframe/remove-col',
  async ({ colName }, { getState }) => {
    return new Promise((resolve, reject) => {
      const state = getState().dataframe;
      try {
        console.log('REMOVING COLUMN');
        const removed = [colName];
        const result = aq.from(state.dataframe).select(not(removed)).objects();
        resolve(result);
      } catch (error) {
        reject('Failed to remove attribute');
      }
    });
  }
);

export const removeBatch = createAsyncThunk(
  'dataframe/remove-batch',
  async ({ cols }, { getState }) => {
    return new Promise((resolve, reject) => {
      const state = getState().dataframe;
      try {
        const result = aq.from(state.dataframe).select(not(cols)).objects();
        resolve(result);
      } catch (error) {
        reject('Failed to remove attribute');
      }
    });
  }
);
