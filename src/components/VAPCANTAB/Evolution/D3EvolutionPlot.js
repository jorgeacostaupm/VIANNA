import * as d3 from "d3";
import "./styles.css";
import store from "@/components/VAPUtils/features/store";
import { moveTooltip } from "@/components/VAPUtils/functions";
import { computeEvolutionSubjectData } from "../../VAPUtils/functions";
import { roundValue } from "@/components/VAPUtils/functions";

import {
  setHideGroups,
  setBlurGroups,
} from "../../VAPUtils/features/evolution/evolutionSlice";

import { DEFAULT_ORDER_VARIABLE } from "@/components/VAPCANTAB/Utils/constants/Constants";
import { renderContextTooltip } from "@/components/VAPUtils/functions";

export class D3EvolutionPlot {
  constructor(parent, data) {
    this.parent = parent;
    this.data = data;
    this.margin = { top: 50, right: 20, bottom: 50, left: 80 };
    this.showStds = false;
    this.showMeans = false;
    this.color_scheme = d3.schemeCategory10;
    this.legend_points_size = 15;
    this.meanPointSize = 10;
    this.subjectPointSize = 5;
    this.subjectStrokeWidth = 2;
    this.meanStrokeWidth = 5;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    vis.tooltip = d3.select("#evolution-tooltip").attr("class", "tooltip");
    vis.contextMenuTooltip = d3
      .select("#contextmenu-tooltip")
      .attr("class", "contexMenuTooltip")
      .style("display", "none");

    vis.x_axis_g = vis.chart.append("g").attr("class", "x-axis");
    vis.y_axis_g = vis.chart.append("g").attr("class", "y-axis");
    vis.legendSVG = d3.select("#evolution-lines-legend");

    const dimensions = vis.parent.getBoundingClientRect();
    vis.setSize(dimensions);
  }

  setSize(dimensions) {
    let vis = this;
    const { width, height } = dimensions;
    vis.width = width - vis.margin.left - vis.margin.right;
    vis.height = height - vis.margin.top - vis.margin.bottom;
    vis.total_width = width;
    vis.x_axis_g.attr("transform", `translate(0, ${vis.height})`);
  }

  onResize(dimensions) {
    let vis = this;
    vis.setSize(dimensions);
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.populations = store.getState().cantab.selection_populations;
    vis.groups = store.getState().cantab.populations;

    vis.hideGroups = store.getState().evolution.hideGroups;
    vis.blurGroups = store.getState().evolution.blurGroups;

    vis.selectionPoints = store.getState().cantab.selection;
    vis.times = store.getState().cantab.selection_times;
    vis.times = vis.times.map((t) => "" + t).sort();

    vis.variable = store.getState().evolution.selectedVar;
    vis.population = store.getState().evolution.selectedPopulation;

    vis.groupVar = store.getState().cantab.group_var;
    vis.timeVar = store.getState().cantab.time_var;
    vis.idVar = store.getState().cantab.idVar;
    console.log(vis.selectionPoints, vis.variable);
    vis.idGroups = computeEvolutionSubjectData(
      vis.selectionPoints,
      vis.variable
    );

    vis.dataReady = [];

    const sort_func = (a, b) => {
      return (
        vis.times.indexOf(a[vis.timeVar]) - vis.times.indexOf(b[vis.timeVar])
      );
    };

    vis.idGroups.forEach(function (d) {
      d[1].sort(sort_func);

      const group = d[1][0][vis.groupVar];
      d[2] = group;
    });

    const { y_min, y_max } = findMinAndMaxSubjects(vis.idGroups, vis.variable);

    vis.color = d3.scaleOrdinal().domain(vis.groups).range(vis.color_scheme);

    vis.x_scale = d3.scaleBand().range([0, vis.width]).domain(vis.times);
    const margin = (y_max - y_min) * 0.1; // Margen del 10% del rango

    vis.y_scale = d3
      .scaleLinear()
      .domain([y_min - margin, y_max + margin])
      .range([vis.height, 0]);

    vis.idLine = d3
      .line()
      .x((d) => {
        return vis.x_scale(d[vis.timeVar]) + vis.x_scale.bandwidth() / 2;
      })
      .y((d) => vis.y_scale(+d[vis.variable]))
      .bind(this);

    vis.updateMeans();
    if (vis.idVar) vis.renderSubjects();

    vis.renderLegend();

    vis.chart
      .selectAll(".yAxisLabel")
      .data([null]) // No necesitamos datos para una única etiqueta de eje.
      .join("text")
      .attr("class", "yAxisLabel")
      .attr("transform", `translate(-30,${-15})rotate(0)`)
      .attr("text-anchor", "start")
      .text(vis.variable);

    vis.x_axis_g.call(d3.axisBottom(vis.x_scale));
    vis.y_axis_g.call(d3.axisLeft(vis.y_scale));
  }

