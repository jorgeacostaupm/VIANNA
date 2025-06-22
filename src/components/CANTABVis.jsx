import store from "@/features/store";
import { Provider } from "react-redux";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { initStateWithPrevTab } from "redux-state-sync";

import App from "./App";
import ComparisonApp from "./Compare/ComparisonApp";
import EvolutionApp from "./Evolution/EvolutionApp";
import CorrelationApp from "./Correlation/CorrelationApp";
import HierarchyApp from "./Hierarchy/HierarchyApp";
import QuarantineApp from "./Quarantine/QuarantineApp";
import "./vis.css";

export default function CANTABVis() {
  initStateWithPrevTab(store);
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="cantab" element={<QuarantineApp />} />
          <Route path="compare" element={<ComparisonApp />} />
          <Route path="evolution" element={<EvolutionApp />} />
          <Route path="correlation" element={<CorrelationApp />} />
          <Route path="metadata" element={<HierarchyApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}
