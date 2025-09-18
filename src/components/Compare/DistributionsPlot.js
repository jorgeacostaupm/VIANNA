import * as d3 from "d3";
import jstat from "jstat";

import store from "@/features/store";
import renderQTooltip from "@/utils/QuarantineTooltip";
import { ORDER_VARIABLE } from "@/utils/Constants";
import { moveTooltip } from "@/utils/functions";
import { pubsub } from "@/utils/pubsub";

const { publish } = pubsub;

function roundValue(value) {
  return +value % 1 !== 0 ? +value.toFixed(3) : +value;
}

export default class DistributionsPlot {
  constructor(parent) {
    this.parent = parent;

    this.margin = { top: 40, right: 40, bottom: 40, left: 80 };

    this.range = 0.8;
    this.pointSize = 5;
    this.nPoints = 100;
    this.strokeWidth = 0;
    this.legentPointSize = 15;
    this.estimator = "density";

    this.colorScheme = d3.schemeCategory10;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    vis.tooltip = d3.select("body").select("div.tooltip");
    if (vis.tooltip?.empty()) {
      vis.tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    vis.contextMenuTooltip = d3.select("body").select("div.contextTooltip");
    if (vis.contextMenuTooltip?.empty()) {
      vis.contextMenuTooltip = d3
        .select("body")
        .append("div")
        .attr("class", "contextTooltip")
        .style("display", "none");
    }

    vis.x_axis_g = vis.chart.append("g").attr("class", "x-axis");
    vis.y_axis_g = vis.chart.append("g").attr("class", "y-axis");
    vis.legend = d3.select("#compare-lines-legend");

    const dimensions = vis.parent.getBoundingClientRect();
    vis.setSize(dimensions);

    vis.hideGroups = [];
    vis.blurGroups = [];
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
    if (vis.estimator === "swarm") vis.renderSwarmPlot();
    else if (vis.estimator === "histogram") vis.renderHistogram();
    else if (vis.estimator === "density") vis.renderDensity();
  }

  updateVis() {
    let vis = this;

    vis.groupVar = store.getState().cantab.groupVar;
    vis.timeVar = store.getState().cantab.timeVar;
    vis.idVar = store.getState().cantab.idVar;
    vis.groups = store.getState().cantab.groups;

    vis.selectionGroups = store.getState().cantab.selectionGroups;

    vis.color = d3.scaleOrdinal().domain(vis.groups).range(vis.colorScheme);

    vis.estimator = vis.config.estimator;
    vis.nPoints = vis.config.nPoints;
    vis.variable = vis.config.variable;

    vis.chart.selectAll(".density").remove();
    if (vis.estimator === "swarm") {
      vis.renderSwarmPlot();
    } else {
      vis.chart.selectAll(".swarmPoint").remove();
    }
    if (vis.estimator === "histogram") vis.updateHistogram();
    else if (vis.estimator === "density") vis.updateDensity();
    vis.renderLegend();
  }

  renderSwarmPlot() {
    let vis = this;

    const {
      yForce,
      xForce,
      collideForce,
      alpha,
      alphaDecay,
      timeout,
      pointSize,
    } = vis.config;

    vis.chart.selectAll(".density").remove();
    const points = store.getState().dataframe.selection.map((point) => ({
      id: point[vis.idVar],
      value: point[vis.variable],
      [ORDER_VARIABLE]: point[ORDER_VARIABLE],
      group: point[vis.groupVar],
      timestamp: point[vis.timeVar],
    }));

    vis.xScale = d3
      .scaleBand()
      .domain(vis.selectionGroups)
      .range([0, vis.width]);

    const extent = d3.extent(points, (d) => d.value);
    const padding = (extent[1] - extent[0]) * 0.15;
    vis.yScale = d3
      .scaleLinear()
      .domain([extent[0] - padding, extent[1] + padding])
      .range([vis.height, 0])
      .nice();

    vis.chart
      .selectAll(".swarmPoint")
      .data(points, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "swarmPoint")
            .attr("fill", (d) => vis.color(d.group))
            .attr("r", pointSize)
            .on("mouseover", function (e, d) {
              const target = e.target;
              d3.select(target).style("stroke", "black").raise();
              vis.tooltip.style("opacity", 1);
              let html = `<strong>${d.group}</strong><br>`;

              html += d.id ? `${vis.idVar}: ${d.id}<br>` : "";
              html += d.timestamp ? `${vis.timeVar}: ${d.timestamp}<br>` : "";
              html += `${vis.variable}: ${roundValue(d.value)} <br>`;

              vis.tooltip.html(html);
            })
            .on("mousemove", function (e, d) {
              moveTooltip(e, vis.tooltip, vis.chart);
            })
            .on("mouseout", function (e, d) {
              const target = e.target;
              d3.select(target).style("stroke", null);
              vis.tooltip.style("opacity", 0);
            })
            .on("contextmenu", function (e, d) {
              e.preventDefault();
              vis.tooltip.style("opacity", 0);
              renderQTooltip(vis.contextMenuTooltip, d);
              moveTooltip(e, vis.contextMenuTooltip, vis.chart);
            }),
        (update) => {
          update.attr("r", pointSize);
        },
        (exit) => exit.remove()
      );

    points.forEach((d) => {
      d.x = vis.xScale(d.group) + vis.xScale.bandwidth() / 2;
      d.y = vis.yScale(d.value);
    });

    vis.chart.selectAll(".swarmPoint").style("opacity", 0);

    vis.chart.selectAll(".simMsg").remove();
    vis.chart
      .append("text")
      .attr("class", "simMsg")
      .attr("x", vis.width / 2)
      .attr("y", vis.height / 2)
      .attr("text-anchor", "middle")
      .text("Computing layout...");

    let simulation = d3
      .forceSimulation(points)
      .force(
        "x",
        d3
          .forceX((d) => vis.xScale(d.group) + vis.xScale.bandwidth() / 2)
          .strength(xForce)
      )

      .force("y", d3.forceY((d) => vis.yScale(d.value)).strength(yForce))
      .force(
        "collide",
        d3.forceCollide((d) => pointSize).strength(collideForce)
      )
      .alpha(alpha)
      .on("tick", () => {
        tick();
      })
      .on("end", () => vis.chart.selectAll(".simMsg").remove());

    function tick() {
      vis.chart
        .selectAll(".swarmPoint")
        .style("opacity", 1)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    }

    setTimeout(() => simulation.alphaDecay(alphaDecay), timeout);

    vis.x_axis_g.call(d3.axisBottom(vis.xScale));
    vis.y_axis_g.call(d3.axisLeft(vis.yScale));
  }

