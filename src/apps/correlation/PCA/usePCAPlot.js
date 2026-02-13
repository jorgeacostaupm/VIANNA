import * as d3 from "d3";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { moveTooltip } from "@/utils/functions";
import renderLegend from "@/utils/renderLegend";
import useResizeObserver from "@/hooks/useResizeObserver";
import useGroupColorDomain from "@/hooks/useGroupColorDomain";
import { CHART_HIGHLIGHT } from "@/utils/chartTheme";

const margin = { top: 30, right: 20, bottom: 40, left: 60 };

export default function usePCAPlot({ chartRef, legendRef, data, config }) {
  const dimensions = useResizeObserver(chartRef);
  const idVar = useSelector((s) => s.cantab.present.idVar);
  const [hide, setHide] = useState([]);
  const { groupVar, pointSize, pointOpacity, showLegend } = config;
  const groupsInData =
    Array.isArray(data) && groupVar
      ? Array.from(new Set(data.map((d) => d[groupVar]))).filter(
          (value) => value != null
        )
      : [];
  const { colorDomain, orderedGroups: groups } = useGroupColorDomain(
    groupVar,
    groupsInData
  );

  useEffect(() => {
    if (!dimensions || !data || !chartRef.current || !legendRef.current) return;
    if (!groupVar) {
      d3.select(chartRef.current).selectAll("*").remove();
      d3.select(legendRef.current).selectAll("*").remove();
      return;
    }
    if (data.length === 0) return;

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(legendRef.current).selectAll("*").remove();

    const colorScheme = d3.schemeCategory10;

    const totalWidth = dimensions.width;
    const totalHeight = dimensions.height;
    const chartAreaWidth = totalWidth;
    const chartWidth = chartAreaWidth - margin.left - margin.right;
    const chartHeight = totalHeight - margin.top - margin.bottom;
    const chartSize = Math.min(chartWidth, chartHeight);

    const svg = d3.select(chartRef.current);
    const legend = d3.select(legendRef.current);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    let tooltip = d3.select("body").select("div.tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    const xExtent = d3.extent(data, (d) => d.pc1);
    const yExtent = d3.extent(data, (d) => d.pc2);

    const xScale = d3
      .scaleLinear()
      .domain(xExtent)
      .nice()
      .range([0, chartSize]);
    const yScale = d3
      .scaleLinear()
      .domain(yExtent)
      .nice()
      .range([chartSize, 0]);

    const color = d3.scaleOrdinal().domain(colorDomain).range(colorScheme);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartSize})`)
      .call(d3.axisBottom(xScale));

    chart.append("g").call(d3.axisLeft(yScale));

    chart
      .selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.pc1))
      .attr("cy", (d) => yScale(d.pc2))
      .attr("r", pointSize)
      .attr("fill", (d) => color(d[groupVar]))
      .attr("opacity", pointOpacity ?? 0.7)
      .on("mouseover", (e, d) => {
        const target = e.target;
        d3.select(target).style("stroke", CHART_HIGHLIGHT).raise();

        let html = `<strong>${d[groupVar]}</strong> <br>`;
        html += `Var 1: ${d.pc1.toFixed(2)}<br> Var 2: ${d.pc2.toFixed(2)} `;
        html += d[idVar] ? `<br>${idVar}: ${d[idVar]}` : "";

        tooltip.style("opacity", 1).html(html);
      })
      .on("mousemove", (e) => moveTooltip(e, tooltip, chart))
      .on("mouseout", (e) => {
        d3.select(e.target).style("stroke", null);
        tooltip.style("opacity", 0);
      });

    if (showLegend !== false) {
      renderLegend(legend, groups, color, null, null, hide, setHide);
    }
  }, [data, config, dimensions, colorDomain, groups]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = d3.select(chartRef.current);

    chart.selectAll(".dot").classed("hide", (d) => hide.includes(d[groupVar]));
  }, [hide]);

  useEffect(() => {
    setHide([]);
  }, [groupVar]);
}
