import * as d3 from "d3";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { deepCopy, moveTooltip } from "@/utils/functions";
import { numMargin, renderLegend } from "../Density/useDensity";
import useResizeObserver from "@/utils/useResizeObserver";

export default function useBoxplot({ chartRef, legendRef, data, config }) {
  const dimensions = useResizeObserver(chartRef);
  const groups = useSelector((s) => s.cantab.present.groups);
  const selectionGroups = useSelector((s) => s.cantab.present.selectionGroups);

  const { pointSize, showPoints } = config;

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

    const color = d3.scaleOrdinal().domain(groups).range(colorScheme);

    let tmp = deepCopy(selectionGroups).sort();
    const x = d3.scaleBand().domain(tmp).range([0, chartWidth]).padding(0.4);

    const grouped = d3.group(data, (d) => d.type);

    const boxStatsByGroup = Array.from(grouped, ([group, values]) => {
      const numericValues = values.map((d) => d.value);
      const stats = computeBoxStats(numericValues);
      return {
        group,
        lower: stats.lower,
        upper: stats.upper,
      };
    });

    let yDomain;
    if (showPoints) {
      yDomain = [d3.min(data, (d) => d.value), d3.max(data, (d) => d.value)];
    } else {
      yDomain = [
        d3.min(boxStatsByGroup, (d) => d.lower),
        d3.max(boxStatsByGroup, (d) => d.upper),
      ];
    }

    const y = d3.scaleLinear().domain(yDomain).nice().range([chartHeight, 0]);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    chart.append("g").call(d3.axisLeft(y));

    function computeBoxStats(values) {
      values = values.sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const lower = Math.max(d3.min(values), q1 - 1.5 * iqr);
      const upper = Math.min(d3.max(values), q3 + 1.5 * iqr);

      return { q1, median, q3, lower, upper };
    }

    const groupsG = chart
      .selectAll(".boxplot")
      .data(groups)
      .join("g")
      .attr("class", "boxplot")
      .attr("transform", (d) => `translate(${x(d)}, 0)`);

    groupsG.each(function (group) {
      const g = d3.select(this);
      const values = (grouped.get(group) || []).map((d) => d.value);

      if (values.length === 0) return;

      const stats = computeBoxStats(values);
      const boxWidth = x.bandwidth();

      // ----- Box -----
      g.append("rect")
        .attr("x", 0)
        .attr("y", y(stats.q3))
        .attr("width", boxWidth)
        .attr("height", y(stats.q1) - y(stats.q3))
        .attr("fill", color(group))
        .attr("stroke", "black")
        .on("mouseover", function (e) {
          tooltip
            .style("visibility", "visible")
            .html(
              `
              <strong>${group}</strong><br/>
              <strong>n = ${values.length}</strong><br/>
              Q1: ${stats.q1.toFixed(2)}<br/>
              Median: ${stats.median.toFixed(2)}<br/>
              Q3: ${stats.q3.toFixed(2)}<br/>
              Min (whisker): ${stats.lower.toFixed(2)}<br/>
              Max (whisker): ${stats.upper.toFixed(2)}
            `
            )
            .style("opacity", 1);
        })
        .on("mousemove", (e) => {
          moveTooltip(e, tooltip, chart);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

      // ----- Median line -----
      g.append("line")
        .attr("x1", 0)
        .attr("x2", boxWidth)
        .attr("y1", y(stats.median))
        .attr("y2", y(stats.median))
        .attr("stroke", "black")
        .attr("stroke-width", 2);

      // ----- Whiskers -----
      g.append("line")
        .attr("x1", boxWidth / 2)
        .attr("x2", boxWidth / 2)
        .attr("y1", y(stats.lower))
        .attr("y2", y(stats.q1))
        .attr("stroke", "black");

      g.append("line")
        .attr("x1", boxWidth / 2)
        .attr("x2", boxWidth / 2)
        .attr("y1", y(stats.q3))
        .attr("y2", y(stats.upper))
        .attr("stroke", "black");

      // ----- Whisker caps -----
      g.append("line")
        .attr("x1", boxWidth * 0.2)
        .attr("x2", boxWidth * 0.8)
        .attr("y1", y(stats.lower))
        .attr("y2", y(stats.lower))
        .attr("stroke", "black");

      g.append("line")
        .attr("x1", boxWidth * 0.2)
        .attr("x2", boxWidth * 0.8)
        .attr("y1", y(stats.upper))
        .attr("y2", y(stats.upper))
        .attr("stroke", "black");

      // ---- Scatter points with jitter ----
      g.selectAll(".point")
        .data(grouped.get(group) || [])
        .join("circle")
        .attr("class", "point")
        .classed("hide", !showPoints)
        .attr("cx", () => boxWidth / 2 + (Math.random() - 0.5) * boxWidth * 0.6)
        .attr("cy", (d) => y(d.value))
        .attr("fill", "grey")
        .attr("opacity", 0.7)
        .attr("r", pointSize)
        .on("mouseover", function (e, d) {
          tooltip.style("visibility", "visible").html(`
            <strong>${group}</strong><br/>
            Value: ${d.value.toFixed(2)}
          `);
        })
        .on("mousemove", (e) => moveTooltip(e, tooltip, chart))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    });

    renderLegend(legend, selectionGroups, color, null, null, null, null);
  }, [data, dimensions, groups, selectionGroups, showPoints]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = d3.select(chartRef.current);
    chart.selectAll(".point").attr("r", pointSize);
  }, [pointSize]);
}
