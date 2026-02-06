import * as d3 from "d3";
import { useLayoutEffect } from "react";
import { deepCopy, moveTooltip } from "@/utils/functions";
import useResizeObserver from "@/hooks/useResizeObserver";
import {
  catMargins,
  renderLegend,
} from "../GroupedBarChart/useGroupedBarChart";

export default function useStackedBarChart({
  chartRef,
  legendRef,
  data,
  config,
}) {
  const dimensions = useResizeObserver(chartRef);

  useLayoutEffect(() => {
    if (!dimensions || !data || !chartRef.current || !legendRef.current) return;

    const { width, height } = dimensions;
    const { chartData, categories, categoriesWithValues, groupVar } = data;
    const { showLegend, groupOrder, categoryOrder } = config || {};

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(legendRef.current).selectAll("*").remove();

    const colorScheme = d3.schemeCategory10;
    const chartWidth = width - catMargins.left - catMargins.right;
    const chartHeight = height - catMargins.top - catMargins.bottom;

    let tooltip = d3.select("body").select("div.tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    const svg = d3.select(chartRef.current);
    const legend = d3.select(legendRef.current);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${catMargins.left},${catMargins.top})`);

    const groupTotals = new Map(
      chartData.map((d) => [
        d[groupVar],
        categories.reduce((sum, c) => sum + (d[c] || 0), 0),
      ])
    );
    const groups = chartData.map((d) => d[groupVar]);
    groups.sort((a, b) => {
      if (groupOrder === "count") {
        return (groupTotals.get(b) || 0) - (groupTotals.get(a) || 0);
      }
      return String(a).localeCompare(String(b));
    });

    const x = d3.scaleBand().domain(groups).range([0, chartWidth]).padding(0.2);

    const categoryTotals = new Map(
      categories.map((c) => [
        c,
        chartData.reduce((sum, d) => sum + (d[c] || 0), 0),
      ])
    );
    const visibleCategories =
      categoriesWithValues?.length > 0 ? categoriesWithValues : categories;
    const orderedCategories = deepCopy(visibleCategories).sort((a, b) => {
      if (categoryOrder === "count") {
        return (categoryTotals.get(b) || 0) - (categoryTotals.get(a) || 0);
      }
      return String(a).localeCompare(String(b));
    });

    const stackGenerator = d3.stack().keys(orderedCategories);
    const series = stackGenerator(chartData);

    const maxSum = d3.max(chartData, (d) =>
      orderedCategories.reduce((sum, c) => sum + d[c], 0)
    );

    const y = d3
      .scaleLinear()
      .domain([0, maxSum])
      .nice()
      .range([chartHeight, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(orderedCategories)
      .range(colorScheme);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text");

    chart.append("g").call(d3.axisLeft(y).ticks(null, "d"));

    const layer = chart
      .selectAll(".layer")
      .data(series)
      .enter()
      .append("g")
      .attr("class", "layer")
      .attr("fill", (d) => color(d.key));

    layer
      .selectAll("rect")
      .data((d) =>
        d.map((d2) => ({
          key: d.key,
          group: d2.data[groupVar],
          y0: d2[0],
          y1: d2[1],
          value: d2[1] - d2[0],
        }))
      )
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.group))
      .attr("y", (d) => y(d.y1))
      .attr("height", (d) => y(d.y0) - y(d.y1))
      .attr("width", x.bandwidth())
      .on("mouseover", (e, d) => {
        tooltip.style("visibility", "visible").html(
          `<strong>Nº Items: ${d.value}</strong><br/>
             Category: ${d.key}<br/>
             `
        );
        d3.select(e.currentTarget).attr("opacity", 0.7);
      })
      .on("mousemove", (e) => {
        moveTooltip(e, tooltip, chart);
      })
      .on("mouseout", (e) => {
        tooltip.style("visibility", "hidden");
        d3.select(e.currentTarget).attr("opacity", 1);
      });

    if (showLegend !== false) {
      renderLegend(legend, orderedCategories, color);
    }
  }, [data, config, dimensions]);
}
