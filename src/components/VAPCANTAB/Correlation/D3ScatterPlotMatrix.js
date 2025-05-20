import * as d3 from "d3";
import "./styles.css";
import store from "@/components/VAPUtils/features/store";
import { setSelectedPopulations } from "../../VAPUtils/features/correlation/correlationSlice";
import { moveTooltip } from "@/components/VAPUtils/functions";
import { renderContextTooltip } from "@/components/VAPUtils/functions";

const DURATION = 750;
const STROKE_SELECTION = "blue";
const Y_LEGEND = 70;

export class D3ScatterPlotMatrix {
  constructor(parent) {
    this.parent = parent;
    this.populationColorScheme = d3.schemeCategory10;
    this.padding = 0.1;
    this.legendMaxTextLength = 15;
    this.scMaxTextLength = 10;
    this.labelsMaxTextLength = 7;
    this.points_size = 3;
    this.forceCorrelations = false;
    this.correlations = [];
    this.columns = [];

    this.highCorrColor = "#FF3D3D";
    this.middleCorrColor = "#fff";
    this.lowCorrColor = "#3D6BFF";

    this.scatterPlotPixelLimit = 180;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.scattersMargin = { top: 40, right: 40, bottom: 40, left: 300 };
    vis.correlationsMargin = { top: 80, right: 0, bottom: 10, left: 300 };
    vis.margin = vis.scattersMargin;

    vis.svg = d3.select(vis.parent);

    vis.tooltip = d3.select("#correlation-tooltip").attr("class", "tooltip");
    vis.legendSVG = d3.select("#correlation-legend");
    vis.contextMenuTooltip = d3
      .select("#contextmenu-tooltip")
      .attr("class", "contexMenuTooltip")
      .style("opacity", 0);

    vis.chart = vis.svg.append("g");

    const dimensions = vis.parent.getBoundingClientRect();
    vis.setSize(dimensions);
  }

  setSize(dimensions) {
    let vis = this;
    vis.isCorrelations =
      vis.squareSize / vis.columns.length < vis.scatterPlotPixelLimit ||
      vis.forceCorrelations;
    if (vis.isCorrelations) {
      vis.margin = vis.correlationsMargin;
    } else {
      vis.margin = vis.scattersMargin;
    }
    const { width, height } = dimensions;

    vis.height = height;

    let x = width - vis.margin.left - vis.margin.right;
    let y = height - vis.margin.top - vis.margin.bottom;

    vis.squareSize = Math.min(x, y);

    vis.margin.left = (width - vis.squareSize) / 2;
  }

  onResize(dimensions) {
    let vis = this;
    vis.setSize(dimensions);
    vis.updateVis();
  }

  updatePoints() {
    let vis = this;
    vis.chart.selectAll(".dots").attr("r", vis.points_size);
  }

  updateVis() {
    console.log("SCATTER UPDATE");
    let vis = this;

    vis.chart.selectAll("*").remove();

    vis.chart.attr(
      "transform",
      "translate(" + vis.margin.left + "," + vis.margin.top + ")"
    );

    if (vis.data?.length === 0) {
      return;
    }

    if (vis.bigChart) {
      vis.renderBigLineChart(...vis.bigChart);
      return;
    }

    vis.num_var = vis.columns.length;

    vis.position = d3
      .scaleBand()
      .domain(vis.columns)
      .paddingInner(vis.padding)
      .range([0, vis.squareSize]);

    vis.scMaxTextLength = Math.round(vis.squareSize / vis.columns.length / 10);

    vis.populations = store.getState().cantab.selection_populations;
    vis.groups = store.getState().cantab.populations;
    vis.groupVar = store.getState().cantab.group_var;
    vis.timeVar = store.getState().cantab.time_var;

    vis.dict = {};

    vis.populations.forEach((string, index) => {
      vis.dict[string] = index + 1;
    });

    vis.populationColors = d3
      .scaleOrdinal()
      .domain(vis.groups)
      .range(vis.populationColorScheme);
    vis.correlationColors = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range([vis.highCorrColor, vis.middleCorrColor, vis.lowCorrColor]);

    vis.renderMatrix();
  }

  renderMatrix() {
    let vis = this;

    vis.isCorrelations ? vis.renderCorrelations() : vis.renderScatterplots();
  }