  updateDensity() {
    let vis = this;
    let allValues = vis.data.map((d) => +d.value);
    const { useCustomRange, range, margin } = vis.config;

    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    const rangeV = maxV - minV;
    const plotMargin = margin * rangeV;

    vis.xMin = useCustomRange ? range[0] : minV - plotMargin;
    vis.xMax = useCustomRange ? range[1] : maxV + plotMargin;

    const pointEstimator = computeEstimator(
      vis.nPoints,
      vis.estimator,
      vis.xMin,
      vis.xMax
    );

    console.log(vis.selectionGroups, "groups");

    vis.densities = vis.selectionGroups.map((group) => {
      const values = vis.data
        .filter(function (d) {
          return d.type === group;
        })
        .map(function (d) {
          return +d.value;
        });
      const density = pointEstimator(values, group);
      return { value: density, group: group };
    });

    vis.yMax = Math.max(
      ...vis.densities
        .map((d) => d.value)
        .flat()
        .map((d) => d[1])
    );

    vis.renderDensity();
  }

  renderDensity() {
    let vis = this;

    vis.xScale = d3
      .scaleLinear()
      .domain([vis.xMin, vis.xMax])
      .range([0, vis.width])
      .nice();
    vis.yScale = d3
      .scaleLinear()
      .range([vis.height, 0])
      .domain([0, vis.yMax])
      .nice();

    vis.chart
      .selectAll(".density")
      .data(vis.densities)
      .join("path")
      .attr("class", "density")
      .classed("hide", (d) => vis.hideGroups.includes(d.group))
      .classed("blur", (d) => !vis.blurGroups.includes(d.group))
      .attr("fill", (d) => vis.color(d.group))
      .attr("stroke", (d) => vis.color(d.group))
      .attr("stroke-width", vis.strokeWidth)
      .attr("d", (d) =>
        d3
          .line()
          .x(function (d) {
            return vis.xScale(d[0]);
          })
          .y(function (d) {
            return vis.yScale(d[1]);
          })
          .curve(d3.curveBasis)(d.value)
      )
      .on("mouseover", function (e, d) {
        vis.chart.selectAll(".density").classed("tmp-blur", true);
        d3.select(this).classed("tmp-noblur", true).raise();

        vis.showStats(d.group);
      })
      .on("mouseout", function () {
        vis.chart
          .selectAll(".density")
          .classed("tmp-blur", false)
          .classed("tmp-noblur", false);
      });

    vis.x_axis_g.call(d3.axisBottom(vis.xScale));

    vis.y_axis_g.call(d3.axisLeft(vis.yScale));
  }

