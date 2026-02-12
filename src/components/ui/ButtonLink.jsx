import React from "react";
import { Apps } from "@/utils/Constants";
import PanelButton from "./PanelButton";

const APP_ROUTE_MAP = {
  overview: Apps.OVERVIEW,
  metadata: Apps.HIERARCHY,
  compare: Apps.COMPARE,
  correlation: Apps.CORRELATION,
  evolution: Apps.EVOLUTION,
  cantab: Apps.QUARANTINE,
};

const APP_WINDOW_TARGET_MAP = {
  overview: "vianna-app-overview",
  metadata: "vianna-app-metadata",
  compare: "vianna-app-compare",
  evolution: "vianna-app-evolution",
  correlation: "vianna-app-correlation",
  cantab: "vianna-app-cantab",
};

const buildAppUrl = (route) => {
  const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  return route ? `${base}#/${route}` : `${base}#/`;
};

export default function LinkButton({ to, icon }) {
  const route = to || "";
  const routePath = route === "overview" ? "" : route;
  const appName = APP_ROUTE_MAP[route] || route;
  const targetName = APP_WINDOW_TARGET_MAP[route] || `vianna-app-${route}`;

  const tooltipTitle = `Open or focus ${appName}`;

  const handleOpenTab = () => {
    if (!route) return;

    const appWindow = window.open(buildAppUrl(routePath), targetName);
    if (appWindow && typeof appWindow.focus === "function") {
      appWindow.focus();
    }
  };

  return (
    <PanelButton title={tooltipTitle} onClick={handleOpenTab} icon={icon} />
  );
}
