import { createRoot } from "react-dom/client";
import App from "./App";

import { store } from "./store/store";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import "./index.css";

const persistor = persistStore(store);
const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
