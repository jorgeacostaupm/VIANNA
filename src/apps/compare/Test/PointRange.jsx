// PointRangeChart.jsx
import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import * as aq from "arquero";
import { Typography, Slider, Radio, Switch, Select } from "antd";
import panelStyles from "@/styles/SettingsPanel.module.css";

import useResizeObserver from "@/hooks/useResizeObserver";
import styles from "@/styles/Charts.module.css";
import { moveTooltip } from "@/utils/functions";
import ChartBar from "@/components/charts/ChartBar";
import tests from "@/utils/tests";
import { pubsub } from "@/utils/pubsub";
import { CHART_GRID, CHART_OUTLINE, CHART_ZERO_LINE } from "@/utils/chartTheme";
import { attachTickLabelGridHover } from "@/utils/gridInteractions";

const { publish } = pubsub;

export default function PointRange({ id, variable, test, remove }) {
  const containerRef = useRef();
  const dims = useResizeObserver(containerRef);

  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.compare.groupVar);

  const [result, setResult] = useState(null);
  const [config, setConfig] = useState({
    isSync: true,
    showCaps: true,
    capSize: 3,
    markerShape: "circle",
    markerSize: 5,
    showZeroLine: true,
    sortBy: "name",
  });

  useEffect(() => {
    if (!variable || !test || !groupVar || !config.isSync) {
      setResult(null);
      return;
    }
    try {
      const table = aq.from(selection);
      const gTable = table.groupby(groupVar);
      const rawGroups = gTable.objects({ grouped: "entries" });

      const errors = [];
      rawGroups.forEach(([name, rows]) => {
        rows.forEach((row) => {
          const v = row[variable];
          if (
            v == null ||
            typeof v !== "number" ||
            Number.isNaN(v) ||
            !Number.isFinite(v)
          ) {
            errors.push(
              `Invalid value in column "${variable}" group "${name}" value: "${v}"`
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
      setResult({
        ...r,
        shortDescription: testObj.shortDescription || testObj.description || "",
        applicability: testObj.applicability || "",
        reportedMeasures: testObj.reportedMeasures || [],
        postHoc: testObj.postHoc || "Not specified.",
        referenceUrl: testObj.referenceUrl || "",
      });
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
    if (!dims || !result?.summariesTitle || !result?.summaries) return;
    const data = result.summaries;
    const { showCaps, capSize, markerShape, markerSize, showZeroLine, sortBy } =
      config;
    const sortedData = [...data].sort((a, b) => {
      if (sortBy === "value") return b.value - a.value;
      return String(a.name).localeCompare(String(b.name));
    });
    d3.select(containerRef.current).selectAll("*").remove();

    const margin = { top: 50, right: 50, bottom: 50, left: 120 };
    const totalWidth = dims.width;
    const totalHeight = dims.height;
    const chartWidth = totalWidth - margin.left - margin.right;
    const chartHeight = totalHeight - margin.top - margin.bottom;

    let tooltip = d3.select("body").select("div.tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }
    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("id", id)
      .attr("width", "100%")
      .attr("height", "100%")
      .style("display", "block")
      .attr("class", styles.chartSvg);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const colorScheme = d3.schemeCategory10;
    const pointColorScale = d3
      .scaleOrdinal()
      .domain(sortedData.map((d) => d.name))
      .range(colorScheme);

    const x = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.name))
      .range([0, chartWidth])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(sortedData, (d) => d.ci95.lower),
        d3.max(sortedData, (d) => d.ci95.upper),
      ])
      .range([chartHeight, 0])
      .nice();
    const yTickCount = 4;

    const yGridG = chart
      .append("g")
      .attr("class", "grid y-grid")
      .call(
        d3.axisLeft(y).ticks(yTickCount).tickSize(-chartWidth).tickFormat("")
      );
    yGridG.select(".domain").remove();
    yGridG
      .selectAll(".tick line")
      .attr("stroke", CHART_GRID)
      .attr("stroke-dasharray", "8 6");

    const yAxisG = chart.append("g").call(d3.axisLeft(y).ticks(yTickCount));
    yAxisG.select(".domain").remove();
    yAxisG.selectAll(".tick line").remove();
    const xAxisG = chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));
    xAxisG.select(".domain").remove();
    xAxisG.selectAll(".tick line").remove();

    if (showZeroLine && y.domain()[0] < 0 && y.domain()[1] > 0) {
      chart
        .append("line")
        .attr("class", "zero-line")
        .attr("stroke", CHART_ZERO_LINE)
        .attr("stroke-dasharray", "4 2")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", y(0) + 0.5)
        .attr("y2", y(0) + 0.5);
    }

    chart
      .selectAll(".ci-line")
      .data(sortedData)
      .enter()
      .append("line")
      .attr("class", "ci-line")
      .attr("stroke", CHART_OUTLINE)
      .attr("stroke-width", 1.8)
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
        .data(sortedData)
        .join("line")
        .attr("class", "cap-left")
        .attr("stroke", CHART_OUTLINE)
        .attr("stroke-width", 1.6)
        .attr("x1", (d) => x(d.name) + x.bandwidth() / 2 - capSize)
        .attr("x2", (d) => x(d.name) + x.bandwidth() / 2 + capSize)
        .attr("y1", (d) => y(d.ci95.lower))
        .attr("y2", (d) => y(d.ci95.lower));

      chart
        .selectAll(".cap-right")
        .data(sortedData)
        .join("line")
        .attr("class", "cap-right")
        .attr("stroke", CHART_OUTLINE)
        .attr("stroke-width", 1.6)
        .attr("x1", (d) => x(d.name) + x.bandwidth() / 2 - capSize)
        .attr("x2", (d) => x(d.name) + x.bandwidth() / 2 + capSize)
        .attr("y1", (d) => y(d.ci95.upper))
        .attr("y2", (d) => y(d.ci95.upper));
    }

    if (markerShape === "circle") {
      chart
        .selectAll(".mean-point")
        .data(sortedData)
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
        .data(sortedData)
        .join("path")
        .attr("class", "mean-point")
        .attr("d", symbolGen)
        .attr("transform", (_, i) => {
          const d = sortedData[i];
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

    attachTickLabelGridHover({
      axisGroup: yAxisG,
      gridGroup: yGridG,
    });

    yGridG.raise();
    yAxisG.raise();
  }, [result, dims, config, id]);

  const infoContent =
    result?.descriptionJSX ||
    result?.shortDescription ||
    result?.referenceUrl ||
    result?.applicability ||
    (Array.isArray(result?.reportedMeasures) && result.reportedMeasures.length > 0) ||
    result?.postHoc ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {result?.shortDescription && <div>{result.shortDescription}</div>}
        {result?.applicability && (
          <div>
            <b>Applies to:</b> {result.applicability}
          </div>
        )}
        {Array.isArray(result?.reportedMeasures) &&
          result.reportedMeasures.length > 0 && (
            <div>
              <b>Reported measures:</b>
              <ul style={{ margin: "4px 0 0", paddingLeft: "1.1em" }}>
                {result.reportedMeasures.map((measure) => (
                  <li key={measure}>{measure}</li>
                ))}
              </ul>
            </div>
          )}
        {result?.postHoc && (
          <div>
            <b>Post hoc:</b> {result.postHoc}
          </div>
        )}
        {result?.referenceUrl && (
          <a
            href={result.referenceUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Reference
          </a>
        )}
        {result?.descriptionJSX && <div>{result.descriptionJSX}</div>}
      </div>
    ) : null;

  const summaryLabel = result?.summariesTitle || "Summary";
  const title = [test, summaryLabel, variable].filter(Boolean).join(" · ");

  return (
    <div className={styles.viewContainer} data-view-container>
      <ChartBar
        title={title}
        info={infoContent}
        svgIDs={[id]}
        remove={remove}
        config={config}
        setConfig={setConfig}
        settings={<Settings config={config} setConfig={setConfig}></Settings>}
      />
      <div ref={containerRef} className={styles.chartContainer}></div>
    </div>
  );
}

const { Text } = Typography;

export function Settings({ config, setConfig, variant = "pointrange" }) {
  const {
    isSync,
    showCaps,
    capSize,
    markerShape,
    markerSize,
    showZeroLine,
    positiveOnly,
    sortDescending,
    sortBy,
  } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));
  const disabled = !isSync;

  const sortOptions = [
    { value: "name", label: "Group name" },
    { value: "value", label: "Mean value" },
  ];

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Markers</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Shape</Text>
          <Radio.Group
            disabled={disabled}
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
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Size</Text>
          <Text className={panelStyles.value}>{markerSize}px</Text>
          <Slider
            min={4}
            max={20}
            step={1}
            value={markerSize}
            disabled={disabled}
            onChange={(v) => update("markerSize", v)}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Intervals</div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Caps</Text>
          <Switch
            checked={showCaps}
            disabled={disabled}
            onChange={(v) => update("showCaps", v)}
          />
        </div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Cap size</Text>
          <Text className={panelStyles.value}>{capSize}px</Text>
          <Slider
            min={0}
            max={20}
            step={1}
            value={capSize}
            disabled={disabled}
            onChange={(v) => update("capSize", v)}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Guides</div>
        {variant !== "pairwise" && (
          <div className={panelStyles.row}>
            <Text className={panelStyles.label}>Zero line</Text>
            <Switch
              checked={showZeroLine}
              disabled={disabled}
              onChange={(v) => update("showZeroLine", v)}
            />
          </div>
        )}
        {variant === "pairwise" && (
          <div className={panelStyles.row}>
            <Text className={panelStyles.label}>Positive effects only</Text>
            <Switch
              checked={positiveOnly}
              disabled={disabled}
              onChange={(v) => update("positiveOnly", v)}
            />
          </div>
        )}
        {variant === "pairwise" && (
          <div className={panelStyles.row}>
            <Text className={panelStyles.label}>Sort descending</Text>
            <Switch
              checked={sortDescending}
              disabled={disabled}
              onChange={(v) => update("sortDescending", v)}
            />
          </div>
        )}
        {variant === "pairwise" && (
          <div className={panelStyles.row}>
            <Text className={panelStyles.label}>Grid lines</Text>
            <Switch checked disabled />
          </div>
        )}
        {variant !== "pairwise" && (
          <div className={panelStyles.rowStack}>
            <Text className={panelStyles.label}>Sort by</Text>
            <Select
              value={sortBy}
              onChange={(v) => update("sortBy", v)}
              options={sortOptions}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
