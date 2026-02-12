import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";

import ChartBar from "@/components/charts/ChartBar";
import styles from "@/styles/Charts.module.css";
import {
  moveTooltip,
  computePairwiseData,
  formatDecimal,
} from "@/utils/functions";
import useResizeObserver from "@/hooks/useResizeObserver";
import { pubsub } from "@/utils/pubsub";
import { Settings } from "./PointRange";
import {
  CHART_GRID,
  CHART_OUTLINE,
} from "@/utils/chartTheme";
import { attachTickLabelGridHover } from "@/utils/gridInteractions";

const { publish } = pubsub;

export default function Pairwise({ id, variable, test, remove }) {
  const ref = useRef();
  const dims = useResizeObserver(ref);

  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);

  const [config, setConfig] = useState({
    isSync: true,
    showCaps: true,
    capSize: 3,
    markerShape: "circle",
    markerSize: 5,
    positiveOnly: true,
    sortDescending: true,
  });

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!variable || !test || !config.isSync) return;

    try {
      const tmp = computePairwiseData(selection, groupVar, variable, test);
      if (!tmp?.pairwiseEffects || tmp.pairwiseEffects.length === 0) {
        publish("notification", {
          message: "No pairwise results",
          description: "This test does not provide pairwise effects.",
          placement: "bottomRight",
          type: "info",
          source: "test",
        });
        setData(null);
        return;
      }
      setData(tmp);
    } catch (error) {
      publish("notification", {
        message: "Error computing data",
        description: error.message,
        placement: "bottomRight",
        type: "error",
        source: "test",
      });
    }
  }, [variable, test, selection, groupVar, config.isSync]);

  useEffect(() => {
    if (data && dims) {
      return renderPairwisePlot(ref.current, data, config, dims, id);
    }
    if (dims) {
      d3.select(ref.current).selectAll("*").remove();
    }
  }, [data, dims, config]);

  const infoContent =
    data?.descriptionJSX || data?.shortDescription || data?.referenceUrl ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {data?.shortDescription && <div>{data.shortDescription}</div>}
        {data?.referenceUrl && (
          <a
            href={data.referenceUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Reference
          </a>
        )}
        {data?.descriptionJSX && <div>{data.descriptionJSX}</div>}
      </div>
    ) : null;

  const pairwiseLabel = data?.pairwiseTitle || "Effect sizes";
  const title = [test, pairwiseLabel, variable].filter(Boolean).join(" · ");

  return (
    <div className={styles.viewContainer} data-view-container>
      <ChartBar
        title={title}
        info={infoContent}
        svgIDs={[id]}
        remove={remove}
        config={config}
        setConfig={setConfig}
        settings={
          <Settings config={config} setConfig={setConfig} variant="pairwise" />
        }
      ></ChartBar>

      <div ref={ref} className={styles.chartContainer}></div>
    </div>
  );
}

