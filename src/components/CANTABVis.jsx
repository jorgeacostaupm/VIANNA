import store from "@/features/store";
import { Provider } from "react-redux";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import MainApp from "./MainApp";
import ComparisonApp from "./Compare/ComparisonApp";
import EvolutionApp from "./Evolution/EvolutionApp";
import HierarchyApp from "./Hierarchy/HierarchyApp";
import QuarantineApp from "./Quarantine/QuarantineApp";
import CorrelationApp from "./Correlation/CorrelationApp";

import "./styles.css";

export default function CANTABVis() {
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
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
