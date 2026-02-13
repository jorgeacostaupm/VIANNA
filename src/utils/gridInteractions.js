import * as d3 from "d3";

function toSelection(target) {
  if (!target) return null;
  if (typeof target.selectAll === "function") return target;
  return d3.select(target);
}

export function attachTickLabelGridHover({
  axisGroup,
  gridGroup,
  lineSelector = "line",
  includeTick = () => true,
} = {}) {
  const axis = toSelection(axisGroup);
  const grid = toSelection(gridGroup);
  if (!axis || !grid || axis.empty() || grid.empty()) return;

  grid.selectAll(".tick").each(function (tickValue, index, nodes) {
    const line = d3.select(this).select(lineSelector);
    if (line.empty()) return;
    const shouldInclude = includeTick(tickValue, index, nodes);
    line.classed("chart-grid-line", shouldInclude).classed("grid-line-active", false);
  });

  axis
    .selectAll(".tick text")
    .on("mouseover.grid-line-highlight", null)
    .on("mouseout.grid-line-highlight", null);
}

export function attachTickLabelToNearestGridLine({
  axisGroup,
  gridLines,
} = {}) {
  const axis = toSelection(axisGroup);
  const lines = toSelection(gridLines);
  if (!axis || !lines || axis.empty() || lines.empty()) return;

  lines.classed("chart-grid-line", true);
  lines.classed("grid-line-active", false);

  axis
    .selectAll(".tick text")
    .on("mouseover.grid-line-highlight", null)
    .on("mouseout.grid-line-highlight", null);
}

export function paintLayersInOrder({ chartGroup, layers = [] } = {}) {
  const chart = toSelection(chartGroup);
  if (!chart || chart.empty() || !Array.isArray(layers)) return;

  layers.forEach((layer) => {
    const selection = toSelection(layer);
    if (!selection || selection.empty()) return;
    chart.append(() => selection.node());
  });
}
