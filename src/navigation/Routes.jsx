import { useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import MainApp from "@/apps/main";
import CompareApp from "@/apps/compare";
import EvolutionApp from "@/apps/evolution";
import CorrelationApp from "@/apps/correlation";
import QuarantineApp from "@/apps/quarantine/QuarantineApp";
import HierarchyApp from "@/apps/hierarchy/HierarchyApp";
import {
  APP_NAV,
  getAppTitleByPathname,
  getAppWindowNameByPathname,
} from "@/navigation/apps";

function RoutedViews() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getAppTitleByPathname(pathname);
    window.name = getAppWindowNameByPathname(pathname);
  }, [pathname]);

  return (
    <Routes>
      <Route path={APP_NAV.overview.path} element={<MainApp />} />
      <Route path={APP_NAV.hierarchy.path} element={<HierarchyApp />} />
      <Route path={APP_NAV.quarantine.path} element={<QuarantineApp />} />
      <Route path={APP_NAV.comparison.path} element={<CompareApp />} />
      <Route path={APP_NAV.evolution.path} element={<EvolutionApp />} />
      <Route path={APP_NAV.correlation.path} element={<CorrelationApp />} />

      <Route
        path="*"
        element={<Navigate to={APP_NAV.overview.path} replace />}
      />
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <HashRouter>
      <RoutedViews />
    </HashRouter>
  );
}
