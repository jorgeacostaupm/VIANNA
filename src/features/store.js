import cantabReducer from "./cantab/cantabSlice";
import compareReducer from "./compare/compareSlice";
import evolutionReducer from "./evolution/evolutionSlice";
import correlationReducer from "./correlation/correlationSlice";
import dataReducer from "./data/dataSlice";
import metaReducer from "./metadata/metaSlice";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  createStateSyncMiddleware,
  withReduxStateSync,
} from "redux-state-sync";

const root_reducer = combineReducers({
  cantab: cantabReducer,
  compare: compareReducer,
  evolution: evolutionReducer,
  correlation: correlationReducer,
  metadata: metaReducer,
  dataframe: dataReducer,
});

const store = configureStore({
  reducer: withReduxStateSync(root_reducer),
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      immutableStateInvariant: false,
    }).concat(createStateSyncMiddleware());
    return middlewares;
  },
});

export default store;
