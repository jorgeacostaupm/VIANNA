import * as d3 from "d3";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { deepCopy, moveTooltip } from "@/utils/functions";
import { numMargin, renderLegend } from "../Density/useDensity";
import useResizeObserver from "@/utils/useResizeObserver";

export default function useViolinplot({ chartRef, legendRef, data }) {
  const dimensions = useResizeObserver(chartRef);
  const groups = useSelector((s) => s.cantab.present.groups);
  const selectionGroups = useSelector((s) => s.cantab.present.selectionGroups);

  useEffect(() => {
    if (!dimensions || !data || !chartRef.current || !legendRef.current) return;

    const { width, height } = dimensions;

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(legendRef.current).selectAll("*").remove();

    const colorScheme = d3.schemeCategory10;
    const chartWidth = width - numMargin.left - numMargin.right;
    const chartHeight = height - numMargin.top - numMargin.bottom;

    let tooltip = d3.select("body").select("div.tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    const svg = d3.select(chartRef.current);
    const legend = d3.select(legendRef.current);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${numMargin.left},${numMargin.top})`);

    let tmp = deepCopy(groups).sort();
    const color = d3.scaleOrdinal().domain(tmp).range(colorScheme);

    // X for groups
    tmp = deepCopy(selectionGroups).sort();
    const x = d3.scaleBand().domain(tmp).range([0, chartWidth]).padding(0.4);

    const minVal = d3.min(data, (d) => d.value);
    const maxVal = d3.max(data, (d) => d.value);

    const padding = (maxVal - minVal) * 0.2;

    const y = d3
      .scaleLinear()
      .domain([minVal - padding, maxVal + padding]) // ⬅ extra space
      .nice()
      .range([chartHeight, 0]);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    chart.append("g").call(d3.axisLeft(y));

    // Group data
    const grouped = d3.group(data, (d) => d.type);

    // KDE setup
    const kde = kernelDensityEstimator(
      kernelEpanechnikov(7),
      y.ticks(50) // smoother violin
    );

    // Group <g> for each violin
    const groupsG = chart
      .selectAll(".violinplot")
      .data(groups)
      .join("g")
      .attr("class", "violinplot")
      .attr("transform", (d) => `translate(${x(d)},0)`);

    groupsG.each(function (group) {
      const g = d3.select(this);
      const values = (grouped.get(group) || []).map((d) => d.value);

      if (values.length === 0) return;

      // Compute density
      const density = kde(values);

      // Horizontal scale for density width
      const xNum = d3
        .scaleLinear()
        .range([0, x.bandwidth()])
        .domain([0, d3.max(density, (d) => d[1])]);

      // Shape (area)
      const area = d3
        .area()
        .x0((d) => -xNum(d[1]) / 2)
        .x1((d) => xNum(d[1]) / 2)
        .y((d) => y(d[0]))
        .curve(d3.curveCatmullRom);

      // Draw violin
      g.append("path")
        .datum(density)
        .attr("d", area)
        .attr("fill", color(group))
        .attr("stroke", "grey")
        .attr("transform", `translate(${x.bandwidth() / 2},0)`)
        .on("mouseover", function () {
          tooltip.style("visibility", "visible").html(
            `
              <strong>${group}</strong><br/>
              n = ${values.length}<br/>
              min: ${d3.min(values).toFixed(2)}<br/>
              max: ${d3.max(values).toFixed(2)}<br/>
              mean: ${d3.mean(values).toFixed(2)}
            `
          );
        })
        .on("mousemove", (e) => moveTooltip(e, tooltip, chart))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    });

    renderLegend(legend, selectionGroups, color);
  }, [data, dimensions, groups, selectionGroups]);
}

// --------------- KDE Functions ------------------

function kernelDensityEstimator(kernel, X) {
  return function (sample) {
    return X.map((x) => [x, d3.mean(sample, (v) => kernel(x - v))]);
  };
}

function kernelEpanechnikov(k) {
  return function (v) {
    v = v / k;
    return Math.abs(v) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}
