import cantabReducer from "./slices/cantabSlice";
import compareReducer from "./slices/compareSlice";
import evolutionReducer from "./slices/evolutionSlice";
import correlationReducer from "./slices/correlationSlice";
import dataReducer from "./slices/dataSlice";
import metaReducer from "./slices/metaSlice";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  initializeSharedStateSync,
  sharedStateSyncMiddleware,
  withSharedStateSyncReducer,
} from "./sharedStateSync";

const baseReducer = combineReducers({
  cantab: cantabReducer,
  compare: compareReducer,
  evolution: evolutionReducer,
  correlation: correlationReducer,
  metadata: metaReducer,
  dataframe: dataReducer,
});

const reducer = withSharedStateSyncReducer(baseReducer);

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      immutableStateInvariant: false,
    }).concat(sharedStateSyncMiddleware),
});

let syncInitializationPromise = null;

export const initializeStoreSync = () => {
  if (!syncInitializationPromise) {
    syncInitializationPromise = Promise.resolve(
      initializeSharedStateSync(store),
    );
  }
  return syncInitializationPromise;
};

export default store;
