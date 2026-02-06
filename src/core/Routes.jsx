import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import MainApp from "@/apps/main";
import CompareApp from "@/apps/compare";
import EvolutionApp from "@/apps/evolution";
import CorrelationApp from "@/apps/correlation";
import QuarantineApp from "@/apps/quarantine/QuarantineApp";
import HierarchyApp from "@/apps/hierarchy/HierarchyApp";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="cantab" element={<QuarantineApp />} />
        <Route path="compare" element={<CompareApp />} />
        <Route path="evolution" element={<EvolutionApp />} />
        <Route path="correlation" element={<CorrelationApp />} />
        <Route path="metadata" element={<HierarchyApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