function renderPairwisePlot(container, result, config, dimensions, id) {
  const {
    showCaps,
    capSize,
    markerShape,
    markerSize,
    positiveOnly,
    sortDescending,
  } = config;
  let data = result.pairwiseEffects.map((d) => ({
    ...d,
    groups: [...d.groups],
    ci95: { ...d.ci95 },
  }));

  if (positiveOnly) {
    data = data.map((d) => {
      if (d.value < 0) {
        return {
          ...d,
          value: -d.value,
          groups: [...d.groups].reverse(),
          ci95: { lower: -d.ci95.upper, upper: -d.ci95.lower },
        };
      }
      return d;
    });
  }

  data.sort((a, b) =>
    sortDescending ? b.value - a.value : a.value - b.value
  );

  const labels = data.map((d) => d.groups.join(" vs "));

  const margin = { top: 20, right: 50, bottom: 50, left: 160 };
  const totalWidth = dimensions.width;
  const totalHeight = dimensions.height;
  const chartWidth = totalWidth - margin.left - margin.right;
  const chartHeight = totalHeight - margin.top - margin.bottom;

  d3.select(container).selectAll("*").remove();

  let tooltip = d3.select("body").select("div.tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "tooltip");
  }

  const svg = d3
    .select(container)
    .append("svg")
    .attr("id", id)
    .attr("width", "100%")
    .attr("height", "100%")
    .style("display", "block")
    .attr("class", styles.chartSvg);

  if (totalHeight > chartHeight + margin.top + margin.bottom) {
    svg.style("position", "absolute").style("bottom", 0).style("left", 0);
  }

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .style("font-size", "16px");

  const rawLower = Math.min(
    d3.min(data, (d) => d.ci95.lower),
    0,
  );
  const rawUpper = d3.max(data, (d) => d.ci95.upper);
  const x = d3
    .scaleLinear()
    .domain([rawLower, rawUpper])
    .nice()
    .range([0, chartWidth]);
  const y = d3.scaleBand().domain(labels).range([0, chartHeight]).padding(0.2);

  const yAxisG = chart.append("g").call(d3.axisLeft(y));
  yAxisG.select(".domain").remove();
  yAxisG.selectAll(".tick line").remove();
  yAxisG
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

  const xAxisG = chart
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(5));
  xAxisG.select(".domain").remove();
  xAxisG.selectAll(".tick line").remove();

  const xGridG = chart
    .append("g")
    .attr("class", "grid x-grid")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-chartHeight).tickFormat(""));
  xGridG.select(".domain").remove();
  xGridG
    .selectAll(".tick line")
    .attr("stroke", CHART_GRID)
    .attr("stroke-dasharray", "8 6");
  xGridG
    .selectAll(".tick")
    .filter((_, i, nodes) => i === 0 || i === nodes.length - 1)
    .select("line")
    .classed("chart-grid-line", false)
    .attr("stroke", "none");
  const zeroX = x(0);
  const isZeroGridTick = (tickValue) => {
    const tickNum = Number(+tickValue);
    if (!Number.isFinite(tickNum) || !Number.isFinite(zeroX)) return false;
    return Math.abs(x(tickNum) - zeroX) < 0.5;
  };
  xGridG
    .selectAll(".tick")
    .filter((tickValue) => isZeroGridTick(tickValue))
    .select("line")
    .classed("chart-grid-line", false)
    .attr("stroke", "none");

  chart
    .selectAll(".effect-bar")
    .data(data)
    .join("line")
    .attr("class", "effect-bar")
    .attr("stroke", CHART_OUTLINE)
    .attr("stroke-width", 1.8)
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
           p-value: ${formatDecimal(d.pValue)}`,
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
      .attr("class", "cap-left")
      .attr("stroke", CHART_OUTLINE)
      .attr("stroke-width", 1.6)
      .attr("x1", (d) => x(d.ci95.lower))
      .attr("x2", (d) => x(d.ci95.lower))
      .attr("y1", (_, i) => y(labels[i]) + y.bandwidth() / 2 - capSize)
      .attr("y2", (_, i) => y(labels[i]) + y.bandwidth() / 2 + capSize);

    chart
      .selectAll(".cap-right")
      .data(data)
      .join("line")
      .attr("class", "cap-right")
      .attr("stroke", CHART_OUTLINE)
      .attr("stroke-width", 1.6)
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
      .attr("r", markerSize)
      .attr("fill", "var(--chart-focus)");
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
      .attr("fill", "var(--chart-focus)")
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
           p-value: ${formatDecimal(d.pValue)}`,
        )
        .style("visibility", "visible");
    })
    .on("mousemove", (event) => moveTooltip(event, tooltip, chart))
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  attachTickLabelGridHover({
    axisGroup: xAxisG,
    gridGroup: xGridG,
    includeTick: (tickValue, i, nodes) => {
      if (i === 0 || i === nodes.length - 1) return false;
      if (isZeroGridTick(tickValue)) return false;
      return true;
    },
  });

  xGridG.raise();
  xAxisG.raise();
}
