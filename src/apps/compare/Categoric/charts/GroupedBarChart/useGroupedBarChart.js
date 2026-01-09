import * as d3 from "d3";
import { useEffect } from "react";
import { moveTooltip } from "@/utils/functions";
import useResizeObserver from "@/utils/useResizeObserver";

export const catMargins = { top: 20, right: 30, bottom: 40, left: 40 };

export default function useGroupedBarChart({
  chartRef,
  legendRef,
  data,
  config,
}) {
  const dimensions = useResizeObserver(chartRef);

  useEffect(() => {
    if (!dimensions || !data || !chartRef.current || !legendRef.current) return;

    const { width, height } = dimensions;
    const { chartData, categories, categoriesWithValues, groupVar } = data;

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

    const groups = chartData.map((d) => d[groupVar]).sort();

    const x0 = d3
      .scaleBand()
      .domain(groups)
      .range([0, chartWidth])
      .padding(0.2);

    const color = d3.scaleOrdinal().domain(categories).range(colorScheme);

    const x1 = d3
      .scaleBand()
      .domain(categories.sort())
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const maxCount = d3.max(chartData, (d) => d3.max(categories, (c) => d[c]));
    const y = d3
      .scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([chartHeight, 0]);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll("text");

    chart.append("g").call(d3.axisLeft(y).ticks(null, "d"));

    const groupG = chart
      .selectAll("g.group")
      .data(chartData)
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${x0(d[groupVar])},0)`);

    groupG
      .selectAll("rect")
      .data((d) => categories.map((key) => ({ key, value: d[key] })))
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => chartHeight - y(d.value))
      .attr("fill", (d) => color(d.key))
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(
            `<strong>Nº Items: ${d.value}</strong><br/>Category: ${d.key}<br/>`
          );
        d3.select(event.currentTarget).attr("opacity", 0.7);
      })
      .on("mousemove", (event) => moveTooltip(event, tooltip, chart))
      .on("mouseout", (event) => {
        tooltip.style("visibility", "hidden");
        d3.select(event.currentTarget).attr("opacity", 1);
      });

    renderLegend(legend, categoriesWithValues, color);
  }, [data, config, dimensions]);
}

export function renderLegend(legend, groups, color) {
  const circleSize = 10;
  const padding = 6;
  const lineHeight = circleSize * 2 + padding;

  const legendGroup = legend.append("g").attr("class", "legend-group");

  groups.forEach((d, i) => {
    const y = i * lineHeight + circleSize * 2;

    legendGroup
      .append("circle")
      .attr("class", "legend-circle")
      .attr("cx", circleSize + 10)
      .attr("cy", y)
      .attr("r", circleSize)
      .style("fill", color(d));

    legendGroup
      .append("text")
      .attr("class", "legend")
      .attr("x", circleSize * 2 + 15)
      .attr("y", y + 4)
      .text(d);
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
    .attr("height", bbox.y + bbox.height + circleSize * 2);
}
