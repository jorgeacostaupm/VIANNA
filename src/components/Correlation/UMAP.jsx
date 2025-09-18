import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Select, Form, Slider, Button, Typography, Space } from "antd";

import ChartBar from "@/utils/ChartBar";
import { getUMAPData, getCategoricalKeys } from "@/utils/functions";
import styles from "@/utils/Charts.module.css";
import useResizeObserver from "@/utils/useResizeObserver";
import drawPCAPlot from "./PCAPlot";
import buttonStyles from "@/utils/Buttons.module.css";

const { Option } = Select;
const { Text } = Typography;

export default function UMAP({ remove }) {
  const [config, setConfig] = useState({
    groupVar: null,
    pointSize: 5,
  });

  const [params, setParams] = useState({
    groupVar: null,
    variables: [],
  });

  const [data, setData] = useState(null);
  const [trigger, setTrigger] = useState(false);

  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);
  const selection = useSelector((s) => s.dataframe.selection);

  useEffect(() => {
    if (trigger) {
      const result = getUMAPData(selection, params);
      setData(result);
      setTrigger(false);
    }
  }, [trigger]);

  useEffect(() => {
    if (ref.current && data && dimensions) {
      drawPCAPlot(data.points, config, ref.current, dimensions);
    }
  }, [data, config, dimensions]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`UMAP - ${params.variables.length} Variables`}
        infoTooltip={data?.summary || "Click 'Compute UMAP' to start"}
        svgIds={["chart", "chart-legend"]}
        remove={remove}
      >
        <Options
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
          onCompute={() => setTrigger(true)}
        />
      </ChartBar>

      <div ref={ref} className={styles.correlationContainer}></div>
    </div>
  );
}

function Options({ config, setConfig, params, setParams, onCompute }) {
  const data = useSelector((state) => state.dataframe.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.navioColumns || []
  );

  const categoricalVars = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return getCategoricalKeys(data);
  }, [data]);

  useEffect(() => {
    if (
      categoricalVars.length > 0 &&
      !categoricalVars.includes(params.groupVar)
    ) {
      setConfig((prev) => ({
        ...prev,
        groupVar: categoricalVars[0],
      }));
    }
  }, [categoricalVars, params.groupVar, setConfig]);

  const onGroupVarChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      groupVar: value,
    }));
  };

  const onVariablesChange = (values) => {
    setParams((prev) => ({
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
    <Space direction="vertical" size="middle" style={{ width: "400px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "15px",
        }}
      >
        <Text strong>Grouping variable</Text>
        <Select
          value={config.groupVar}
          onChange={onGroupVarChange}
          placeholder="Select variable"
          style={{ flex: 1 }}
        >
          {categoricalVars.map((key) => (
            <Option key={key} value={key}>
              {key}
            </Option>
          ))}
        </Select>
      </div>

      <Text strong>Included Variables</Text>
      <Select
        mode="multiple"
        value={params.variables}
        onChange={onVariablesChange}
        placeholder="Select variables"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        {navioColumns.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          gap: "15px",
        }}
      >
        <Button
          onClick={onCompute}
          disabled={params.variables.length < 2}
          className={buttonStyles.coloredButton}
        >
          Compute UMAP
        </Button>
      </div>

      <div>
        <Text strong>Points radius:</Text>
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
