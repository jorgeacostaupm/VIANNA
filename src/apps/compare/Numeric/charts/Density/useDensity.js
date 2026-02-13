import * as d3 from "d3";
import jstat from "jstat";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import useResizeObserver from "@/hooks/useResizeObserver";
import useGroupColorDomain from "@/hooks/useGroupColorDomain";
import { notifyInfo } from "@/utils/notifications";
import { CHART_OUTLINE } from "@/utils/chartTheme";
import {
  attachTickLabelGridHover,
  paintLayersInOrder,
} from "@/utils/gridInteractions";

export const numMargin = { top: 50, right: 50, bottom: 50, left: 90 };

export default function useDensity({ chartRef, legendRef, data, config }) {
  const dimensions = useResizeObserver(chartRef);
  const groupVar = useSelector((s) => s.compare.groupVar);
  const groups = Array.from(new Set((data || []).map((d) => d.type))).filter(
    (value) => value != null
  );
  const { colorDomain, orderedGroups: selectionGroups } = useGroupColorDomain(
    groupVar,
    groups
  );
  const groupsKey = selectionGroups.join("|");
  const [hide, setHide] = useState([]);
  const [blur, setBlur] = useState(selectionGroups);

  useEffect(() => {
    setHide([]);
    setBlur(selectionGroups);
  }, [groupsKey]);

  useEffect(() => {
    if (!dimensions || !data || !chartRef.current || !legendRef.current) return;

    const { width, height } = dimensions;
    const { nPoints, useCustomRange, range, margin, showLegend, showGrid } =
      config;
    const [xMin, xMax] = getNumericDomain(data, {
      margin,
      useCustomRange,
      range,
    });
    const pointEstimator = computeEstimator(nPoints, xMin, xMax);
    const densities = getDensities(data, selectionGroups, pointEstimator);
    const yMax = getYMax(densities);

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(legendRef.current).selectAll("*").remove();

    const colorScheme = d3.schemeCategory10;
    const chartWidth = width - numMargin.left - numMargin.right;
    const chartHeight = height - numMargin.top - numMargin.bottom;

    const svg = d3.select(chartRef.current);
    const legend = d3.select(legendRef.current);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${numMargin.left},${numMargin.top})`);

    const color = d3.scaleOrdinal().domain(colorDomain).range(colorScheme);
    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, chartWidth]);
    const y = d3.scaleLinear().range([chartHeight, 0]).domain([0, yMax]);

    let yGridG = null;
    if (showGrid) {
      yGridG = chart
        .append("g")
        .attr("class", "grid y-grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""))
        .call((g) => g.select(".domain").remove());
    }

    const xAxisG = chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));
    xAxisG.select(".domain").remove();
    xAxisG.selectAll(".tick line").remove();

    const yAxisG = chart.append("g").call(d3.axisLeft(y).ticks(5));
    yAxisG.select(".domain").remove();
    yAxisG.selectAll(".tick line").remove();

    if (showGrid && yGridG) {
      attachTickLabelGridHover({
        axisGroup: yAxisG,
        gridGroup: yGridG,
      });
    }

    chart
      .selectAll(".density")
      .data(densities)
      .join("path")
      .attr("class", "density")
      .attr("fill", (d) => color(d.group))
      .classed("hide", (d) => hide.includes(d.group))
      .classed("blur", (d) => blur.includes(d.group))
      .attr("d", (d) =>
        d3
          .line()
          .x(function (d) {
            return x(d[0]);
          })
          .y(function (d) {
            return y(d[1]);
          })
          .curve(d3.curveBasis)(d.value),
      )
      .on("mouseover", function (e, d) {
        chart.selectAll(".density").classed("tmp-blur", true);
        d3.select(this).classed("tmp-noblur", true).raise();

        showStats(d.group);

        if (showGrid && yGridG) {
          paintLayersInOrder({
            chartGroup: chart,
            layers: [xAxisG, yAxisG, yGridG],
          });
        }
      })
      .on("mouseout", function () {
        hideStats();
        chart
          .selectAll(".density")
          .classed("tmp-blur", false)
          .classed("tmp-noblur", false);
      });

    if (showLegend !== false) {
      renderLegend(
        legend,
        selectionGroups,
        color,
        blur,
        setBlur,
        hide,
        setHide,
        showStats,
        hideStats,
      );
    }

    if (showGrid && yGridG) {
      paintLayersInOrder({
        chartGroup: chart,
        layers: [xAxisG, yAxisG, yGridG],
      });
    }

    function hideStats() {
      chart.selectAll(".stat-line").remove();
      chart.selectAll(".stat-label").remove();
    }

    function showStats(group) {
      const vals = data
        .filter((pt) => pt.type === group)
        .map((pt) => +pt.value);

      const mean = jstat.mean(vals);
      const std = jstat.stdev(vals);

      const stats = [
        ["µ", mean],
        ["–σ", mean - std],
        ["+σ", mean + std],
      ];

      stats.forEach(([label, val], i) => {
        chart
          .append("line")
          .attr("class", `stat-line stat-line--${i}`)
          .attr("x1", x(val))
          .attr("x2", x(val))
          .attr("y1", 0)
          .attr("y2", chartHeight)
          .attr("stroke", CHART_OUTLINE)
          .attr("stroke-dasharray", i === 0 ? null : "2,2")
          .attr("stroke-width", 1);

        if (label === "µ") {
          chart
            .append("text")
            .attr("class", `stat-label stat-label--${i}`)
            .attr("x", x(val))
            .attr("y", -10)
            .style("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(`${label}: ${val.toFixed(2)}`);

          chart
            .append("text")
            .attr("class", `stat-label stat-label--${i}`)
            .attr("x", x(val) + 5)
            .attr("y", -10)
            .style("font-weight", "bold")
            .attr("text-anchor", "start")
            .text(`${"σ"}: ${std.toFixed(2)}`);
        } else {
          chart
            .append("text")
            .attr("class", `stat-label stat-label--${i}`)
            .attr("x", label === "–σ" ? x(val) - 5 : x(val) + 5)
            .attr("y", chartHeight * 0.1)
            .attr("text-anchor", label === "–σ" ? "end" : "start")
            .text(`${label}: ${val.toFixed(2)}`);
        }
      });
    }
  }, [data, config, dimensions, groupsKey, colorDomain]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = d3.select(chartRef.current);
    chart
      .selectAll(".density")
      .classed("hide", (d) => hide.includes(d.group))
      .classed("blur", (d) => blur.includes(d.group));
  }, [hide, blur]);
}

export function getNumericDomain(
  data,
  {
    margin = 0.05,
    range = [0, 1],
    useCustomRange = false,
    accessor = (d) => +d.value,
  } = {},
) {
  if (!data || data.length === 0) {
    return [range[0], range[1]];
  }

  const { min, max } = data.reduce(
    (acc, d) => {
      const value = accessor(d);
      if (Number.isFinite(value)) {
        if (value < acc.min) acc.min = value;
        if (value > acc.max) acc.max = value;
      }
      return acc;
    },
    { min: Infinity, max: -Infinity },
  );

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [range[0], range[1]];
  }

  const rangeV = max - min || 1;
  const plotMargin = margin * rangeV;

  return useCustomRange
    ? [range[0], range[1]]
    : [min - plotMargin, max + plotMargin];
}

export function computeEstimator(numPoints, min, max) {
  return function gaussianDensity(data, group) {
    data.sort((a, b) => a - b);
    const std = jstat.stdev(data);

    if (std === 0) {
      const uniformValue = data[0];
      notifyInfo({
        message: `Group ${group} has a Uniform Distribution`,
        description: `Uniform Value: ${uniformValue}`,
        pauseOnHover: true,
      });

      return Array.from({ length: numPoints }, () => [uniformValue, 1]);
    }

    const n = data.length;
    let bandwidth = 1.06 * std * Math.pow(n, -0.2);

    const step = (max - min) / (numPoints - 1);
    const xValues = Array.from({ length: numPoints }, (_, i) => min + i * step);

    const tmp = xValues.map((x) => {
      const kernelEstimate = data.reduce((sum, xi) => {
        return sum + gaussianKernel((x - xi) / bandwidth);
      }, 0);
      return [x, kernelEstimate / (data.length * bandwidth)];
    });

    return tmp;
  };
}

function gaussianKernel(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function getDensities(data, selectionGroups, pointEstimator) {
  const densities = selectionGroups.map((group) => {
    const values = data
      .filter(function (d) {
        return d.type === group;
      })
      .map(function (d) {
        return +d.value;
      });
    const density = pointEstimator(values, group);
    return { value: density, group: group };
  });

  return densities;
}

export function getYMax(densities) {
  return Math.max(
    ...densities
      .map((d) => d.value)
      .flat()
      .map((d) => d[1]),
  );
}

export function renderLegend(
  legend,
  groups,
  color,
  blur,
  setBlur,
  hide,
  setHide,
  showStats,
  hideStats,
) {
  const circleSize = 10;
  const padding = 6;
  const lineHeight = circleSize * 2 + padding;

  const legendGroup = legend
    .append("g")
    .attr("class", "legend-group")
    .style("cursor", "pointer");

  const orderedGroups = Array.isArray(groups) ? [...groups] : [];

  orderedGroups.forEach((group, i) => {
    const y = i * lineHeight + circleSize * 2;

    const legendItem = legendGroup
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", `translate(0,${y})`);

    const circles = legendItem
      .append("circle")
      .attr("class", "legend-circle")
      .attr("cx", circleSize + 10)
      .attr("cy", 0)
      .attr("r", circleSize)
      .style("fill", color(group));

    if (blur)
      circles.classed("blur", blur.includes(group)).on("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = d3.select(e.currentTarget);
        const isBlur = item.classed("blur");
        setBlur((prev) =>
          prev.includes(group)
            ? prev.filter((g) => g !== group)
            : [...prev, group],
        );
        item.classed("blur", !isBlur);
      });

    const labels = legendItem
      .append("text")
      .attr("class", "legend-label")

      .attr("x", circleSize * 2 + 15)
      .attr("y", 4)
      .datum(group)
      .text(group);

    if (hide) {
      labels.classed("cross", hide.includes(group)).on("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sel = d3.select(e.currentTarget);
        const isHide = sel.classed("cross");

        setHide((prev) =>
          prev.includes(group)
            ? prev.filter((g) => g !== group)
            : [...prev, group],
        );

        if (!isHide && hideStats) hideStats(group);

        sel.classed("cross", !isHide);
      });

      legendItem
        .on("mouseover", () => {
          const hideGroups = orderedGroups.filter((d) => d !== group);
          setHide(hideGroups);
          if (showStats) showStats(group);
        })
        .on("mouseout", () => {
          const hideGroups = legend.selectAll(".cross").data();

          setHide(hideGroups);
          if (hideStats) hideStats(group);
        });
    }
  });

  const bbox = legendGroup.node().getBBox();

  const parent = legend.node().parentNode;
  const { height } = parent.getBoundingClientRect();

  if (height > bbox.y + bbox.height) {
    d3.select(parent).style("align-items", "center");
  } else {
    d3.select(parent).style("align-items", null);
  }

  legend
    .attr("width", bbox.x + bbox.width)
    .attr("height", bbox.y + bbox.height);
}
