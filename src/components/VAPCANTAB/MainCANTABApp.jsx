// src/MainCANTABApp.tsx
import store from "@/components/VAPUtils/features/store";
import { Provider } from "react-redux";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { initStateWithPrevTab } from "redux-state-sync";
import CANTABApp from "../VAPCANTAB/CANTABApp";
import ComparisonApp from "./Compare/ComparisonApp";
import EvolutionApp from "./Evolution/EvolutionApp";
import CorrelationApp from "./Correlation/CorrelationApp";
import HierarchyEditorApp from "./Hierarchy/editor/HierarchyEditorApp";
import "./vis.css";

export default function MainCANTABApp() {
  initStateWithPrevTab(store);
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<CANTABApp />} />
          <Route path="compare" element={<ComparisonApp />} />
          <Route path="evolution" element={<EvolutionApp />} />
          <Route path="correlation" element={<CorrelationApp />} />
          <Route path="metadata" element={<HierarchyEditorApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}
