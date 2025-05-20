import { configureStore } from "@reduxjs/toolkit";
import metaReducer from "@/components/VAPUtils/features/metadata/metaSlice";
import dataReducer from "@/components/VAPUtils/features/data/dataSlice";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storageSession from "redux-persist/lib/storage/session";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import FrameSerializeTransform from "./transform";

const DataFrameConfig = {
  key: "dataframe",
  version: 1,
  storage: storageSession,
  stateReconciler: hardSet,
  transforms: [FrameSerializeTransform],
};

const MetaDataConfig = {
  key: "metadata",
  version: 1,
  storage: storageSession,
};

export const store = configureStore({
  reducer: {
    dataframe: dataReducer,
    metadata: metaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // immutableCheck: true,
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "dataframe/load-api/fulfilled",
          "dataframe/load-csv/fulfilled",
          "dataframe/load-excel/fulfilled",
          "dataframe/agg-generate/fulfilled",
          "dataframe/agg-generate-batch/fulfilled",
          "dataframe/agg-empty/fulfilled",
          "dataframe/remove-col/fulfilled",
          "dataframe/remove-batch/fulfilled",
          "meta/build-auto-create",
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
        // Ignore these paths in the state
        ignoredPaths: ["dataframe.dataframe"],
      },
      immutableStateInvariant: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});
