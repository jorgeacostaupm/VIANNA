import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import { useSelector } from "react-redux";
import { getCategoricDistributionData } from "@/utils/functions";
import useResizeObserver from "@/utils/useResizeObserver";
import ChartBar from "@/utils/ChartBar";
import styles from "@/utils/Charts.module.css";

export default function CategoricDistributions({ variable, remove }) {
  const selection = useSelector((s) => s.cantab.selection);
  const groupVar = useSelector((s) => s.cantab.groupVar);
  const [config, setConfig] = useState({
    chartType: "stacked",
  });

  const data = useMemo(() => {
    let res = getCategoricDistributionData(selection, groupVar, variable);
    return res;
  }, [selection, groupVar, variable]);

  return (
    <>
      <div className={styles.viewContainer}>
        <ChartBar
          title={`${variable} - Distribution`}
          svgIds={["chart", "chart-legend"]}
          infoTooltip={
            "Categorical Distribution plots, Grouped or Stacked bar chart"
          }
          remove={remove}
        >
          <Options config={config} setConfig={setConfig}></Options>
        </ChartBar>

        {config.chartType === "stacked" ? (
          <StackedBarChart data={data} config={config}></StackedBarChart>
        ) : (
          <GroupedBarChart data={data} config={config}></GroupedBarChart>
        )}
      </div>
    </>
  );
}

import { Typography, Space, Radio, Slider } from "antd";

const { Text } = Typography;
function Options({ config, setConfig }) {
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong style={{ fontSize: "16px" }}>
          Select graph:
        </Text>
        <Radio.Group
          style={{ marginLeft: 16 }}
          optionType="button"
          buttonStyle="solid"
          value={config.chartType}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              chartType: e.target.value,
            }))
          }
        >
          <Radio.Button value="stacked">Stacked Bars</Radio.Button>
          <Radio.Button value="grouped">Grouped Bars</Radio.Button>
        </Radio.Group>
      </div>
    </Space>
  );
}

import * as d3 from "d3";
const margin = { top: 20, right: 20, bottom: 50, left: 80 };

export const GroupedBarChart = ({ data, config }) => {
  const ref = useRef();
  const dimensions = useResizeObserver(ref);

  useLayoutEffect(() => {
    if (!dimensions || !data || !ref.current) return;
    d3.select(ref.current).selectAll("*").remove();

    const { width, height } = dimensions;
    const { chartData, categories, groupVar, catVar } = data;

    const legendRatio = 0.15;
    const chartRatio = 1 - legendRatio;
    const colorScheme = d3.schemeCategory10;

    const legendWidth = width * legendRatio;
    const chartAreaWidth = width * chartRatio;
    const chartWidth = chartAreaWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const legend = d3
      .select(ref.current)
      .append("div")
      .style("width", `${legendWidth}px`)
      .style("height", `${height}px`)
      .style("overflow", "auto")
      .style("display", "flex")
      .append("svg")
      .attr("id", "chart-legend")
      .attr("width", legendWidth)
      .attr("height", height)
      .style("display", "block");

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("id", "chart")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block");

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const groups = chartData.map((d) => d[groupVar]);
    const x0 = d3
      .scaleBand()
      .domain(groups)
      .range([0, chartWidth])
      .padding(0.2);
    const x1 = d3
      .scaleBand()
      .domain(categories)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const maxCount = d3.max(chartData, (d) => d3.max(categories, (c) => d[c]));
    const y = d3
      .scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([chartHeight, 0]);

    const color = d3.scaleOrdinal().domain(categories).range(colorScheme);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("class", styles.chartAxis);

    chart
      .append("g")
      .attr("transform", `translate(${0},${0})`)
      .call(d3.axisLeft(y).ticks(null, "d"))
      .attr("class", styles.chartAxis);

    const groupG = chart
      .selectAll("g.group")
      .data(chartData)
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${x0(d[groupVar])},0)`);

    groupG
      .selectAll("rect")
      .data((d) => categories.map((key) => ({ key, value: d[key] })))
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => chartHeight - y(d.value))
      .attr("fill", (d) => color(d.key));

    renderLegend(legend, categories, color);
  }, [data, config, dimensions]);

  return <div ref={ref} className={styles.correlationContainer}></div>;
};

export const StackedBarChart = ({ data, config }) => {
  const ref = useRef();
  const dimensions = useResizeObserver(ref);

  useEffect(() => {
    if (!dimensions || !data || !ref.current) return;
    d3.select(ref.current).selectAll("*").remove();

    const { width, height } = dimensions;
    const { chartData, categories, groupVar } = data;

    const legendRatio = 0.15;
    const chartRatio = 1 - legendRatio;
    const colorScheme = d3.schemeCategory10;

    const legendWidth = width * legendRatio;
    const chartAreaWidth = width * chartRatio;
    const chartWidth = chartAreaWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const legend = d3
      .select(ref.current)
      .append("div")
      .style("width", `${legendWidth}px`)
      .style("height", `${height}px`)
      .style("overflow", "auto")
      .style("display", "flex")
      .append("svg")
      .attr("id", "chart-legend")

      .attr("width", legendWidth)
      .attr("height", height)
      .style("display", "block");

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("id", "chart")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block");

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const groups = chartData.map((d) => d[groupVar]);

    const x = d3.scaleBand().domain(groups).range([0, chartWidth]).padding(0.2);

    const stackGenerator = d3.stack().keys(categories);
    const series = stackGenerator(chartData);

    const maxSum = d3.max(chartData, (d) =>
      categories.reduce((sum, c) => sum + d[c], 0)
    );

    const y = d3
      .scaleLinear()
      .domain([0, maxSum])
      .nice()
      .range([chartHeight, 0]);

    const color = d3.scaleOrdinal().domain(categories).range(colorScheme);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("class", styles.chartAxis);

    chart
      .append("g")
      .call(d3.axisLeft(y).ticks(null, "d"))
      .attr("class", styles.chartAxis);

    const layer = chart
      .selectAll(".layer")
      .data(series)
      .enter()
      .append("g")
      .attr("class", "layer")
      .attr("fill", (d) => color(d.key));

    layer
      .selectAll("rect")
      .data((d) =>
        d.map((d2) => ({
          key: d.key,
          group: d2.data[groupVar],
          y0: d2[0],
          y1: d2[1],
        }))
      )
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.group))
      .attr("y", (d) => y(d.y1))
      .attr("height", (d) => y(d.y0) - y(d.y1))
      .attr("width", x.bandwidth());

    renderLegend(legend, categories, color);
  }, [data, config, dimensions]);

  return <div ref={ref} className={styles.correlationContainer}></div>;
};

function renderLegend(legend, groups, color) {
  const circleSize = 10;
  const padding = 6;
  const lineHeight = circleSize * 2 + padding;

  legend.selectAll("*").remove();

  const legendGroup = legend.append("g").attr("class", "legend-group");

  groups.forEach((d, i) => {
    const y = i * lineHeight + 50;

    legendGroup
      .append("circle")
      .attr("class", "legend-circle")
      .attr("cx", circleSize + 10)
      .attr("cy", y)
      .attr("r", circleSize)
      .style("fill", color(d));

    legendGroup
      .append("text")
      .attr("class", "legend")
      .attr("x", circleSize * 2 + 15)
      .attr("y", y + 4)
      .text(d);
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
