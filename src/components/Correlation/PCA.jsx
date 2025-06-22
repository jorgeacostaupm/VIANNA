import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Space, Typography } from "antd";

import ChartBar from "@/utils/ChartBar";
import { getPCAData, getCategoricalKeys } from "@/utils/functions";
import styles from "@/utils/Charts.module.css";
import useResizeObserver from "@/utils/useResizeObserver";
import drawPCAPlot from "./PCAPlot";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";

const { Option } = Select;
const { Text } = Typography;

export default function PCA({ remove }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);
  const selection = useSelector((s) => s.cantab.selection);

  const [data, setData] = useState(null);
  const [config, setConfig] = useState({
    isSync: true,
    groupVar: null,
    pointSize: 5,
  });
  const [params, setParams] = useState({
    variables: [],
  });

  useEffect(() => {
    if (!config.isSync) return;
    let res = getPCAData(selection, params);
    setData(res);
  }, [selection, params, config.isSync]);

  useEffect(() => {
    if (ref.current && data && dimensions) {
      drawPCAPlot(data.points, config, ref.current, dimensions);
    } else {
      ref.current.innerHTML = "";
    }
  }, [data, config, dimensions]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`PCA - ${params.variables.length} Variables`}
        infoTooltip={data?.summary}
        svgIds={["chart", "chart-legend"]}
        remove={remove}
        config={config}
        setConfig={setConfig}
      >
        <Options
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
        />
      </ChartBar>

      <div ref={ref} className={styles.correlationContainer}></div>
      {!data && <NoDataPlaceholder></NoDataPlaceholder>}
    </div>
  );
}

function Options({ config, setConfig, params, setParams }) {
  const data = useSelector((state) => state.cantab.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.navioColumns || []
  );

  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const categoricalVars = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return getCategoricalKeys(data);
  }, [data]);

  useEffect(() => {
    if (
      categoricalVars.length > 0 &&
      !categoricalVars.includes(params.groupVar)
    ) {
      update("groupVar", categoricalVars[0]);
    }
  }, [categoricalVars, params.groupVar, setConfig]);

  const onVariablesChange = (values) => {
    setParams((prev) => ({
      ...prev,
      variables: values,
    }));
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Text strong style={{ fontSize: 16 }}>
        Group variable:
      </Text>
      <Select
        value={config.groupVar}
        onChange={(v) => update("groupVar", v)}
        placeholder="Select variable"
        style={{ width: "100%" }}
      >
        {navioColumns.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>

      <Text strong style={{ fontSize: 16 }}>
        Select Variables:
      </Text>
      <Select
        mode="multiple"
        value={params.variables}
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
        onChange={(v) => update("pointSize", v)}
        style={{ width: "100%" }}
      />
    </Space>
  );
}