  hideStats() {
    this.chart.selectAll(".stat-line").remove();
    this.chart.selectAll(".stat-label").remove();
  }

  showStats(group) {
    const valores = this.data
      .filter((pt) => pt.type === group)
      .map((pt) => +pt.value);

    const media = jstat.mean(valores);
    const sd = jstat.stdev(valores);

    const stats = [
      ["µ", media],
      ["–σ", media - sd],
      ["+σ", media + sd],
    ];

    stats.forEach(([label, val], i) => {
      this.chart
        .append("line")
        .attr("class", `stat-line stat-line--${i}`)
        .attr("x1", this.xScale(val))
        .attr("x2", this.xScale(val))
        .attr("y1", 0)
        .attr("y2", this.height)
        .attr("stroke", "#000")
        .attr("stroke-dasharray", i === 0 ? null : "2,2")
        .attr("stroke-width", 1);

      if (label === "µ") {
        this.chart
          .append("text")
          .attr("class", `stat-label stat-label--${i}`)
          .attr("x", this.xScale(val))
          .attr("y", -10)
          .style("font-weight", "bold")
          .attr("text-anchor", "end")
          .text(`${label}: ${val.toFixed(2)}`);

        this.chart
          .append("text")
          .attr("class", `stat-label stat-label--${i}`)
          .attr("x", this.xScale(val) + 5)
          .attr("y", -10)
          .style("font-weight", "bold")
          .attr("text-anchor", "start")
          .text(`${"σ"}: ${sd.toFixed(2)}`);
      } else {
        this.chart
          .append("text")
          .attr("class", `stat-label stat-label--${i}`)
          .attr(
            "x",
            label === "–σ" ? this.xScale(val) - 5 : this.xScale(val) + 5
          )
          .attr("y", this.height * 0.1)
          .attr("text-anchor", label === "–σ" ? "end" : "start")
          .text(`${label}: ${val.toFixed(2)}`);
      }
    });
  }

  updateHistogram() {
    let vis = this;
    let allValues = vis.data.map((d) => +d.value);

    vis.xMin = Math.min(...allValues);
    vis.xMax = Math.max(...allValues);

    const pointEstimator = computeEstimator(
      vis.nPoints,
      vis.estimator,
      vis.xMin,
      vis.xMax
    );

    vis.densities = vis.selectionGroups.map((group) => {
      const values = vis.data
        .filter(function (d) {
          return d.type === group;
        })
        .map(function (d) {
          return +d.value;
        });
      const density = pointEstimator(values);
      return { value: density, group: group };
    });

    vis.yMax = Math.max(
      ...vis.densities
        .map((d) => d.value)
        .flat()
        .map((d) => d[1])
    );

    vis.renderHistogram();
  }