  renderCorrelations() {
    let vis = this;

    for (let i in vis.columns) {
      for (let j in vis.columns) {
        let var1 = vis.columns[i];
        let var2 = vis.columns[j];

        if (var1 !== var2) {
          vis.renderCorrelationCell(var1, var2);
        } else {
          vis.renderEmptyCell(var1, var2);
        }
      }
    }
    vis.renderLegend();
    vis.renderCorrelationLabels();
    vis.renderCorrelationLegend();
  }

  renderCorrelationLegend() {
    let vis = this;

    const defs = vis.chart.append("defs");

    const colorScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([vis.squareSize, 0]);

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
        { offset: "0%", color: vis.highCorrColor },
        { offset: "50%", color: vis.middleCorrColor },
        { offset: "100%", color: vis.lowCorrColor },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    const legendWidth = 20;
    vis.chart
      .append("rect")
      .attr("transform", `translate(${vis.squareSize + 140}, ${0})`)
      .attr("width", legendWidth)
      .attr("height", vis.squareSize)
      .style("fill", "url(#color-gradient)");

    const axis = d3.axisRight(colorScale).ticks(5);

    vis.chart
      .append("g")
      .attr(
        "transform",
        `translate(${vis.squareSize + 140 + legendWidth}, ${0})`
      )
      .call(axis);
  }

  renderCorrelationLabels() {
    let vis = this;
    vis.chart
      .selectAll(".y-labels")
      .data(vis.columns)
      .join("text")
      .attr("class", "y-labels")
      .text((d) =>
        d.length > vis.labelsMaxTextLength
          ? d.substring(0, vis.labelsMaxTextLength) + "..."
          : d
      )
      .attr(
        "transform",
        (d) =>
          "translate(" +
          (vis.position(d) + vis.position.bandwidth() / 2) +
          "," +
          -10 +
          ")rotate(-45)"
      )
      .attr("text-anchor", "start")
      .append("title")
      .text((d) => d);

    vis.chart
      .selectAll(".x-labels")
      .data(vis.columns)
      .join("text")
      .attr("class", "x-labels")
      .text((d) => d)
      .attr(
        "transform",
        (d) =>
          "translate(" +
          (vis.squareSize + 10) +
          "," +
          (vis.position(d) + vis.position.bandwidth() / 2 + 5) +
          ")"
      );
  }

  renderScatterplots() {
    let vis = this;

    for (let i in vis.columns) {
      for (let j in vis.columns) {
        let var1 = vis.columns[i];
        let var2 = vis.columns[j];

        if (var1 === var2) {
          vis.renderText(var1, var2);
        } else {
          vis.renderLinechart(var1, var2);
        }
      }
    }

    vis.svg.on("click", (event) => {
      if (event.ctrlKey) {
        vis.ctrlKey = true;
      }
    });

    vis.renderLegend();
    const selectedPopulations =
      store.getState().correlation.selectedPopulations;
    vis.populations.forEach((d) => {
      d3.selectAll(".circles" + vis.dict[d]).classed(
        "not_show",
        !selectedPopulations.includes(d)
      );
    });
  }

