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
  const selection = useSelector((s) => s.dataframe.selection);

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
        <Settings
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

function Settings({ config, setConfig, params, setParams }) {
  const data = useSelector((state) => state.dataframe.selection || []);
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
          onChange={(v) => update("groupVar", v)}
          placeholder="Select variable"
          style={{ flex: 1 }}
        >
          {navioColumns.map((key) => (
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
        disabled={!config.isSync}
      >
        {navioColumns.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>
      <div>
        <Text strong>Points radius:</Text>
        <Text type="secondary"> {config.pointSize}px</Text>
      </div>
      <Slider
        min={1}
        max={20}
        defaultValue={config.pointSize}
        onChangeComplete={(v) => update("pointSize", v)}
        style={{ width: "100%" }}
      />
    </Space>
  );
}
