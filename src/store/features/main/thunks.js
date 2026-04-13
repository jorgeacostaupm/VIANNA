import { DATASETS, ORDER_VARIABLE } from "@/utils/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setDataframe } from "../dataframe/slice";
import { pickColumns } from "@/utils/functions";
import { updateData } from "../dataframe/thunks";
import { updateDescriptions, updateHierarchy } from "../metadata/thunks";
import {
  fetchDescriptionsCSV,
  fetchHierarchy,
  fetchTestData,
} from "./utils/services";

const { dataPath, hierarchyPath, descriptionsPath, idVar } = import.meta.env
  .PROD
  ? DATASETS.prod
  : DATASETS.dev;

export const setTimeVar = createAsyncThunk(
  "main/setTimeVar",
  async (timeVar) => {
    return { timeVar };
  },
);

export const setGroupVar = createAsyncThunk(
  "main/setGroupVar",
  async (groupVar) => {
    return { groupVar };
  },
);

export const setIdVar = createAsyncThunk("main/setIdVar", async (nextIdVar) => {
  return { idVar: nextIdVar };
});

export const loadDemoData = createAsyncThunk(
  "main/loadDemoData",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const [data, hierarchy, descriptions] = await Promise.all([
        fetchTestData(dataPath),
        fetchHierarchy(hierarchyPath),
        fetchDescriptionsCSV(descriptionsPath),
      ]);

      await dispatch(
        updateData({
          data,
          isGenerateHierarchy: true,
          filename: dataPath,
          silentSuccess: true,
        }),
      ).unwrap();

      await dispatch(
        updateHierarchy({
          hierarchy,
          filename: hierarchyPath,
          silentSuccess: true,
        }),
      ).unwrap();

      await dispatch(
        updateDescriptions({
          descriptions,
          filename: descriptionsPath,
          silentSuccess: true,
        }),
      ).unwrap();

      await dispatch(setIdVar(idVar)).unwrap();

      return true;
    } catch (error) {
      const isNestedThunkError = typeof error === "string";
      const message =
        error?.message ||
        (typeof error === "string" && error.trim().length > 0
          ? error
          : "Could not load demo data");

      return rejectWithValue({
        message,
        shouldNotify: !isNestedThunkError,
      });
    }
  },
);

export const nullsToQuarantine = createAsyncThunk(
  "main/nulls-to-quarantine",
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const originalDt = getState().dataframe.dataframe;
      const cols = getState().dataframe.navioColumns;

      const visibleData = pickColumns(originalDt, cols);

      const idsWithNull = visibleData.filter((row) =>
        Object.values(row).some(
          (value) =>
            value === null ||
            value === undefined ||
            (typeof value === "number" && isNaN(value)),
        ),
      );

      if (idsWithNull.length === 0) return;

      const data = originalDt.filter(
        (row) =>
          !idsWithNull.some((r) => r[ORDER_VARIABLE] === row[ORDER_VARIABLE]),
      );
      dispatch(setDataframe(data));

      const quarantineData = originalDt.filter((row) =>
        idsWithNull.some((r) => r[ORDER_VARIABLE] === row[ORDER_VARIABLE]),
      );

      return { quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating values");
    }
  },
);
