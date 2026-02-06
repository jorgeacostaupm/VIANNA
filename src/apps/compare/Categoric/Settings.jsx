import React from "react";
import { Typography, Radio, Select, Switch } from "antd";
import panelStyles from "@/styles/SettingsPanel.module.css";

const { Text } = Typography;

const orderOptions = [
  { value: "alpha", label: "Alphabetical" },
  { value: "count", label: "By count" },
];

export default function Settings({ config, setConfig }) {
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>View</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Chart type</Text>
          <Radio.Group
            className={panelStyles.control}
            optionType="button"
            buttonStyle="solid"
            value={config.chartType}
            onChange={(e) => update("chartType", e.target.value)}
          >
            <Radio.Button value="stacked">Stacked bars</Radio.Button>
            <Radio.Button value="grouped">Grouped bars</Radio.Button>
          </Radio.Group>
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Legend</Text>
          <Switch
            checked={config.showLegend}
            onChange={(v) => update("showLegend", v)}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Ordering</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Groups</Text>
          <Select
            value={config.groupOrder}
            onChange={(v) => update("groupOrder", v)}
            options={orderOptions}
          />
        </div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Categories</Text>
          <Select
            value={config.categoryOrder}
            onChange={(v) => update("categoryOrder", v)}
            options={orderOptions}
          />
        </div>
      </div>
    </div>
  );
}
