import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Switch, Slider, Typography, Space, InputNumber, Divider } from "antd";

import styles from "@/utils/Charts.module.css";
import ChartBar from "@/utils/ChartBar";
import { getEvolutionData } from "@/utils/functions";
import useResizeObserver from "@/utils/useResizeObserver";
import EvolutionsPlot from "./EvolutionsPlot";
import { pubsub } from "@/utils/pubsub";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
const { publish } = pubsub;
const { Text } = Typography;

export default function Evolutions({ variable, remove }) {
  const ref = useRef(null);
  const refLegend = useRef(null);
  const dimensions = useResizeObserver(ref);

  const selection = useSelector((s) => s.dataframe.selection);
  const groupVar = useSelector((s) => s.cantab.groupVar);
  const timeVar = useSelector((s) => s.cantab.timeVar);
  const idVar = useSelector((s) => s.cantab.idVar);

  const [data, setData] = useState(null);
  const [chart, setChart] = useState(null);
  const [config, setConfig] = useState({
    isSync: true,
    showObs: false,
    showMeans: true,
    range: [null, null],
    useCustomRange: false,
    meanPointSize: 20,
    subjectPointSize: 5,
    meanStrokeWidth: 10,
    subjectStrokeWidth: 2,
    variable: variable,
  });

  useEffect(() => {
    const evo = new EvolutionsPlot(ref.current);
    setChart(evo);
  }, []);

  useEffect(() => {
    if (chart?.data && dimensions) chart.onResize(dimensions);
  }, [chart, dimensions]);

  useEffect(() => {
    if (!config.isSync || !variable) {
      return;
    }
    try {
      const res = getEvolutionData(selection, variable, groupVar, timeVar);
      setData(res);
    } catch (err) {
      publish("notification", {
        message: "Error computing data",
        description: err.message,
        placement: "bottomRight",
        type: "error",
      });
      setData(null);
    }
  }, [config.isSync, variable, selection, groupVar, timeVar, idVar]);

  useEffect(() => {
    if (!chart || !data) return;
    chart.data = data;
    chart.config = config;
    chart.updateVis();
  }, [chart, data, config]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`${variable} Evolution`}
        svgIds={["evolution-lines-legend", "evolution-lines"]}
        remove={remove}
        config={config}
        setConfig={setConfig}
      >
        <Options config={config} setConfig={setConfig} />
      </ChartBar>

      {!data && <NoDataPlaceholder></NoDataPlaceholder>}

      <div
        className={styles.chartLegendContainer}
        style={{ display: data ? "flex" : "none" }}
      >
        <div className={styles.distributionChart}>
          <svg id="evolution-lines" ref={ref} className={styles.chartSvg} />
        </div>
        <div className={styles.legend}>
          <svg
            ref={refLegend}
            id="evolution-lines-legend"
            className={styles.legendSvg}
          />
        </div>
      </div>
    </div>
  );
}

function Options({ config, setConfig }) {
  const {
    showObs,
    showMeans,
    meanPointSize,
    subjectPointSize,
    meanStrokeWidth,
    subjectStrokeWidth,
    range,
    useCustomRange,
  } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show Means</Text>
        <Switch checked={showMeans} onChange={(v) => update("showMeans", v)} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show Observations</Text>
        <Switch checked={showObs} onChange={(v) => update("showObs", v)} />
      </div>

      <Divider></Divider>

      <SliderControl
        label="Mean Point Size"
        value={meanPointSize}
        min={1}
        max={40}
        onChange={(v) => update("meanPointSize", v)}
      />
      <SliderControl
        label="Subject Point Size"
        value={subjectPointSize}
        min={1}
        max={20}
        onChange={(v) => update("subjectPointSize", v)}
      />
      <SliderControl
        label="Mean Stroke Width"
        value={meanStrokeWidth}
        min={1}
        max={30}
        onChange={(v) => update("meanStrokeWidth", v)}
      />
      <SliderControl
        label="Subject Stroke Width"
        value={subjectStrokeWidth}
        min={1}
        max={10}
        onChange={(v) => update("subjectStrokeWidth", v)}
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Custom Y range</Text>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        min:
        <InputNumber
          value={range[0]}
          onChange={(val) => update("range", [val ?? range[0], range[1]])}
        />
        max:
        <InputNumber
          value={range[1]}
          onChange={(val) => update("range", [range[0], val ?? range[1]])}
        />
        <Switch
          checked={useCustomRange}
          onChange={(checked) => update("useCustomRange", checked)}
        />
      </div>
    </>
  );
}

function SliderControl({ label, value, min, max, onChange }) {
  return (
    <div>
      <Text strong>{label}</Text>
      <Text type="secondary" style={{ marginLeft: 8 }}>
        {value}px
      </Text>
      <Slider min={min} max={max} step={1} value={value} onChange={onChange} />
    </div>
  );
}
