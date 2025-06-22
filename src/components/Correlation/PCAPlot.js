import * as d3 from "d3";
import styles from "@/utils/Charts.module.css";
import { moveTooltip } from "@/utils/functions";
import renderQTooltip from "@/utils/QuarantineTooltip";
import store from "@/features/store";

export default function drawPCAPlot(data, config, parent, dimensions) {
  if (data.length === 0) return;
  d3.select(parent).selectAll("*").remove();
  const margin = { top: 50, right: 10, bottom: 50, left: 120 };
  const legendRatio = 0.2;
  const chartRatio = 1 - legendRatio;
  const colorScheme = d3.schemeCategory10;

  const { groupVar, pointSize } = config;

  const totalWidth = dimensions.width;
  const totalHeight = dimensions.height;
  const legendWidth = totalWidth * legendRatio;
  const chartAreaWidth = totalWidth * chartRatio;
  const square = Math.min(chartAreaWidth, totalHeight);
  const chartWidth = square - margin.left - margin.right;
  const chartHeight = square - margin.top - margin.bottom;
  const chartSize = Math.min(chartWidth, chartHeight);

  const svg = d3
    .select(parent)
    .append("div")
    .style("width", `${square}px`)
    .style("height", `${square}px`)
    .style("display", "flex")
    .append("svg")
    .attr("id", "chart")
    .attr("width", square)
    .attr("height", square)
    .attr("class", styles.pwSvg);

  const legend = d3
    .select(parent)
    .append("div")
    .style("width", `${legendWidth}px`)
    .style("height", `${chartSize}px`)
    .style("display", "flex")
    .append("svg")
    .attr("id", "chart-legend")
    .attr("width", legendWidth)
    .attr("height", chartSize)
    .attr("class", styles.pwSvg);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  let tooltip = d3.select("body").select("div.tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "tooltip");
  }

  let contextMenuTooltip = d3.select("body").select("div.contextTooltip");
  if (contextMenuTooltip?.empty()) {
    contextMenuTooltip = d3
      .select("body")
      .append("div")
      .attr("class", "contextTooltip")
      .style("display", "none");
  }

  const xExtent = d3.extent(data, (d) => d.pc1);
  const yExtent = d3.extent(data, (d) => d.pc2);

  const xScale = d3.scaleLinear().domain(xExtent).nice().range([0, chartSize]);
  const yScale = d3.scaleLinear().domain(yExtent).nice().range([chartSize, 0]);

  const allGroups = data.map((d) => d[groupVar]);
  const groupSet = new Set(allGroups);
  const groups = Array.from(groupSet);
  const colorScale = d3.scaleOrdinal().domain(groups).range(colorScheme);

  const timeVar = store.getState().cantab.timeVar;
  const idVar = store.getState().cantab.idVar;
  chart
    .append("g")
    .attr("transform", `translate(0,${chartSize})`)
    .call(d3.axisBottom(xScale));

  chart.append("g").call(d3.axisLeft(yScale));

  chart
    .append("text")
    .attr("x", chartSize + 10)
    .attr("y", chartSize + 6)
    .attr("text-anchor", "start");

  chart
    .append("text")
    .attr("x", 0)
    .attr("y", -15)
    .attr("text-anchor", "middle");

  chart
    .selectAll(".dots")
    .data(data)
    .join("circle")
    .attr("class", (d) => "dots " + "group" + d[groupVar])
    .attr("cx", (d) => xScale(d.pc1))
    .attr("cy", (d) => yScale(d.pc2))
    .attr("r", pointSize)
    .attr("fill", (d) => colorScale(d[groupVar]))
    .attr("opacity", 0.7)
    .on("mouseover", (e, d) => {
      const target = e.target;
      d3.select(target).style("stroke", "black").raise();
      let html = `<strong>${d[groupVar]}</strong> <br>`;
      html += `Var 1: ${d.pc1.toFixed(2)}<br> Var 2: ${d.pc2.toFixed(2)} `;
      html += d[idVar] ? `<br>${idVar} : ${d[idVar]}` : "";
      html += d[timeVar] ? `<br>${timeVar} : ${d[timeVar]}` : "";
      tooltip.style("opacity", 1).html(html);
    })
    .on("mousemove", (e) => moveTooltip(e, tooltip, chart))
    .on("mouseout", function (e) {
      const target = e.target;
      d3.select(target).style("stroke", null);
      tooltip.style("opacity", 0);
    })
    .on("contextmenu", function (e, d) {
      e.preventDefault();
      tooltip.style("opacity", 0);
      renderQTooltip(contextMenuTooltip, d, idVar);
      moveTooltip(e, contextMenuTooltip, chart);
    });

  renderLegend();

  function renderLegend() {
    const circleSize = 10;
    const padding = 6;
    const lineHeight = circleSize * 2 + padding;

    legend.selectAll("*").remove();

    const legendGroup = legend.append("g").attr("class", "legend-group");

    legendGroup
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("class", "legendTitle")
      .text(`${groupVar}:`);

    groups.forEach((d, i) => {
      const y = i * lineHeight + 50;
      const legendItem = legendGroup
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(0,${y})`);

      legendItem
        .append("circle")
        .attr("class", "legend-circle")
        .attr("cx", circleSize + 10)
        .attr("cy", 0)
        .attr("r", circleSize)
        .style("fill", colorScale(d));

      legendItem
        .append("text")
        .attr("class", "legend")
        .attr("x", circleSize * 2 + 15)
        .attr("y", 4)
        .text(d)
        .style("cursor", "pointer")
        .on("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const item = d3.select(e.target);
          const isHide = item.classed("cross");

          chart
            .selectAll(".group" + d)
            .classed("hide", !isHide)
            .raise();

          item.classed("cross", !isHide);
        });

      legendItem
        .on("mouseover", () => {
          chart.selectAll(".dots").attr("visibility", "hidden");
          chart
            .selectAll(".dots")
            .filter((dd) => dd[groupVar] === d)
            .attr("visibility", "visible")
            .raise();
        })
        .on("mouseout", () => {
          chart.selectAll(".dots").attr("visibility", null);
        });
    });

    const bbox = legendGroup.node().getBBox();

    const parent = legend.node().parentNode;
    const { width, height } = parent.getBoundingClientRect();

    if (height > bbox.y + bbox.height) {
      d3.select(parent).style("align-items", "center");
    } else {
      d3.select(parent).style("align-items", null);
    }

    if (width > bbox.x + bbox.width) {
      d3.select(parent).style("justify-content", "center");
    } else {
      d3.select(parent).style("justify-content", null);
    }

    legend
      .attr("width", bbox.x + bbox.width)
      .attr("height", bbox.y + bbox.height);
  }
}
