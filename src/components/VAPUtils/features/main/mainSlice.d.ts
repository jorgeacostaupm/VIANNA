/* eslint-disable @typescript-eslint/no-explicit-any */
// Import necessary types from Redux Toolkit
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

// Define the module for cantabSlice
declare module './mainSlice' {
  // Define the types for each action creator
export const setLoading: ActionCreatorWithPayload<boolean>;
export const setMatrices: ActionCreatorWithPayload<any[]>;
export const setTypes: ActionCreatorWithPayload<any[]>;
export const setMeasures: ActionCreatorWithPayload<any[]>;
export const setDiffMeasures: ActionCreatorWithPayload<any[]>;
export const setBands: ActionCreatorWithPayload<any[]>;
export const setOriginalBands: ActionCreatorWithPayload<any[]>;
export const setFilteringExpr: ActionCreatorWithPayload<string>;
export const setBoolMatrix: ActionCreatorWithPayload<any[]>;
export const setPopulations: ActionCreatorWithPayload<any[]>;
export const setStatistics: ActionCreatorWithPayload<any[]>;
export const setAtlas: ActionCreatorWithPayload<any | null>;
export const setIsAllowed: ActionCreatorWithPayload<boolean>;
export const setScenarioRunId: ActionCreatorWithPayload<string | null | undefined>;
}
