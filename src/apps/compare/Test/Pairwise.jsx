import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";

import ChartBar from "@/utils/ChartBar";
import styles from "@/utils/Charts.module.css";
import {
  moveTooltip,
  computePairwiseData,
  formatDecimal,
} from "@/utils/functions";
import useResizeObserver from "@/utils/useResizeObserver";
import { pubsub } from "@/utils/pubsub";
import { Settings } from "./PointRange";

const { publish } = pubsub;

export default function Pairwise({ id, variable, test, remove }) {
  const ref = useRef();
  const dims = useResizeObserver(ref);

  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);

  const [config, setConfig] = useState({
    isSync: true,
    showCaps: false,
    capSize: 3,
    markerShape: "circle",
    markerSize: 5,
  });

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!variable || !test || !config.isSync) return;

    try {
      const tmp = computePairwiseData(selection, groupVar, variable, test);
      setData(tmp);
    } catch (error) {
      publish("notification", {
        message: "Error computing data",
        description: error.message,
        placement: "bottomRight",
        type: "error",
      });
    }
  }, [variable, test, selection, groupVar, config.isSync]);

  useEffect(() => {
    if (data && dims) {
      return renderPairwisePlot(ref.current, data, config, dims, id);
    }
  }, [data, dims, config]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`${variable} Effect Sizes`}
        info={data?.descriptionJSX}
        svgIDs={[id]}
        remove={remove}
        config={config}
        setConfig={setConfig}
        settings={<Settings config={config} setConfig={setConfig} />}
      ></ChartBar>

      <div ref={ref} className={styles.chartContainer}></div>
    </div>
  );
}

