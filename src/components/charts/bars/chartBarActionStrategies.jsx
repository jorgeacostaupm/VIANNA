import React from "react";
import {
  SettingOutlined,
  ExperimentOutlined,
  InfoCircleFilled,
  CloseOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import DownloadButton from "@/components/buttons/ui/DownloadButton";
import ViewRecordsDownloadButton from "@/components/buttons/ui/ViewRecordsDownloadButton";
import { AppButton, APP_BUTTON_PRESETS, APP_BUTTON_VARIANTS } from "@/components/buttons/core";
import PopoverButton from "@/components/buttons/ui/PopoverButton";

const DEFAULT_CHART_BAR_ACTION_ORDER = Object.freeze([
  "sync",
  "records-export",
  "download",
  "info",
  "settings",
  "tests",
  "close",
]);

function buildSyncAction({ isSync, updateConfig }) {
  if (typeof updateConfig !== "function") return null;

  return (
    <AppButton
      preset={APP_BUTTON_PRESETS.TOOLBAR_ICON}
      key="sync"
      tooltip={
        isSync
          ? "Disable sync with Explorer selection"
          : "Enable sync with Explorer selection"
      }
      icon={<SyncOutlined />}
      onClick={() => updateConfig("isSync", !isSync)}
      variant={
        isSync ? APP_BUTTON_VARIANTS.TOOLBAR : APP_BUTTON_VARIANTS.TOOLBAR_MUTED
      }
    />
  );
}

function buildRecordsExportAction({ recordsExport }) {
  return recordsExport ? (
    <ViewRecordsDownloadButton key="records-export" {...recordsExport} />
  ) : null;
}

function buildDownloadAction({ svgIDs, title }) {
  return svgIDs ? (
    <DownloadButton key="download" svgIds={svgIDs} filename={`${title}`} />
  ) : null;
}

function buildInfoAction({ info }) {
  return info ? (
    <PopoverButton
      key="info"
      content={info}
      icon={<InfoCircleFilled />}
      title="Info"
    />
  ) : null;
}

function buildSettingsAction({ settings }) {
  return settings ? (
    <PopoverButton
      key="settings"
      content={settings}
      icon={<SettingOutlined />}
      title="Settings"
      panelWidth={400}
    />
  ) : null;
}

function buildTestsAction({ testsSettings }) {
  return testsSettings ? (
    <PopoverButton
      key="tests"
      content={testsSettings}
      icon={<ExperimentOutlined />}
      title="Tests"
      panelWidth={400}
    />
  ) : null;
}

function buildCloseAction({ remove }) {
  return remove ? (
    <AppButton
      preset={APP_BUTTON_PRESETS.TOOLBAR_ICON}
      key="close"
      tooltip="Close"
      icon={<CloseOutlined />}
      onClick={remove}
    />
  ) : null;
}

const DEFAULT_ACTION_BUILDERS = Object.freeze({
  sync: buildSyncAction,
  "records-export": buildRecordsExportAction,
  download: buildDownloadAction,
  info: buildInfoAction,
  settings: buildSettingsAction,
  tests: buildTestsAction,
  close: buildCloseAction,
});

function resolveConfiguredActions({ actions, context }) {
  if (typeof actions === "function") {
    const generated = actions(context);
    return Array.isArray(generated) ? generated : [];
  }
  if (Array.isArray(actions)) {
    return actions;
  }
  return DEFAULT_CHART_BAR_ACTION_ORDER.map((id) =>
    DEFAULT_ACTION_BUILDERS[id]?.(context),
  );
}

function materializeAction(action, context, index) {
  if (typeof action === "function") {
    return action(context, index);
  }
  return action;
}

export function resolveChartBarActions({ actions, context }) {
  return resolveConfiguredActions({ actions, context })
    .map((action, index) => materializeAction(action, context, index))
    .filter(Boolean);
}
