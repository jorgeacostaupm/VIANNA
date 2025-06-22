// PointRangeChart.jsx
import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import * as aq from "arquero";
import { Typography, Space, Slider, Radio, Switch } from "antd";

import useResizeObserver from "@/utils/useResizeObserver";
import styles from "@/utils/Charts.module.css";
import { moveTooltip } from "@/utils/functions";
import ChartBar from "@/utils/ChartBar";
import tests from "@/utils/tests";
import store from "@/features/store";

export default function PointRange({ variable, test, remove }) {
  const containerRef = useRef();
  const dimensions = useResizeObserver(containerRef);

  const selection = useSelector((s) => s.cantab.selection);
  const groupVar = useSelector((s) => s.cantab.groupVar);

  const [result, setResult] = useState(null);
  const [config, setConfig] = useState({
    isSync: true,
    showCaps: true,
    capSize: 5,
    markerShape: "circle",
    markerSize: 8,
  });

  useEffect(() => {
    if (!variable || !test || !config.isSync) {
      return;
    }
    try {
      const table = aq.from(selection);
      const gTable = table.groupby(groupVar);
      const rawGroups = gTable.objects({ grouped: "entries" });

      const errors = [];
      rawGroups.forEach(([name, rows]) => {
        rows.forEach((row, idx) => {
          const v = row[variable];
          if (
            v == null ||
            typeof v !== "number" ||
            Number.isNaN(v) ||
            !Number.isFinite(v)
          ) {
            errors.push(
              `Invalid value in column "${column}" group "${type}" value:  "${value}"`
            );
          }
        });
      });
      if (errors.length) {
        throw new Error(
          `Invalid values found:\n` +
            errors.map((msg) => ` • ${msg}`).join("\n")
        );
      }

      const groups = rawGroups.map(([name, rows]) => ({
        name,
        values: rows.map((r) => r[variable]),
      }));

      const testObj = tests.find((t) => t.label === test);
      if (!testObj) {
        throw new Error(`Test not found: ${test}`);
      }

      const r = testObj.run(groups);
      setResult(r);
    } catch (error) {}
  }, [variable, test, selection, groupVar, config.isSync]);

  useEffect(() => {
    if (!dimensions || !result?.summariesTitle || !result?.summaries) return;
    const data = result.summaries;
    const { showCaps, capSize, markerShape, markerSize } = config;
    d3.select(containerRef.current).select("#chart").remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 100 };
    const totalWidth = dimensions.width;
    const totalHeight = dimensions.height;
    const chartWidth = totalWidth - margin.left - margin.right;
    const chartHeight = totalHeight - margin.top - margin.bottom;

    let tooltip = d3.select("body").select("div.tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }
    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("id", "chart")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("display", "block")
      .attr("class", styles.chartSvg);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const colorScheme = d3.schemeCategory10;
    const groups = store.getState().cantab.groups;
    const pointColorScale = d3.scaleOrdinal().domain(groups).range(colorScheme);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, chartWidth])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.ci95.lower),
        d3.max(data, (d) => d.ci95.upper),
      ])
      .range([chartHeight, 0])
      .nice();

    chart.append("g").call(d3.axisLeft(y));
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    if (y.domain()[0] < 0 && y.domain()[1] > 0) {
      chart
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4 2")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", y(0) + 0.5)
        .attr("y2", y(0) + 0.5);
    }

    chart
      .selectAll(".ci-line")
      .data(data)
      .enter()
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("x1", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("x2", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.ci95.lower))
      .attr("y2", (d) => y(d.ci95.upper))
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>${d.name}</strong><br/>${d.measure}: ${d.value.toFixed(
              2
            )}<br/>` +
              `CI: [${d.ci95.lower.toFixed(2)}, ${d.ci95.upper.toFixed(2)}]`
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
        .attr("x1", (d) => x(d.name) + x.bandwidth() / 2 - capSize)
        .attr("x2", (d) => x(d.name) + x.bandwidth() / 2 + capSize)
        .attr("y1", (d) => y(d.ci95.lower))
        .attr("y2", (d) => y(d.ci95.lower));

      chart
        .selectAll(".cap-right")
        .data(data)
        .join("line")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("x1", (d) => x(d.name) + x.bandwidth() / 2 - capSize)
        .attr("x2", (d) => x(d.name) + x.bandwidth() / 2 + capSize)
        .attr("y1", (d) => y(d.ci95.upper))
        .attr("y2", (d) => y(d.ci95.upper));
    }

    if (markerShape === "circle") {
      chart
        .selectAll(".mean-point")
        .data(data)
        .join("circle")
        .attr("class", "mean-point")
        .attr("cx", (d) => x(d.name) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.value))
        .attr("r", markerSize);
    } else {
      const symbolType =
        markerShape === "square" ? d3.symbolSquare : d3.symbolDiamond;
      const symbolGen = d3
        .symbol()
        .type(symbolType)
        .size(markerSize * markerSize * 4);
      chart
        .selectAll(".mean-point")
        .data(data)
        .join("path")
        .attr("class", "mean-point")
        .attr("d", symbolGen)
        .attr("transform", (_, i) => {
          const d = data[i];
          return `translate(${x(d.name) + x.bandwidth() / 2},${y(d.value)})`;
        });
    }

    chart
      .selectAll(".mean-point")
      .attr("fill", (d) => pointColorScale(d.name))
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>${d.name}</strong><br/>${d.measure}: ${d.value.toFixed(
              2
            )}<br/>` +
              `CI: [${d.ci95.lower.toFixed(2)}, ${d.ci95.upper.toFixed(2)}]`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => moveTooltip(event, tooltip, chart))
      .on("mouseout", () => tooltip.style("visibility", "hidden"));
  }, [result, dimensions, config]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={variable + " - " + test}
        infoTooltip={result?.descriptionJSX}
        svgIds={["chart"]}
        remove={remove}
        config={config}
        setConfig={setConfig}
      >
        <Options config={config} setConfig={setConfig}></Options>
      </ChartBar>

      <div ref={containerRef} className={styles.chartContainer}></div>
    </div>
  );
}

