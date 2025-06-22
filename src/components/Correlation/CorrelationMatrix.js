import * as d3 from "d3";
import styles from "@/utils/Charts.module.css";
import { moveTooltip } from "../../utils/functions";

export default function drawCorrelationMatrix(
  data,
  config,
  parent,
  dimensions
) {
  d3.select(parent).selectAll("*").remove();
  const margin = { top: 100, right: 100, bottom: 40, left: 140 };
  const highCorrColor = "#FF3D3D";
  data;
  const middleCorrColor = "#fff";
  const lowCorrColor = "#3D6BFF";

  const totalWidth = dimensions.width;
  const totalHeight = dimensions.height;
  const chartAreaWidth = totalWidth;
  const chartWidth = chartAreaWidth - margin.left - margin.right;
  const chartHeight = totalHeight - margin.top - margin.bottom;
  const chartSize = Math.min(chartWidth, chartHeight);

  const svg = d3
    .select(parent)
    .append("svg")
    .attr("id", "spmatrix")
    .attr("class", styles.chartSvg);

  let tooltip = d3.select("body").select("div.tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "tooltip");
  }

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const allVars = data.map((d) => d.x);
  const varsSet = new Set(allVars);
  const variables = Array.from(varsSet);

  const position = d3
    .scaleBand()
    .domain(variables)
    .paddingInner(0.1)
    .range([0, chartSize]);

  const colorScale = d3
    .scaleLinear()
    .domain([-1, 0, 1])
    .range([highCorrColor, middleCorrColor, lowCorrColor]);

  if (variables.length < 2) return;

  for (let i in variables) {
    for (let j in variables) {
      let x = variables[i];
      let y = variables[j];

      renderCorrelationCell(x, y);
    }
  }
  renderLabels();
  renderLegend();

  function renderEmptyCell(x, y) {
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
      .style("fill", "transparent");
  }

  function renderCorrelationCell(x, y) {
    const value = data.find((d) => d.x === x && d.y === y).value;

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
      .style("fill", colorScale(value))
      .on("mouseover", function (e, d) {
        const target = e.target;
        d3.select(target).style("stroke", "black").raise();
        tooltip.style("opacity", 1);
        let html = `<strong> ${x} & ${y}</strong> <br> ρ: ${value.toFixed(2)}`;
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
    const defs = chart.append("defs");

    const scale = d3.scaleLinear().domain([-1, 1]).range([chartSize, 0]);

    const gradient = defs
      .append("linearGradient")
      .attr("id", "color-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: highCorrColor },
        { offset: "50%", color: middleCorrColor },
        { offset: "100%", color: lowCorrColor },
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
      .style("fill", "url(#color-gradient)");

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
}
