import { createViewModel } from "@/components/charts/view/createViewModel";

export function createCorrelationViewModel({
  title,
  hoverTitle,
  svgIDs,
  info,
  settings,
  testsSettings,
  chart,
  remove,
  config,
  setConfig,
  recordsExport,
  actions,
  style,
  className,
} = {}) {
  return createViewModel({
    title,
    hoverTitle,
    svgIDs,
    info,
    settings,
    testsSettings,
    chart,
    remove,
    config,
    setConfig,
    recordsExport,
    actions,
    style,
    className,
  });
}