const { Text } = Typography;

export function Options({ config, setConfig }) {
  const { isSync, showCaps, capSize, markerShape, markerSize } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));
  const disabled = !isSync;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong style={{ fontSize: 16 }}>
          Marker Shape:
        </Text>
        <Radio.Group
          className="custom-red-radio"
          disabled={disabled}
          style={{ marginLeft: 16 }}
          optionType="button"
          buttonStyle="solid"
          value={markerShape}
          onChange={(e) => update("markerShape", e.target.value)}
        >
          <Radio.Button value="circle">Circle</Radio.Button>
          <Radio.Button value="square">Square</Radio.Button>
          <Radio.Button value="diamond">Diamond</Radio.Button>
        </Radio.Group>
      </div>

      <div>
        <Text strong style={{ fontSize: 16 }}>
          Marker Size:
        </Text>
        <Text
          type="secondary"
          style={{ marginLeft: 8, opacity: disabled ? 0.5 : 1 }}
        >
          {markerSize}px
        </Text>
        <Slider
          min={4}
          max={20}
          step={1}
          value={markerSize}
          disabled={disabled}
          onChange={(v) => update("markerSize", v)}
        />
      </div>

      <div>
        <Text strong style={{ fontSize: 16 }}>
          Show Caps:
        </Text>
        <Switch
          checked={showCaps}
          disabled={disabled}
          onChange={(v) => update("showCaps", v)}
          style={{ marginLeft: 16 }}
        />
      </div>

      <div>
        <Text strong style={{ fontSize: 16 }}>
          Cap Size:
        </Text>
        <Text
          type="secondary"
          style={{ marginLeft: 8, opacity: disabled ? 0.5 : 1 }}
        >
          {capSize}px
        </Text>
        <Slider
          min={0}
          max={20}
          step={1}
          value={capSize}
          disabled={disabled}
          onChange={(v) => update("capSize", v)}
        />
      </div>
    </Space>
  );
}
