import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Switch, Typography } from "antd";

import { getCategoricalKeys } from "@/utils/functions";
import panelStyles from "@/styles/SettingsPanel.module.css";

const { Text } = Typography;

export default function Settings({ config, setConfig, params, setParams }) {
  const data = useSelector((state) => state.dataframe.present.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.present.navioColumns || []
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
      !categoricalVars.includes(config.groupVar)
    ) {
      update("groupVar", categoricalVars[0]);
    }
  }, [categoricalVars, config.groupVar]);

  const onVariablesChange = (values) => {
    setParams((prev) => ({
      ...prev,
      variables: values,
    }));
  };

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Grouping</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Grouping variable</Text>
          <Select
            value={config.groupVar}
            onChange={(v) => update("groupVar", v)}
            placeholder="Select variable"
            options={categoricalVars.map((key) => ({
              value: key,
              label: key,
            }))}
          />
        </div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Included variables</Text>
          <Select
            mode="multiple"
            value={params.variables}
            onChange={onVariablesChange}
            placeholder="Select variables"
            options={navioColumns.map((key) => ({
              value: key,
              label: key,
            }))}
            disabled={!config.isSync}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Points</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Size</Text>
          <Text className={panelStyles.value}>{config.pointSize}px</Text>
          <Slider
            min={1}
            max={20}
            value={config.pointSize}
            onChange={(v) => update("pointSize", v)}
          />
        </div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Opacity</Text>
          <Text className={panelStyles.value}>
            {Math.round(config.pointOpacity * 100)}%
          </Text>
          <Slider
            min={0.2}
            max={1}
            step={0.05}
            value={config.pointOpacity}
            onChange={(v) => update("pointOpacity", v)}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Legend</div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Show legend</Text>
          <Switch
            checked={config.showLegend}
            onChange={(v) => update("showLegend", v)}
          />
        </div>
      </div>
    </div>
  );
}
