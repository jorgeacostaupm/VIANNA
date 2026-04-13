import React, { useState } from "react";
import { Select } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";

import styles from "@/styles/modules/analysisPanels.module.css";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";
import registry from "../registry";

const { Option } = Select;

export default function ChartSelector({ onAddChart }) {
  const [chart, setChart] = useState(null);

  return (
    <>
      <div className={styles.selectorField}>
        <span className={styles.selectorLabel}>Chart type</span>
        <Select
          size="small"
          onChange={(v) => setChart(v)}
          placeholder="Select graph"
          showSearch={true}
          optionFilterProp="children"
        >
          {Object.keys(registry).map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      </div>

      <AppButton
        preset={APP_BUTTON_PRESETS.ACTION}
        tooltip={"Add the selected correlation chart"}
        icon={<AreaChartOutlined />}
        onClick={() => {
          if (chart) onAddChart(chart);
        }}
      />
    </>
  );
}
