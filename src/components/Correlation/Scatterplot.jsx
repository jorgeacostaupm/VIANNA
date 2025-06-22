import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Form, Typography, message, Space } from "antd";
import CorrChart from "./CorrChart";
import ChartBar from "@/utils/ChartBar";
import { getScatterData, getCategoricalKeys } from "@/utils/functions";
import drawSPMatrix from "./ScatterplotMatrix";
import styles from "@/utils/Charts.module.css";
import useResizeObserver from "@/utils/useResizeObserver";

const { Option } = Select;
const { Text } = Typography;
const minScatterSize = 200;

export default function Scatterplot({ remove }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);

  const [params, setParams] = useState({});
  const [config, setConfig] = useState({
    isSync: true,
    pointSize: 4,
    groupVar: null,
    variables: [],
  });

  return (
    <div ref={ref} className={styles.viewContainer}>
      <ChartBar
        title={
          params.groupVar
            ? `Scatterplot Matrix by ${params.groupVar}`
            : "Scatterplot Matrix"
        }
        infoTooltip={"test"}
        svgIds={["spmatrix", "splegend"]}
        remove={remove}
        config={config}
        setConfig={setConfig}
      >
        <Options
          config={config}
          setConfig={setConfig}
          containerDims={dimensions}
        />
      </ChartBar>

      <CorrChart
        config={config}
        params={config}
        drawChart={drawSPMatrix}
        getChartData={getScatterData}
      />
    </div>
  );
}

function Options({ config, setConfig, containerDims }) {
  const data = useSelector((state) => state.cantab.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.navioColumns || []
  );

  const categoricalVars = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return getCategoricalKeys(data);
  }, [data]);

  useEffect(() => {
    if (
      categoricalVars.length > 0 &&
      !categoricalVars.includes(config.groupVar)
    ) {
      setConfig((prev) => ({
        ...prev,
        groupVar: categoricalVars[0],
      }));
    }
  }, [categoricalVars]);

  const { width, height } = containerDims;
  const usable = Math.min(width * 0.85, height);
  const maxVars = Math.max(0, Math.floor(usable / minScatterSize));

  useEffect(() => {
    if (config.variables.length > maxVars) {
      setConfig((prev) => ({
        ...prev,
        variables: prev.variables.slice(0, maxVars),
      }));
    }
  }, [maxVars, config.variables]);

  const onGroupVarChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      groupVar: value,
    }));
  };

  const onVariablesChange = (values) => {
    if (values.length > maxVars) {
      message.warning(`max: ${maxVars} variables with actual size.`);
      return;
    }
    setConfig((prev) => ({
      ...prev,
      variables: values,
    }));
  };

  const onPointSizeChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      pointSize: value,
    }));
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Text strong style={{ fontSize: 16 }}>
        Group variable:
      </Text>
      <Select
        value={config.groupVar}
        onChange={onGroupVarChange}
        placeholder="Select variable"
        style={{ width: "100%" }}
      >
        {categoricalVars.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text strong style={{ fontSize: 16 }}>
          Variables to show:
        </Text>
        <Text type="secondary">(máx.{maxVars} due to actual window size)</Text>
      </div>

      <Select
        mode="multiple"
        value={config.variables}
        onChange={onVariablesChange}
        placeholder="Select variables"
        style={{ width: "100%" }}
        disabled={!config.isSync}
      >
        {navioColumns.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>

      <div>
        <Text strong style={{ fontSize: 16 }}>
          Points radius:
        </Text>
        <Text type="secondary"> {config.pointSize}px</Text>
      </div>

      <Slider
        min={1}
        max={20}
        value={config.pointSize}
        onChange={onPointSizeChange}
        style={{ width: "100%" }}
      />
    </Space>
  );
}
