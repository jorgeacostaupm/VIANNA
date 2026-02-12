import * as d3 from "d3";
import { useEffect } from "react";
import {
  interpolateBrBG,
  interpolatePiYG,
  interpolatePRGn,
  interpolatePuOr,
  interpolateRdBu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateSpectral,
} from "d3-scale-chromatic";
import { moveTooltip } from "@/utils/functions";
import useResizeObserver from "@/hooks/useResizeObserver";
import { CORRELATION_METHOD_MAP } from "./constants";
import { CHART_HIGHLIGHT } from "@/utils/chartTheme";

const INTERPOLATORS = {
  rdBu: interpolateRdBu,
  rdYlBu: interpolateRdYlBu,
  rdYlGn: interpolateRdYlGn,
  brBG: interpolateBrBG,
  piYG: interpolatePiYG,
  prGn: interpolatePRGn,
  puOr: interpolatePuOr,
  spectral: interpolateSpectral,
};

export default function useCorrelationMatrix({ chartRef, data, config, params }) {
  const dimensions = useResizeObserver(chartRef);

  useEffect(() => {
    if (!dimensions || !data || !chartRef.current) return;

    const { range, showLegend, showLabels, colorScale } = config;
    const methodInfo =
      CORRELATION_METHOD_MAP[params?.method] || CORRELATION_METHOD_MAP.pearson;
    const allVars = data.map((d) => d.x);
    const varsSet = new Set(allVars);
    const variables = Array.from(varsSet);

    let margin = { top: 70, right: 110, bottom: 50, left: 120 };

    if (showLabels !== false) {
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.visibility = "hidden";
      tempContainer.style.fontSize = "16px";
      tempContainer.style.fontFamily = "sans-serif";
      document.body.appendChild(tempContainer);

      const tempSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      tempContainer.appendChild(tempSvg);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.textContent = variables.reduce((a, b) =>
        a.length > b.length ? a : b
      );
      text.setAttribute("transform", "rotate(-45)");
      tempSvg.appendChild(text);

      const bbox = text.getBBox();
      const upwardExtension = bbox.y < 0 ? Math.abs(bbox.y) : 0;
      const totalTopSpace = upwardExtension + 10;

      document.body.removeChild(tempContainer);

      margin = {
        top: Math.max(110, totalTopSpace + 30) + 20,
        right: 110,
        bottom: 50,
        left: 150,
      };

      if (bbox.x < 0) {
        margin.left = Math.max(margin.left, Math.abs(bbox.x) + 50);
      }
    }

    d3.select(chartRef.current).selectAll("*").remove();

    const totalWidth = dimensions.width;
    const totalHeight = dimensions.height;
    const chartAreaWidth = totalWidth;
    const chartWidth = chartAreaWidth - margin.left - margin.right;
    const chartHeight = totalHeight - margin.top - margin.bottom;
    const chartSize = Math.min(chartWidth, chartHeight);

    let tooltip = d3.select("body").select("div.tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    const svg = d3.select(chartRef.current);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const position = d3
      .scaleBand()
      .domain(variables)
      .paddingInner(0.1)
      .range([0, chartSize]);

    const interpolator = INTERPOLATORS[colorScale] || interpolateRdBu;
    const color = d3
      .scaleDiverging()
      .domain([-1, 0, 1])
      .interpolator(interpolator);

    if (variables.length < 2) return;

    for (let i in variables) {
      for (let j in variables) {
        let x = variables[i];
        let y = variables[j];

        renderCorrelationCell(x, y);
      }
    }

    if (showLabels !== false) {
      renderLabels();
    }
    if (showLegend !== false) {
      renderLegend();
    }

    function renderCorrelationCell(x, y) {
      const value = data.find(
        (d) => (d.x === x && d.y === y) || (d.x === y && d.y === x)
      ).value;

      if (Math.abs(value) < range[0] || Math.abs(value) > range[1]) return;

      chart
        .append("rect")
        .attr("var1", x)
        .attr("var2", y)
        .attr("id", x + y)
        .attr("class", "rect-cell")
        .attr("x", position(x))
        .attr("y", position(y))
        .attr("width", position.bandwidth())
        .attr("height", position.bandwidth())
        .attr("rx", 3)
        .attr("ry", 3)
        .style("fill", color(value))
        .on("mouseover", function (e, d) {
          const target = e.target;
          d3.select(target).style("stroke", CHART_HIGHLIGHT).raise();
          tooltip.style("opacity", 1);
          const methodLabel = methodInfo?.label || "Pearson (r)";
          let html = `<strong> ${x} & ${y}</strong> <br> ${methodLabel}: ${value.toFixed(
            2
          )}`;
          tooltip.style("opacity", 1).html(html);
        })
        .on("mousemove", function (e, d) {
          moveTooltip(e, tooltip, chart);
        })
        .on("mouseout", function (e, d) {
          const target = e.target;
          d3.select(target).style("stroke", null);
          tooltip.style("opacity", 0);
        });
    }

    function renderLegend() {
      const rawId = chartRef.current?.id || "correlation-matrix";
      const safeId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, "-");
      const gradientId = `${safeId}-color-gradient`;
      const defs = svg.append("defs");

      const scale = d3.scaleLinear().domain([-1, 1]).range([chartSize, 0]);

      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      gradient
        .selectAll("stop")
        .data([
          { offset: "0%", color: interpolator(0) },
          { offset: "50%", color: interpolator(0.5) },
          { offset: "100%", color: interpolator(1) },
        ])
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

      const legendWidth = 20;
      svg
        .append("rect")
        .attr("transform", `translate(${70}, ${margin.top})`)
        .attr("width", legendWidth)
        .attr("height", chartSize)
        .attr("fill", `url(#${gradientId})`);

      const axis = d3.axisLeft(scale).ticks(5);

      const axisG = svg
        .append("g")
        .attr("transform", `translate(${70}, ${margin.top})`)
        .call(axis);

      axisG.select(".domain").remove();
    }

    function renderLabels() {
      chart
        .selectAll(".y-labels")
        .data(variables)
        .join("text")
        .attr("class", "y-labels")
        .text((d) => d)
        .attr(
          "transform",
          (d) =>
            "translate(" +
            (position(d) + position.bandwidth() / 2) +
            "," +
            -10 +
            ")rotate(-45)"
        )
        .attr("text-anchor", "start")
        .append("title")
        .text((d) => d);

      chart
        .selectAll(".x-labels")
        .data(variables)
        .join("text")
        .attr("class", "x-labels")
        .text((d) => d)
        .attr(
          "transform",
          (d) =>
            "translate(" +
            (chartSize + 10) +
            "," +
            (position(d) + position.bandwidth() / 2 + 5) +
            ")"
        );
    }
  }, [data, config, dimensions, params?.method]);
}
