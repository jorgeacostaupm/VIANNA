import { createAsyncThunk } from "@reduxjs/toolkit";
import * as aq from "arquero";

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export const generateAggregation = createAsyncThunk(
  "dataframe/agg-generate",
  async ({ colName, formula }, { getState }) => {
    try {
      const dt = getState().dataframe.dataframe;
      const qt = getState().cantab.quarantineData;

      const data =
        dt && dt.length > 0
          ? aq
              .from(dt)
              .derive({ [colName]: formula }, { drop: false })
              .objects()
          : null;

      const quarantineData =
        qt && qt.length > 0
          ? aq
              .from(qt)
              .derive({ [colName]: formula }, { drop: false })
              .objects()
          : null;

      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      throw "Aggregation failed";
    }
  }
);

export const generateAggregationBatch = createAsyncThunk(
  "dataframe/agg-generate-batch",
  async ({ cols }, { getState }) => {
    try {
      const formated = {};
      cols.forEach((m) => {
        if (m?.info?.exec) formated[m.name] = m.info.exec;
      });

      const dt = getState().dataframe.dataframe;
      const qt = getState().cantab.quarantineData;

      console.log("DAT", dt);

      const data =
        dt && dt.length > 0
          ? aq.from(dt).derive(formated, { drop: false }).objects()
          : null;

      const quarantineData =
        qt && qt.length > 0
          ? aq.from(qt).derive(formated, { drop: false }).objects()
          : null;

      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      throw "Some aggregation has failed";
    }
  }
);

export const generateEmpty = createAsyncThunk(
  "dataframe/agg-empty",
  async ({ colName }, { getState }) => {
    try {
      const state = getState().dataframe;
      const result = aq
        .from(state.dataframe)
        .derive({ [colName]: () => null }, { drop: false })
        .objects();
      return result;
    } catch (error) {
      throw "Empty aggregation failed";
    }
  }
);

export const removeColumn = createAsyncThunk(
  "dataframe/remove-col",
  async ({ colName }, { getState }) => {
    try {
      const state = getState().dataframe;
      const removed = [colName];
      const result = aq.from(state.dataframe).select(aq.not(removed)).objects();
      return result;
    } catch (error) {
      throw "Failed to remove attribute";
    }
  }
);

export const removeBatch = createAsyncThunk(
  "dataframe/remove-batch",
  async ({ cols }, { getState }) => {
    try {
      const state = getState().dataframe;
      const result = aq.from(state.dataframe).select(aq.not(cols)).objects();
      return result;
    } catch (error) {
      throw "Failed to batch remove";
    }
  }
);