  renderText(var1, var2) {
    let vis = this;
    let tmp = vis.chart
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (vis.position(var1) + vis.position.bandwidth() / 2) +
          "," +
          (vis.position(var2) + vis.position.bandwidth() / 2) +
          ")"
      )
      .append("text")
      .attr("class", "sc-label")
      .text(
        var1.length > vis.scMaxTextLength
          ? var1.substring(0, vis.scMaxTextLength) + "..."
          : var1
      )
      .attr("id", var1)
      .attr("text-anchor", "middle")
      .append("title")
      .text(var1);
  }

  renderCorrelationCell(var1, var2) {
    let vis = this;

    const correlationValue = vis.correlations.find(
      (d) => d.x === var1 && d.y === var2
    ).value;

    vis.chart
      .append("rect")
      .attr("var1", var1)
      .attr("var2", var2)
      .attr("id", var1 + var2)
      .attr("class", "rect-cell")
      .attr("x", vis.position(var1))
      .attr("y", vis.position(var2))
      .attr("width", vis.position.bandwidth())
      .attr("height", vis.position.bandwidth())
      .style("fill", vis.correlationColors(correlationValue))
      /* .attr('stroke', 'black')
      .attr('stroke-width', 1)  */
      .on("mousedown", function (e) {
        if (e.ctrlKey) {
          vis.tooltip.style("opacity", 0);
          vis.renderBigLineChart(var1, var2);
          e.stopImmediatePropagation();
        }
      })
      .on("mouseover", function (event, d) {
        vis.tooltip.style("opacity", 1).html(
          `${var1} , ${var2} <br>
          Correlation: ${correlationValue.toFixed(3)}`
        );
      })
      .on("mousemove", function (e) {
        moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on("mouseout", function () {
        vis.tooltip.style("opacity", 0);
      });
  }

  renderEmptyCell(var1, var2) {
    let vis = this;

    vis.chart
      .append("rect")
      .attr("var1", var1)
      .attr("var2", var2)
      .attr("id", var1 + var2)
      .attr("class", "rect-cell")
      .attr("x", vis.position(var1))
      .attr("y", vis.position(var2))
      .attr("width", vis.position.bandwidth())
      .attr("height", vis.position.bandwidth())
      .style("fill", "transparent");
    /* .attr('stroke', 'black')
      .attr('stroke-width', 1);  */
  }

  renderLinechart(var1, var2) {
    let vis = this;

    let xextent = d3.extent(vis.data, function (d) {
      return +d[var1];
    });
    let x = d3
      .scaleLinear()
      .domain(xextent)
      .nice()
      .range([0, vis.position.bandwidth()]);

    let yextent = d3.extent(vis.data, function (d) {
      return +d[var2];
    });
    let y = d3
      .scaleLinear()
      .domain(yextent)
      .nice()
      .range([vis.position.bandwidth(), 0]);

    const correlationValue = vis.correlations.find(
      (d) => d.x === var1 && d.y === var2
    ).value;

    let gCell = vis.chart
      .append("g")
      .attr(
        "transform",
        `translate(${vis.position(var1)},${vis.position(var2)})`
      )
      .attr("class", "cell");

    gCell
      .append("rect")
      .attr("var1", var1)
      .attr("var2", var2)
      .attr("id", var1 + var2)
      .attr("class", "rect-cell")
      .attr("width", vis.position.bandwidth())
      .attr("height", vis.position.bandwidth())
      .attr("fill", "transparent")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    const dots = gCell.selectAll(".dots").data(vis.data);

    dots
      .enter()
      .append("circle")
      .attr("class", (d) => "dots" + " circles" + vis.dict[d[vis.groupVar]])
      .attr("r", vis.points_size)
      .attr("fill", function (d) {
        return vis.populationColors(d[vis.groupVar]);
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

    vis.renderLinechartAxis(gCell, var1, var2, x, y);
    let brush = vis.addBrush(x, y, var1, var2);
    gCell.call(brush);

    gCell
      .on("mousedown", (e) => {
        if (e.ctrlKey) {
          vis.tooltip.style("opacity", 0);
          vis.renderBigLineChart(var1, var2);
          e.stopImmediatePropagation();
        }
      })
      .on("mouseover", function (event, d) {
        vis.tooltip.style("opacity", 1).html(
          `${var1} , ${var2} <br>
      Correlation: ${correlationValue.toFixed(3)}`
        );
      })
      .on("mousemove", function (e) {
        moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on("mouseout", function () {
        vis.tooltip.style("opacity", 0);
      });
  }

  addBrush(x, y, var1, var2) {
    let vis = this;

    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [vis.position.bandwidth(), vis.position.bandwidth()],
      ])
      .on("start", brushstarted)
      .on("brush", brushing)
      .on("end", brushended);

    function brushstarted() {
      if (vis.brushCell !== this) {
        d3.select(vis.brushCell).call(brush.move, null);
        vis.brushCell = this;
      }
      vis.tooltip.style("visibility", "hidden");
    }

    function brushing({ selection }) {
      if (selection) {
        const x0 = x.invert(selection[0][0]);
        const y1 = y.invert(selection[0][1]);
        const x1 = x.invert(selection[1][0]);
        const y0 = y.invert(selection[1][1]);
        vis.chart
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
    }

    function brushended({ selection }) {
      if (selection) {
        vis.chart.selectAll(".overlay").raise();
        vis.chart.selectAll(".selection").raise();
        return;
      }
      vis.chart.selectAll(".dots").classed("hiddenDot", false);
      vis.tooltip.style("visibility", "visible");
    }

    return brush;
  }

  renderLinechartAxis(cell, var1, var2, x, y) {
    let vis = this;
    const n_ticks = 3;
    if (vis.columns.indexOf(var1) == 0)
      cell
        .append("g")
        .style("color", "black")
        .call(d3.axisLeft(y).ticks(n_ticks))
        .call((g) => {
          const columnIndex = vis.columns.indexOf(var2);
          const bandWidth = vis.position.bandwidth();
          const innerPadding = vis.position.paddingInner();

          const x2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("x2", x2Value + 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);
          g.selectAll(".domain").remove();
          g.attr("transform", `translate(0,-0.5)`);
        });

    if (vis.columns.indexOf(var2) == 0)
      cell
        .append("g")
        .style("color", "black")
        .call(d3.axisBottom(x).ticks(n_ticks))
        .call((g) => {
          g.selectAll(".tick text")
            .attr("dy", "-2em")
            .style("text-anchor", "start")
            .attr("transform", "rotate(-45)");
          g.selectAll(".tick line").attr("y2", -6);
          g.selectAll(".domain").remove();
          g.attr("transform", `translate(-0.5,0)`);
        })
        .call((g) => {
          const columnIndex = vis.columns.indexOf(var1);
          const bandWidth = vis.position.bandwidth();
          const innerPadding = vis.position.paddingInner();

          const y2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("y2", y2Value + 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);
        });

    if (vis.columns.indexOf(var1) == vis.columns.length - 1)
      cell
        .append("g")
        .style("color", "black")
        .attr("transform", `translate(${vis.position.bandwidth()},-0.5)`)
        .call(d3.axisLeft(y).ticks(n_ticks))
        .call((g) => {
          g.selectAll(".tick text")
            .attr("text-anchor", "start")
            .attr("dx", "2em");
          g.selectAll(".tick line").attr("x2", 6);
          g.selectAll(".domain").remove();
        })
        .call((g) => {
          const columnIndex =
            vis.columns.length - vis.columns.indexOf(var2) - 1;
          const bandWidth = vis.position.bandwidth();
          const innerPadding = vis.position.paddingInner();

          const x2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("x2", -x2Value - 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);
        });

    if (vis.columns.indexOf(var2) == vis.columns.length - 1)
      cell
        .append("g")
        .attr("transform", `translate(-0.5,${vis.position.bandwidth()})`)
        .style("color", "black")
        .call(d3.axisBottom(x).ticks(n_ticks))
        .call((g) => {
          const columnIndex =
            vis.columns.length - vis.columns.indexOf(var1) - 1;
          const bandWidth = vis.position.bandwidth();
          const innerPadding = vis.position.paddingInner();

          const y2Value =
            bandWidth * (columnIndex + innerPadding * (columnIndex - 1));

          g.selectAll(".tick line")
            .clone()
            .attr("y2", -y2Value - 1 * (columnIndex - 1))
            .attr("stroke-opacity", 0.1);

          g.selectAll(".tick text")
            .style("text-anchor", "start")
            .attr("transform", "rotate(45)");
          g.selectAll(".domain").remove();
        });
  }

  renderBigLineChart(var1, var2) {
    let vis = this;

    vis.chart.selectAll("*").remove();

    let xextent = d3.extent(vis.data, function (d) {
      return +d[var1];
    });
    let x = d3.scaleLinear().domain(xextent).nice().range([0, vis.squareSize]);

    let yextent = d3.extent(vis.data, function (d) {
      return +d[var2];
    });
    let y = d3.scaleLinear().domain(yextent).nice().range([vis.squareSize, 0]);

    vis.chart
      .append("rect")
      .attr("width", vis.squareSize)
      .attr("height", vis.squareSize)
      .attr("fill", "transparent")
      .on("mousedown", function (e) {
        if (e.ctrlKey) {
          vis.tooltip.style("opacity", 0);
          vis.bigChart = null;
          vis.updateVis();
        }
      });

    vis.chart
      .selectAll(".dots")
      .data(vis.data)
      .join("circle")
      .attr(
        "class",
        (d) => "circles" + vis.dict[d[vis.groupVar]] + " " + "dots"
      )
      .attr("cx", function (d) {
        return x(+d[var1]);
      })
      .attr("cy", function (d) {
        return y(+d[var2]);
      })
      .attr("r", vis.points_size)
      .attr("fill", function (d) {
        return vis.populationColors(d[vis.groupVar]);
      })
      .attr("opacity", 0.8);

    vis.chart
      .selectAll(".dots")
      .on("mouseover", function (e, d) {
        vis.tooltip.style("opacity", 1).html(
          `${vis.groupVar}:  ${d[vis.groupVar]}<br>
          ${vis.timeVar}:  ${d[vis.timeVar]}<br>
          ${var1}: ${d[var1].toFixed(3)} <br>
        ${var2}: ${d[var2].toFixed(3)} <br>`
        );
      })
      .on("mousemove", function (e) {
        moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on("mouseout", function () {
        vis.tooltip.style("opacity", 0);
      })
      .on("contextmenu", function (e, d) {
        e.preventDefault();
        vis.tooltip.style("opacity", 0);
        renderContextTooltip(vis.contextMenuTooltip, d);
        moveTooltip(e, vis.contextMenuTooltip, vis.chart);
      });

    vis.chart
      .append("g")
      .attr("transform", `translate(${0},${vis.squareSize})`)
      .style("color", "black")
      .call(d3.axisBottom(x).ticks(3));
    vis.chart
      .append("g")
      .attr("transform", `translate(${0},0)`)
      .style("color", "black")
      .call(d3.axisLeft(y).ticks(3));

    vis.chart
      .selectAll(".yAxisLabel")
      .data([null])
      .join("text")
      .attr("class", "yAxisLabel")
      .attr("transform", `translate(${-45},${vis.squareSize * 0.5})rotate(-90)`)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text(var2);

    vis.chart
      .selectAll(".xAxisLabel")
      .data([null])
      .join("text")
      .attr("class", "xAxisLabel")
      .attr(
        "transform",
        `translate(${vis.squareSize + 10},${vis.squareSize + 5})`
      )
      .attr("text-anchor", "start")
      .attr("font-size", "18px")
      .text(var1);

    vis.renderLegend();
    vis.bigChart = [var1, var2];
  }

  renderLegend() {
    const {
      populations,
      height,
      populationColors,
      legendMaxTextLength,
      dict,
      svg,
    } = this;
    const { selectedPopulations } = store.getState().correlation;
    const xMargin = 70,
      circleSize = 10,
      yGap = 40;

    const legend = svg
      .selectAll(".legendItem")
      .data(populations, (d) => d) // Key para evitar duplicados
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "legendItem")
            .call((g) => {
              g.append("circle");
              g.append("text");
              g.append("title");
            }),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("transform", (d, i) => {
        const totalHeight = populations.length * yGap;
        const topMargin = (height - totalHeight) / 2;
        return `translate(${xMargin + circleSize + 5}, ${
          yGap * i + topMargin
        })`;
      });

    // Actualizar elementos comunes
    legend
      .select("circle")
      .attr("r", circleSize)
      .style("fill", (d) => populationColors(d));

    legend
      .select("text")
      .attr("x", circleSize + 5)
      .attr("dy", "0.35em")
      .classed("notSelected", (d) => !selectedPopulations.includes(d))
      .text((d) =>
        d.length > legendMaxTextLength
          ? `${d.slice(0, legendMaxTextLength)}...`
          : d
      )
      .attr("name", (d) => dict[d])
      .style("cursor", "pointer")
      .on("click", (e, d) => {
        e.preventDefault();
        e.stopPropagation();

        const isSelected = selectedPopulations.includes(d);
        const newSelected = isSelected
          ? selectedPopulations.filter((pop) => pop !== d)
          : [...selectedPopulations, d];

        if (newSelected.length > 0 || !isSelected) {
          store.dispatch(setSelectedPopulations(newSelected));
        }
      });

    legend.select("title").text((d) => d);
  }
  configureZoom() {
    let vis = this;
    vis.geometric_zoom = d3.zoom().on("zoom", (e) => {
      vis.chart.attr(
        "transform",
        e.transform +
          " " +
          "translate(" +
          vis.margin.left +
          "," +
          vis.margin.top +
          ")"
      );
    });

    vis.chart.call(vis.geometric_zoom);
  }

  selectCell(var1, var2) {
    let element = document.getElementById(var2 + var1);
    d3.select(element)
      .attr("stroke", STROKE_SELECTION)
      .attr("stroke-width", 3)
      .transition()
      .duration(DURATION)
      .attr("stroke-width", 0);
  }

  resetZoom() {
    let vis = this;
    vis.chart.call(vis.geometric_zoom.transform, d3.zoomIdentity);
  }
}