  renderHistogram() {
    let vis = this;

    vis.xScale = d3
      .scaleLinear()
      .domain([vis.xMin, vis.xMax])
      .range([0, vis.width - 20]);
    vis.yScale = d3
      .scaleLinear()
      .range([vis.height, 0])
      .domain([0, vis.yMax])
      .nice();

    const bandwidth =
      (vis.xScale(vis.xMax) - vis.xScale(vis.xMin)) / vis.nPoints;

    const binWidth = (vis.xMax - vis.xMin) / vis.nPoints;

    vis.chart
      .selectAll(".density")
      .data(vis.densities)
      .join("g")
      .attr("class", "density")
      .classed("hide", (d) => vis.hideGroups.includes(d.group))
      .classed("blur", (d) => !vis.blurGroups.includes(d.group))
      .each(function (d) {
        d3.select(this)
          .selectAll("rect")
          .data(d.value)
          .join("rect")
          .attr("x", (bin) => vis.xScale(bin[0]))
          .attr("y", (bin) => vis.yScale(bin[1]))
          .attr("width", bandwidth)
          .attr("height", (bin) => vis.height - vis.yScale(bin[1]))
          .attr("fill", vis.color(d.group))
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .on("mouseover", function (e, item) {
            vis.tooltip.style("opacity", 1);
            vis.tooltip.html(`
              <strong>${d.group}</strong> <br/>
              ${item[0].toFixed(2)} to ${(item[0] + binWidth).toFixed(2)} <br/>
              nº items: ${item[1]}
              `);
          })
          .on("mousemove", function (e, d) {
            moveTooltip(e, vis.tooltip, vis.chart);
          })
          .on("mouseout", function () {
            vis.tooltip.style("opacity", 0);
          });
      });

    vis.x_axis_g.call(d3.axisBottom(vis.xScale));

    vis.y_axis_g.call(d3.axisLeft(vis.yScale));
  }

