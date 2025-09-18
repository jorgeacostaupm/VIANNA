import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Form, Typography, Space } from "antd";
import CorrChart from "./CorrChart";
import ChartBar from "@/utils/ChartBar";
import { getCorrelationData } from "@/utils/functions";
import drawCorrelationMatrix from "./CorrelationMatrix";
import styles from "@/utils/Charts.module.css";
const { Text } = Typography;
const { Option } = Select;

export default function Correlation({ remove }) {
  const ref = useRef(null);

  const [config, setConfig] = useState({
    isSync: true,
  });

  const [params, setParams] = useState({
    groupVar: null,
    variables: [],
  });

  return (
    <div ref={ref} className={styles.viewContainer}>
      <ChartBar
        title={`Correlation Matrix`}
        svgIds={["corr-matrix", "corr-legend"]}
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

      <CorrChart
        config={config}
        params={params}
        drawChart={drawCorrelationMatrix}
        getChartData={getCorrelationData}
      />
    </div>
  );
}

function Options({ config, setConfig, params, setParams }) {
  const navioColumns = useSelector(
    (state) => state.dataframe.navioColumns || []
  );

  const onVariablesChange = (values) => {
    setParams((prev) => ({
      ...prev,
      variables: values,
    }));
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "400px" }}>
      <Text strong>Included Variables</Text>
      <Select
        mode="multiple"
        value={params.variables}
        onChange={onVariablesChange}
        placeholder=""
        style={{ width: "100%", maxWidth: "400px" }}
        disabled={!config.isSync}
      >
        {navioColumns.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>
    </Space>
  );
}
