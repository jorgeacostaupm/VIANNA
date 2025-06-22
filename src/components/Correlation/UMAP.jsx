import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Select, Form, Slider, Button } from "antd";

import ChartBar from "@/utils/ChartBar";
import { getUMAPData, getCategoricalKeys } from "@/utils/functions";
import styles from "@/utils/Charts.module.css";
import useResizeObserver from "@/utils/useResizeObserver";
import drawPCAPlot from "./PCAPlot";

const { Option } = Select;

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
  const selection = useSelector((s) => s.cantab.selection);

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
  const data = useSelector((state) => state.cantab.selection || []);
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
    <Form layout="vertical" style={{ maxWidth: 500 }}>
      <Form.Item label="Grouping variable">
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
      </Form.Item>

      <Form.Item label="Input variables">
        <Select
          mode="multiple"
          value={params.variables}
          onChange={onVariablesChange}
          placeholder="Select variables"
          style={{ width: "100%" }}
        >
          {navioColumns.map((key) => (
            <Option key={key} value={key}>
              {key}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Point size">
        <Slider
          min={1}
          max={20}
          value={config.pointSize}
          onChange={onPointSizeChange}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          onClick={onCompute}
          disabled={params.variables.length < 2}
        >
          Compute UMAP
        </Button>
      </Form.Item>
    </Form>
  );
}