  renderLegend() {
    const vis = this;
    const circleSize = 10;
    const padding = 6;
    const lineHeight = circleSize * 2 + padding;

    vis.legend.selectAll("*").remove();

    const legendGroup = vis.legend.append("g").attr("class", "legend-group");

    legendGroup
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("class", "legendTitle")
      .text(`${vis.groupVar}:`);

    vis.selectionGroups.forEach((d, i) => {
      const y = i * lineHeight + 50;
      const legendItem = legendGroup
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(0,${y})`);

      const circle = legendItem
        .append("circle")
        .attr("class", "legend-circle")
        .attr("cx", circleSize + 10)
        .attr("cy", 0)
        .attr("r", circleSize)
        .style("fill", vis.color(d))
        .on("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sel = d3.select(e.currentTarget);
          const isBlur = sel.classed("blur");
          const idx = vis.blurGroups.indexOf(d);
          if (idx > -1) vis.blurGroups.splice(idx, 1);
          else vis.blurGroups.push(d);

          vis.chart
            .selectAll(".density")
            .filter((dd) => dd.group === d)
            .classed("blur", !isBlur)
            .raise();

          sel.classed("blur", !isBlur);
        });

      const label = legendItem
        .append("text")
        .attr("class", "legend-label")
        .classed("cross", vis.hideGroups.includes(d))
        .attr("x", circleSize * 2 + 15)
        .attr("y", 4)
        .style("cursor", "pointer")
        .text(d)
        .on("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sel = d3.select(e.currentTarget);
          const isHide = sel.classed("cross");
          const idx = vis.hideGroups.indexOf(d);
          if (idx > -1) vis.hideGroups.splice(idx, 1);
          else vis.hideGroups.push(d);

          vis.chart
            .selectAll(".density")
            .filter((dd) => dd.group === d)
            .classed("hide", !isHide)
            .classed("highlight", isHide)
            .raise();

          sel.classed("cross", !isHide);
        });
      if (vis.estimator !== "swarm") {
        legendItem
          .on("mouseover", () => {
            vis.chart
              .selectAll(".density")
              .filter((dd) => dd.group === d)
              .classed("highlight", true)
              .raise();
            if (this.estimator === "density") this.showStats(d);
          })
          .on("mouseout", () => {
            vis.chart
              .selectAll(".density")
              .filter((dd) => dd.group === d)
              .classed("highlight", false);
            if (this.estimator === "density") this.hideStats();
          });

        label.on("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sel = d3.select(e.currentTarget);
          const isHide = sel.classed("cross");
          const idx = vis.hideGroups.indexOf(d);
          if (idx > -1) vis.hideGroups.splice(idx, 1);
          else vis.hideGroups.push(d);

          vis.chart
            .selectAll(".density")
            .filter((dd) => dd.group === d)
            .classed("hide", !isHide)
            .classed("highlight", isHide)
            .raise();

          sel.classed("cross", !isHide);
        });

        circle
          .classed("blur", !vis.blurGroups.includes(d))
          .on("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sel = d3.select(e.currentTarget);
            const isBlur = sel.classed("blur");
            const idx = vis.blurGroups.indexOf(d);
            if (idx > -1) vis.blurGroups.splice(idx, 1);
            else vis.blurGroups.push(d);

            vis.chart
              .selectAll(".density")
              .filter((dd) => dd.group === d)
              .classed("blur", !isBlur)
              .raise();

            sel.classed("blur", !isBlur);
          });
      }
    });

    const bbox = legendGroup.node().getBBox();

    const parent = vis.legend.node().parentNode;
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

    vis.legend
      .attr("width", bbox.x + bbox.width)
      .attr("height", bbox.y + bbox.height);
  }
}

function computeEstimator(numPoints, estimator, min, max) {
  if (estimator == "histogram") {
    return function histogramDensity(array) {
      const binWidth = (max - min) / numPoints;
      const bins = Array(numPoints).fill(0);

      array.forEach((value) => {
        if (value >= min && value <= max) {
          let binIndex = Math.floor((value - min) / binWidth);
          binIndex = Math.min(binIndex, numPoints - 1);
          bins[binIndex]++;
        }
      });

      const histogram = bins.map((count, i) => {
        const binCenter = min + binWidth * i;
        return [Number(binCenter), count];
      });

      return histogram;
    };
  } else {
    return function gaussianDensity(data, group) {
      data.sort((a, b) => a - b);

      const std = jstat.stdev(data);

      if (std === 0) {
        const uniformValue = data[0];
        let configuration = {
          message: `Group ${group} has a Uniform Distribution`,
          description: `Uniform Value: ${uniformValue}`,
          type: "info",
          pauseOnHover: true,
        };
        publish("notification", configuration);

        return Array.from({ length: numPoints }, (_, i) => [uniformValue, 1]);
      }

      const n = data.length;
      let bandwidth = 1.06 * std * Math.pow(n, -0.2);

      const step = (max - min) / (numPoints - 1);
      const xValues = Array.from(
        { length: numPoints },
        (_, i) => min + i * step
      );

      const tmp = xValues.map((x) => {
        const kernelEstimate = data.reduce((sum, xi) => {
          return sum + gaussianKernel((x - xi) / bandwidth);
        }, 0);
        return [x, kernelEstimate / (data.length * bandwidth)];
      });

      const maxDensity = Math.max(...tmp.map(([x, d]) => d));
      const density = tmp.map(([x, d]) => [x, d / maxDensity]);
      return density;
    };
  }
}

function gaussianKernel(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/* allValues.sort((a, b) => a - b);
    let points = 100;

    const step = (max - min) / (points - 1);
    const xValues = Array.from({ length: points }, (_, i) => min + i * step);

    return kernelDensityEstimator(kernelEpanechnikov(7), xValues);


function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [
        x,
        d3.mean(V, function (v) {
          return kernel(x - v);
        })
      ];
    });
  };
}

function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}

 */
