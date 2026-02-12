import * as d3 from "d3";
import { useEffect, useState } from "react";

import { moveTooltip } from "@/utils/functions";
import { numMargin, renderLegend } from "../Density/useDensity";
import useResizeObserver from "@/hooks/useResizeObserver";
import { CHART_OUTLINE_MUTED } from "@/utils/chartTheme";
import { attachTickLabelGridHover } from "@/utils/gridInteractions";

export default function useHistogram({ chartRef, legendRef, data, config }) {
  const dimensions = useResizeObserver(chartRef);
  const groups = Array.from(new Set((data || []).map((d) => d.type))).filter(
    (value) => value != null,
  );
  const selectionGroups = groups;
  const groupsKey = groups.join("|");
  const [hide, setHide] = useState([]);
  const [blur, setBlur] = useState(selectionGroups);

  useEffect(() => {
    setHide([]);
    setBlur(selectionGroups);
  }, [groupsKey]);

  useEffect(() => {
    if (!dimensions || !data || !chartRef.current || !legendRef.current) return;

    const { width, height } = dimensions;
    const { nPoints, showLegend, showGrid } = config;
    const [xMin, xMax] = getNumericDomain(data);
    const pointEstimator = computeEstimator(nPoints, xMin, xMax);
    const densities = getDensities(data, selectionGroups, pointEstimator);
    const yMax = getYMax(densities);

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
    const x = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([0, chartWidth])
      .nice();
    const y = d3.scaleLinear().range([chartHeight, 0]).domain([0, yMax]).nice();

    const bandwidth = (x(xMax) - x(xMin)) / nPoints;
    const binWidth = (xMax - xMin) / nPoints;

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
      .join("g")
      .attr("class", "density")
      .classed("hide", (d) => hide.includes(d.group))
      .classed("blur", (d) => blur.includes(d.group))
      .each(function (d) {
        d3.select(this)
          .selectAll("rect")
          .data(d.value)
          .join("rect")
          .attr("class", "histogram-bar")
          .attr("x", (bin) => x(bin[0]))
          .attr("y", (bin) => y(bin[1]))
          .attr("width", bandwidth)
          .attr("height", (bin) => chartHeight - y(bin[1]))
          .attr("fill", color(d.group))
          .attr("stroke", CHART_OUTLINE_MUTED)
          .attr("stroke-width", 0.8)
          .on("mouseover", function (e, item) {
            tooltip.style("visibility", "visible").html(`
              <strong>${d.group}</strong> <br/>
              ${item[0].toFixed(2)} to ${(item[0] + binWidth).toFixed(2)} <br/>
              nº items: ${item[1]}
              `);
          })
          .on("mousemove", function (e) {
            moveTooltip(e, tooltip, chart);
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"));
      });

    if (showLegend !== false) {
      renderLegend(legend, selectionGroups, color, blur, setBlur, hide, setHide);
    }

    if (showGrid && yGridG) {
      yGridG.raise();
      yAxisG.raise();
    }
  }, [data, config, dimensions, groupsKey]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = d3.select(chartRef.current);
    chart
      .selectAll(".density")
      .classed("hide", (d) => hide.includes(d.group))
      .classed("blur", (d) => blur.includes(d.group));
  }, [hide, blur]);
}

function getNumericDomain(data) {
  let allValues = data.map((d) => +d.value);
  const xMin = Math.min(...allValues);
  const xMax = Math.max(...allValues);

  return [xMin, xMax];
}

function computeEstimator(numPoints, min, max) {
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
}

function getDensities(data, selectionGroups, pointEstimator) {
  const densities = selectionGroups.map((group) => {
    const values = data
      .filter(function (d) {
        return d.type === group;
      })
      .map(function (d) {
        return +d.value;
      });
    const density = pointEstimator(values);
    return { value: density, group: group };
  });

  return densities;
}

function getYMax(densities) {
  return Math.max(
    ...densities
      .map((d) => d.value)
      .flat()
      .map((d) => d[1])
  );
}
