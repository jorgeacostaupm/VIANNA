import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Typography, Space } from "antd";
import { getCategoricalKeys } from "@/utils/functions";

const { Text } = Typography;

export default function Settings({ config, setConfig }) {
  const data = useSelector((state) => state.dataframe.present.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.present.navioColumns || []
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
        groupVar: null,
      }));
    }
  }, [categoricalVars]);

  const onGroupVarChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      groupVar: value,
    }));
  };

  const onVariablesChange = (values) => {
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
    <Space direction="vertical" size="middle" style={{ width: "400px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "15px",
        }}
      >
        <Text strong>Grouping Variable</Text>
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

      <Select
        mode="multiple"
        value={config.variables}
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
        value={config.pointSize}
        onChange={onPointSizeChange}
        style={{ width: "100%" }}
      />
    </Space>
  );
}
