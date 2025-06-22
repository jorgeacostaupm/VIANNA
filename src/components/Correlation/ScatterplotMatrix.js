import * as d3 from "d3";
import styles from "@/utils/Charts.module.css";
import { moveTooltip } from "@/utils/functions";
import store from "@/features/store";
import renderQTooltip from "@/utils/QuarantineTooltip";

let brushCell = null;
let brushInstance = null;
let lineChart = null;
export default function drawSPMatrix(data, config, parent, dimensions) {
  d3.select(parent).selectAll("*").remove();
  const margin = { top: 50, right: 100, bottom: 50, left: 100 };
  const legendRatio = 0.15;
  const chartRatio = 1 - legendRatio;
  const colorScheme = d3.schemeCategory10;

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
    .style("overflow", "auto")
    .style("display", "flex")
    .append("svg")
    .attr("id", "scatter-legend")
    .attr("width", legendWidth)
    .attr("height", chartSize)
    .attr("class", styles.pwSvg);

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

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  const { groupVar, pointSize, variables } = config;
  const allGroups = data.map((d) => d[groupVar]);
  const groupSet = new Set(allGroups);
  const groups = Array.from(groupSet);
  const timeVar = store.getState().cantab.timeVar;
  const idVar = store.getState().cantab.idVar;

  const position = d3
    .scaleBand()
    .domain(variables)
    .paddingInner(0.1)
    .range([0, chartSize]);

  const colorScale = d3.scaleOrdinal().domain(groups).range(colorScheme);

  if (variables.length < 2) return;

  if (lineChart === null) {
    for (let i in variables) {
      for (let j in variables) {
        let x = variables[i];
        let y = variables[j];

        if (x === y) {
          renderText(x, y);
        } else {
          renderLinechart(x, y);
        }
      }
    }
  } else {
    renderBigLineChart(lineChart.x, lineChart.y);
  }

  renderLegend();

  function renderText(x, y) {
    chart
      .append("g")
      .attr(
        "transform",
        `translate(${position(x) + position.bandwidth() / 2}, ${
          position(y) + position.bandwidth() / 2
        })`
      )
      .append("text")
      .attr("class", "sc-label")
      .attr("id", x)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text(x);
  }

  function renderLinechart(var1, var2) {
    let xextent = d3.extent(data, function (d) {
      return +d[var1];
    });
    let x = d3
      .scaleLinear()
      .domain(xextent)
      .nice()
      .range([0, position.bandwidth()]);

    let yextent = d3.extent(data, function (d) {
      return +d[var2];
    });
    let y = d3
      .scaleLinear()
      .domain(yextent)
      .nice()
      .range([position.bandwidth(), 0]);

    let gCell = chart
      .append("g")
      .attr("transform", `translate(${position(var1)},${position(var2)})`)
      .attr("class", "cell");

    gCell
      .append("rect")
      .attr("var1", var1)
      .attr("var2", var2)
      .attr("id", var1 + var2)
      .attr("class", "rect-cell")
      .attr("width", position.bandwidth())
      .attr("height", position.bandwidth())
      .attr("fill", "transparent")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    const dots = gCell.selectAll(".dots").data(data);

    dots
      .enter()
      .append("circle")
      .attr("class", (d) => "dots " + "group" + d[groupVar])
      .attr("r", config.pointSize)
      .attr("fill", function (d) {
        return colorScale(d[groupVar]);
      })
      .attr("opacity", 0.8)
      .merge(dots)
      .attr("cx", function (d) {
        return x(+d[var1]);
      })
      .attr("cy", function (d) {
        return y(+d[var2]);
      });

    dots
      .attr("cx", function (d) {
        return x(+d[var1]);
      })
      .attr("cy", function (d) {
        return y(+d[var2]);
      });

    dots.exit().remove();

    renderLinechartAxis(gCell, var1, var2, x, y);

    let brush = addBrush(var1, var2, x, y);
    gCell.call(brush);

    gCell.on("mousedown", (e) => {
      if (e.ctrlKey) {
        e.stopImmediatePropagation();
        lineChart = { x: var1, y: var2 };
        lineChart.y = var2;
        renderBigLineChart(var1, var2);
      }
    });
  }

  function addBrush(var1, var2, x, y) {
    if (brushInstance && brushCell) {
      d3.select(brushCell).call(brushInstance.move, null);
      d3.select(brushCell).select(".brush").remove();
      brushCell = null;
    }

    brushInstance = d3
      .brush()
      .extent([
        [0, 0],
        [position.bandwidth(), position.bandwidth()],
      ])
      .on("start", brushstarted)
      .on("brush", brushing)
      .on("end", brushended);

    function brushstarted() {
      if (brushCell !== this) {
        d3.select(brushCell).call(brushInstance.move, null);
        brushCell = this;
      }
    }

    function brushing({ selection }) {
      if (!selection) return;
      const x0 = x.invert(selection[0][0]),
        y1 = y.invert(selection[0][1]),
        x1 = x.invert(selection[1][0]),
        y0 = y.invert(selection[1][1]);

      chart
        .selectAll(".dots")
        .classed("hiddenDot", (d) => {
          const isBrushed =
            d[var1] > x0 && d[var1] < x1 && d[var2] > y0 && d[var2] < y1;
          return !isBrushed;
        })
        .filter((d) => {
          const isBrushed =
            d[var1] > x0 && d[var1] < x1 && d[var2] > y0 && d[var2] < y1;
          return isBrushed;
        })
        .raise();
    }

    function brushended({ selection }) {
      if (!selection) {
        chart.selectAll(".dots").classed("hiddenDot", false);
      } else {
        chart.selectAll(".overlay").raise();
        chart.selectAll(".selection").raise();
      }
    }

    return brushInstance;
  }

  function renderLinechartAxis(gCell, var1, var2, x, y) {
    const n_ticks = 3;
    const variables = position.domain();
    if (variables.indexOf(var1) == 0)
      gCell
        .append("g")
        .style("color", "black")
        .call(d3.axisLeft(y).ticks(n_ticks))
        .call((g) => {
          const columnIndex = variables.indexOf(var2);
          const bandWidth = position.bandwidth();
          const innerPadding = position.paddingInner();

          const x2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("x2", x2Value + 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);
          g.selectAll(".domain").remove();
          g.attr("transform", `translate(0,-0.5)`);
        });

    if (variables.indexOf(var2) == 0)
      gCell
        .append("g")
        .style("color", "black")
        .call(d3.axisTop(x).ticks(n_ticks))
        .call((g) => {
          g.selectAll(".tick line").attr("y2", -6);
          g.selectAll(".domain").remove();
        })
        .call((g) => {
          const columnIndex = variables.indexOf(var1);
          const bandWidth = position.bandwidth();
          const innerPadding = position.paddingInner();

          const y2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("y2", y2Value + 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);
        });

    if (variables.indexOf(var1) == variables.length - 1)
      gCell
        .append("g")
        .style("color", "black")
        .attr("transform", `translate(${position.bandwidth()},-0.5)`)
        .call(d3.axisRight(y).ticks(n_ticks))
        .call((g) => {
          g.selectAll(".tick line").attr("x2", 6);
          g.selectAll(".domain").remove();
        })
        .call((g) => {
          const columnIndex = variables.length - variables.indexOf(var2) - 1;
          const bandWidth = position.bandwidth();
          const innerPadding = position.paddingInner();

          const x2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("x2", -x2Value - 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);
        });

    if (variables.indexOf(var2) == variables.length - 1)
      gCell
        .append("g")
        .attr("transform", `translate(-0.5,${position.bandwidth()})`)
        .style("color", "black")
        .call(d3.axisBottom(x).ticks(n_ticks))
        .call((g) => {
          const columnIndex = variables.length - variables.indexOf(var1) - 1;
          const bandWidth = position.bandwidth();
          const innerPadding = position.paddingInner();

          const y2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("y2", -y2Value - 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);

          g.selectAll(".domain").remove();
        });
  }

  function renderBigLineChart(var1, var2) {
    chart.selectAll("*").remove();

    const xextent = d3.extent(data, (d) => +d[var1]);
    const x = d3.scaleLinear().domain(xextent).nice().range([0, chartSize]);

    const yextent = d3.extent(data, (d) => +d[var2]);
    const y = d3.scaleLinear().domain(yextent).nice().range([chartSize, 0]);

    chart
      .append("rect")
      .attr("width", chartSize)
      .attr("height", chartSize)
      .attr("fill", "transparent")
      .on("click", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.ctrlKey) {
          lineChart = null;
          drawSPMatrix(data, config, parent, dimensions);
        }
      });

    chart
      .selectAll(".dots")
      .data(data)
      .join("circle")
      .attr("class", (d) => "dots " + d[groupVar])
      .attr("cx", (d) => x(+d[var1]))
      .attr("cy", (d) => y(+d[var2]))
      .attr("r", 5)
      .attr("fill", (d) => colorScale(d[groupVar]))
      .attr("opacity", 0.8)
      .on("mouseover", function (e, d) {
        const target = e.target;
        d3.select(target).style("stroke", "black").raise();
        let html = `<strong>${d[groupVar]}</strong> <br>`;
        html += `${var1}: ${d[var1]?.toFixed(2)} <br> ${var2}: ${d[
          var2
        ]?.toFixed(2)} <br>`;
        html += d[idVar] ? `${idVar} : ${d[idVar]}<br>` : "";
        html += d[timeVar] ? `${timeVar} : ${d[timeVar]}` : "";
        tooltip.style("opacity", 1).html(html);
      })
      .on("mousemove", function (e) {
        moveTooltip(e, tooltip, chart);
      })
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

    chart
      .append("g")
      .attr("transform", `translate(0, ${chartSize})`)
      .style("color", "black")
      .call(d3.axisBottom(x).ticks(3));

    chart
      .append("g")
      .attr("transform", `translate(0, 0)`)
      .style("color", "black")
      .call(d3.axisLeft(y).ticks(3));

    chart
      .selectAll(".yAxisLabel")
      .data([null])
      .join("text")
      .attr("class", "yAxisLabel")
      .attr("transform", `translate(0, ${-20})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text(var2);

    chart
      .selectAll(".xAxisLabel")
      .data([null])
      .join("text")
      .attr("class", "xAxisLabel")
      .attr("transform", `translate(${chartSize + 10}, ${chartSize + 5})`)
      .attr("text-anchor", "start")
      .attr("font-size", "18px")
      .text(var1);
  }

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