  updateMeans() {
    let vis = this;

    vis.dataReady = [];

    const sort_func = (a, b) => {
      return vis.times.indexOf(a.time) - vis.times.indexOf(b.time);
    };

    vis.data.forEach(function (grp, i) {
      const allTime = Object.keys(grp).filter((d) => d !== "population");

      const items = allTime.map((time) => ({
        time: time,
        value: grp[time],
        name: grp["population"],
      }));

      vis.dataReady.push({
        name: grp["population"],
        values: items.sort(sort_func),
        id: i,
      });
    });

    vis.line = d3
      .line()
      .x((d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
      .y((d) => vis.y_scale(+d.value.mean));

    vis.area = d3
      .area()
      .x((d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
      .y0((d) => vis.y_scale(+d.value.mean + +d.value.std))
      .y1((d) => vis.y_scale(+d.value.mean - +d.value.std));

    vis.renderMeans();
  }

  renderMeans() {
    let vis = this;
    console.log("renderMEANS", this.dataReady, vis.variable);
    vis.chart
      .selectAll(".evolutionMean")
      .data(vis.dataReady)
      .join("g")
      .attr("class", "evolutionMean")
      .classed("hide", (d) => d.name !== vis.population)
      .each(function (d) {
        console.log("D", d);
        d3.select(this)
          .selectAll(".evolutionMeanLine")
          .data([d])
          .join("path")
          .attr("class", "evolutionMeanLine")
          .attr("d", (d) => vis.line(d.values))
          .attr("stroke", (d) => vis.color(d.name))
          .style("stroke-width", vis.meanStrokeWidth)
          .style("fill", "none");

        d3.select(this)
          .selectAll(".evolutionStd")
          .data([d])
          .join("path")
          .attr("class", "evolutionStd")
          .attr("d", (d) => vis.area(d.values))
          .attr("fill", (d) => vis.color(d.name))
          .style("opacity", 0.3)
          .style("stroke", "none");

        d3.select(this)
          .selectAll(".means")
          .data([d])
          .join("g")
          .style("fill", (d) => vis.color(d.name))
          .attr("class", "means")
          .selectAll(".mean")
          .data((d) => d.values)
          .join("circle")
          .attr("class", "mean")
          .attr("cx", (d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
          .attr("cy", (d) => vis.y_scale(d.value.mean))
          .attr("r", vis.meanPointSize)
          .style("opacity", 1)
          .on("mouseover", function (event, d) {
            vis.tooltip.style("opacity", 1).html(`
                Measure: ${vis.variable} <br>
                Mean: ${d.value.mean.toFixed(2)} <br>
                Stdv: ${d.value.std.toFixed(2)} <br>
                Population: ${d.name}
              `);
          })
          .on("mousemove", function (e, d) {
            moveTooltip(e, vis.tooltip, vis.chart);
          })
          .on("mouseout", function () {
            vis.tooltip.style("opacity", 0);
          })
          .on("click", function (event, d) {});
      })
      .on("mouseover", function (e, d) {
        vis.chart.selectAll(".evolutionMean").style("opacity", 0);
        d3.select(this).style("opacity", 1).raise();
      })
      .on("mouseout", function () {
        vis.chart.selectAll(".evolutionMean").style("opacity", null);
      })
      .raise();
  }

  renderSubjects() {
    let vis = this;

    vis.chart
      .selectAll(".evolution")
      .data(vis.idGroups)
      .join("g")
      .attr("class", "evolution")
      .classed("hide", (d) => d[2] !== vis.population)
      .classed("blur", true)
      .each(function (d) {
        d3.select(this)
          .selectAll(".subjectLine")
          .data([d[1]])
          .join("path")
          .attr("class", "subjectLine")
          .attr("d", (d) => vis.idLine(d))
          .attr("stroke", vis.color(d[2]))
          .style("stroke-width", vis.subjectStrokeWidth)
          .style("fill", "none");

        d3.select(this)
          .selectAll(".subjectPoint")
          .data(d[1])
          .join("circle")
          .attr("class", "subjectPoint")
          .attr("fill", vis.color(d[2]))
          .attr(
            "cx",
            (d) => vis.x_scale(d[vis.timeVar]) + vis.x_scale.bandwidth() / 2
          )
          .attr("cy", (d) => vis.y_scale(d[vis.variable]))
          .attr("r", vis.subjectPointSize)
          .attr("stroke", "transparent")
          .on("mouseover", function (event, d) {
            vis.tooltip.style("opacity", 1).html(`
                Measure: ${vis.variable} <br>
                Value: ${d[vis.variable]} <br>
              `);
          })
          .on("mousemove", function (e, d) {
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
      })
      .on("mouseover", function (e, d) {
        if (e.target.classList.contains("subjectLine")) return;
        vis.chart.selectAll(".evolution").style("opacity", 0);
        d3.select(this).style("opacity", 1).raise();
      })
      .on("mouseout", function () {
        vis.chart.selectAll(".evolution").style("opacity", null);
      })
      .on("click", function (e, d) {
        const isSelected = d3.select(this).classed("selected");
        d3.select(this).classed("selected", !isSelected);
      })
      .raise();
  }

  renderLegend() {
    let vis = this;
    vis.legendSVG.node().innerHTML = "";
    const circleSize = 14;

    vis.legendSVG
      .selectAll(".populationVariable")
      .data([vis.groupVar])
      .join("text")
      .attr("class", "populationVariable")
      .attr("x", 0)
      .attr("y", 15)
      .text((d) => "Group Variable: " + d)
      .append("title")
      .text((d) => d);

    vis.legendSVG
      .selectAll(".legend-circle")
      .data(vis.populations)
      .join("circle")
      .attr("class", "legend-circle")
      .classed("blur", true)
      .classed("circleSelected", (d) => d === vis.population)
      .attr("cx", 20 + circleSize)
      .attr("cy", (d, i) => 50 + 45 * i)
      .attr("r", circleSize)
      .style("fill", (d) => vis.color(d))
      .on("mouseover", function (e, d) {})
      .on("mousemove", function (e) {
        //moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on("mouseout", function () {
        //vis.tooltip.style('opacity', 0);
      })
      .on("click", (e, d) => {
        e.preventDefault();
        e.stopPropagation();

        const item = d3.select(e.target);
        const isBlur = item.classed("blur");

        /* let blurGroups = store.getState().evolution.blurGroups;
        if (isBlur) {
          blurGroups = blurGroups.filter((g) => g !== d);
        } else {
          blurGroups = [...blurGroups, d];
        }
        store.dispatch(setBlurGroups(blurGroups)); */

        vis.chart
          .selectAll(".evolution")
          .filter((evo) => {
            return evo[2] === d;
          })
          .classed("blur", !isBlur)
          .raise();

        item.classed("blur", !isBlur);
      })
      .on("contextmenu", (e, d) => {
        e.preventDefault();
        e.stopPropagation();

        const item = d3.select(e.target);
        const isCricleSelected = item.classed("circleSelected");
        console.log("dsfsfsdf", d, isCricleSelected);
        vis.chart
          .selectAll(".evolutionMean")
          .filter((evo) => {
            console.log(evo);
            return evo.name === d;
          })
          .classed("hide", isCricleSelected)
          .raise();

        item.classed("circleSelected", !isCricleSelected);
      });

    vis.legendSVG
      .selectAll(".legend")
      .data(vis.populations)
      .join("text")
      .attr("class", "legend")
      .classed("cross", (d) => d !== vis.population)
      .classed("not_selected", false)
      .attr("x", 20 + circleSize * 2 + 10)
      .attr("y", (d, i) => 53 + 45 * i)
      .text((d) => d)
      .style("cursor", "pointer")
      .on("mouseover", function (e, d) {})
      .on("mousemove", function (e) {
        //moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on("mouseout", function () {
        //vis.tooltip.style('opacity', 0);
      })
      .on("click", (e, d) => {
        e.preventDefault();
        e.stopPropagation();

        const item = d3.select(e.target);
        const isHide = item.classed("cross");

        /* let hideGroups = store.getState().evolution.hideGroups;
        if (isHide) {
          hideGroups = hideGroups.filter((g) => g !== d);
        } else {
          hideGroups = [...hideGroups, d];
        }
        console.log('HIDE GROUPS', hideGroups);
        store.dispatch(setHideGroups(hideGroups)); */

        vis.chart
          .selectAll(".evolution")
          .filter((evo) => {
            return evo[2] === d;
          })
          .classed("hide", !isHide)
          .raise();

        item.classed("cross", !isHide);
      });

    const bbox = vis.legendSVG.node().getBBox();
    vis.legendSVG.attr("height", bbox.height + bbox.y + 20);
  }

  updateSizes() {
    this.chart
      .selectAll(".mean")
      .attr("display", this.showMeans ? "block" : "none");
    this.chart
      .selectAll(".evolutionMeanLine")
      .attr("display", this.showMeans ? "block" : "none");
    this.chart
      .selectAll(".evolutionStd")
      .attr("display", this.showStds ? "block" : "none");
    this.chart.selectAll(".mean").attr("r", this.meanPointSize);
    this.chart.selectAll(".subjectPoint").attr("r", this.subjectPointSize);
    this.chart
      .selectAll(".evolutionMeanLine")
      .style("stroke-width", this.meanStrokeWidth);
    this.chart
      .selectAll(".subjectLine")
      .style("stroke-width", this.subjectStrokeWidth);
  }
}

function findMinAndMax(data) {
  let y_min = Infinity;
  let y_max = -Infinity;

  data.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      // Ignorar la clave 'time'
      if (key !== "time") {
        const numericValue = parseFloat(value.mean);
        if (numericValue < y_min) {
          y_min = numericValue;
        }
        if (numericValue > y_max) {
          y_max = numericValue;
        }
      }
    });
  });

  return { y_min, y_max };
}

function findMaxStd(data) {
  let y_min = Infinity;
  let y_max = -Infinity;

  data.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      // Ignorar la clave 'time'
      if (key !== "time") {
        const numericValue = parseFloat(value.std);
        if (numericValue < y_min) {
          y_min = numericValue;
        }
        if (numericValue > y_max) {
          y_max = numericValue;
        }
      }
    });
  });

  return y_max;
}

function findMinAndMaxSubjects(idGroups, variable) {
  let allValues = idGroups.flatMap(
    (group) => group[1].map((item) => +item[variable]) // Convertir a número para evitar errores con strings
  );

  return {
    y_min: Math.min(...allValues),
    y_max: Math.max(...allValues),
  };
}
