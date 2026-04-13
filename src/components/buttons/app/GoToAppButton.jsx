import React from "react";
import { useSelector } from "react-redux";
import { selectAppOpenMode } from "@/store/features/main";
import { getAppNavigation } from "@/navigation/apps";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";

const buildAppUrl = (route) => {
  const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  return route ? `${base}#/${route}` : `${base}#/`;
};

export default function GoToAppButton({ to }) {
  const appConfig = getAppNavigation(to);
  const Icon = appConfig?.icon;
  const appOpenMode = useSelector(selectAppOpenMode);
  if (!appConfig || !Icon) return null;
  const routePath = appConfig.path;
  const appName = appConfig.label;
  const targetName = appOpenMode === "tab" ? "_blank" : appConfig.windowName;

  const tooltipTitle =
    appOpenMode === "tab"
      ? `Open ${appName} in a new tab`
      : `Open or focus ${appName}`;

  const handleOpenTab = () => {
    const appWindow = window.open(buildAppUrl(routePath), targetName);
    if (appWindow && typeof appWindow.focus === "function") {
      appWindow.focus();
    }
  };

  return (
    <AppButton
      preset={APP_BUTTON_PRESETS.PANEL_ICON}
      tooltip={tooltipTitle}
      ariaLabel={tooltipTitle}
      onClick={handleOpenTab}
      icon={<Icon />}
    />
  );
}