function renderPairwisePlot(container, result, config, dimensions, id) {
  const { showCaps, capSize, markerShape, markerSize } = config;
  let data = result.pairwiseEffects;
  data.map((d) => {
    if (d.value < 0) {
      d.value = -d.value;
      d.groups = d.groups.reverse();
      d.ci95 = { lower: -d.ci95.upper, upper: -d.ci95.lower };
      return d;
    } else {
      return d;
    }
  });

  data.sort((a, b) => b.value - a.value);

  const labels = data.map((d) => d.groups.join(" vs "));

  const margin = { top: 10, right: 40, bottom: 40, left: 175 };
  const totalWidth = dimensions.width;
  const totalHeight = dimensions.height;
  const chartWidth = totalWidth - margin.left - margin.right;
  const chartHeight = data.length * 45;

  d3.select(container).selectAll("*").remove();

  let tooltip = d3.select("body").select("div.tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "tooltip");
  }

  const svg = d3
    .select(container)
    .append("svg")
    .attr("id", id)
    .attr("class", styles.pwSvg)
    .attr("width", totalWidth)
    .attr("height", chartHeight + margin.top + margin.bottom);

  if (totalHeight > chartHeight + margin.top + margin.bottom) {
    svg.style("position", "absolute").style("bottom", 0).style("left", 0);
  }

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .style("font-size", "16px");

  const rawLower = Math.min(
    d3.min(data, (d) => d.ci95.lower),
    0
  );
  const rawUpper = d3.max(data, (d) => d.ci95.upper);
  const x = d3
    .scaleLinear()
    .domain([rawLower, rawUpper])
    .nice()
    .range([0, chartWidth]);
  const y = d3.scaleBand().domain(labels).range([0, chartHeight]).padding(0.2);

  chart
    .append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .each(function () {
      const textEl = d3.select(this);
      const fullText = textEl.text();

      if (this.getComputedTextLength() > margin.left - 20) {
        let truncated = fullText;
        while (
          this.getComputedTextLength() > margin.left - 20 &&
          truncated.length > 0
        ) {
          truncated = truncated.slice(0, -1);
          textEl.text(truncated + "…");
        }
        textEl.append("title").text(fullText);
      }
    });

  chart
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(5));

  if (x.domain()[0] < 0 && x.domain()[1] > 0) {
    chart
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-dasharray", "4 2")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", chartHeight);
  }

  const minVal = x.domain()[0];
  const maxVal = x.domain()[1];

  const startGrid = Math.floor(minVal * 10) / 10;
  const endGrid = Math.ceil(maxVal * 10) / 10;

  for (let gridValue = startGrid; gridValue <= endGrid; gridValue += 0.1) {
    if (gridValue === 0) continue;

    if (gridValue >= minVal && gridValue <= maxVal) {
      chart
        .append("line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2 2")
        .attr("x1", x(gridValue))
        .attr("x2", x(gridValue))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("class", "grid-line");
    }
  }

  chart
    .selectAll(".effect-bar")
    .data(data)
    .join("line")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("x1", (d) => x(d.ci95.lower))
    .attr("x2", (d) => x(d.ci95.upper))
    .attr("y1", (_, i) => y(labels[i]) + y.bandwidth() / 2)
    .attr("y2", (_, i) => y(labels[i]) + y.bandwidth() / 2)
    .on("mouseover", (event, d) => {
      tooltip
        .html(
          `<strong>${d.groups.join(" vs ")}</strong><br/>
           ${d.measure}: ${d.value.toFixed(2)}<br/>
           CI: [${d.ci95.lower.toFixed(2)}, ${d.ci95.upper.toFixed(2)}]<br/>
           p-value: ${formatDecimal(d.pValue)}`
        )
        .style("visibility", "visible");
    })
    .on("mousemove", (event) => moveTooltip(event, tooltip, chart))
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  if (showCaps) {
    chart
      .selectAll(".cap-left")
      .data(data)
      .join("line")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("x1", (d) => x(d.ci95.lower))
      .attr("x2", (d) => x(d.ci95.lower))
      .attr("y1", (_, i) => y(labels[i]) + y.bandwidth() / 2 - capSize)
      .attr("y2", (_, i) => y(labels[i]) + y.bandwidth() / 2 + capSize);

    chart
      .selectAll(".cap-right")
      .data(data)
      .join("line")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("x1", (d) => x(d.ci95.upper))
      .attr("x2", (d) => x(d.ci95.upper))
      .attr("y1", (_, i) => y(labels[i]) + y.bandwidth() / 2 - capSize)
      .attr("y2", (_, i) => y(labels[i]) + y.bandwidth() / 2 + capSize);
  }

  if (markerShape === "circle") {
    chart
      .selectAll(".effect-point")
      .data(data)
      .join("circle")
      .attr("class", "effect-point")
      .attr("cx", (d) => x(d.value))
      .attr("cy", (_, i) => y(labels[i]) + y.bandwidth() / 2)
      .attr("r", markerSize);
  } else {
    const symbolType =
      markerShape === "square" ? d3.symbolSquare : d3.symbolDiamond;
    const symbolGen = d3
      .symbol()
      .type(symbolType)
      .size(markerSize * markerSize * 4);
    chart
      .selectAll(".effect-point")
      .data(data)
      .join("path")
      .attr("class", "effect-point")
      .attr("d", symbolGen)
      .attr("transform", (_, i) => {
        const d = data[i];
        return `translate(${x(d.value)},${y(labels[i]) + y.bandwidth() / 2})`;
      });
  }

  chart
    .selectAll(".effect-point")
    .on("mouseover", (event, d) => {
      tooltip
        .html(
          `<strong>${d.groups.join(" vs ")}</strong><br/>
           ${d.measure}: ${d.value.toFixed(2)}<br/>
           CI: [${d.ci95.lower.toFixed(2)}, ${d.ci95.upper.toFixed(2)}]<br/>
           p-value: ${formatDecimal(d.pValue)}`
        )
        .style("visibility", "visible");
    })
    .on("mousemove", (event) => moveTooltip(event, tooltip, chart))
    .on("mouseout", () => tooltip.style("visibility", "hidden"));
}
