// SelectorPanel.jsx
import React from "react";
import { Select, Tooltip, Button } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";

import AppBar from "@/utils/AppBar";
import { Graphs } from "@/utils/Constants";
import styles from "@/utils/Buttons.module.css";

const color = "#7bb2ff";
const { Option } = Select;
const iconStyle = { fontSize: "25px" };

function Buttons({ selectedVar, onChange, generateGraph }) {
  return (
    <div
      style={{
        border: "3px solid white",
        borderRadius: 8,
        padding: "16px 20px",
        backgroundColor: color,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Select
        onChange={onChange}
        placeholder="Select graph"
        style={{ width: "200px" }}
        size="large"
      >
        {Object.values(Graphs).map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <Tooltip title={"Add the selected correlation chart"}>
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<AreaChartOutlined style={iconStyle} />}
          onClick={() => {
            if (selectedVar) generateGraph(selectedVar);
          }}
        />
      </Tooltip>
    </div>
  );
}

export default function Panel(props) {
  const { variables, selectedVar, onVarChange, generateGraph } = props;

  return (
    <AppBar title="CORRELATION">
      <Buttons
        variables={variables}
        selectedVar={selectedVar}
        onChange={onVarChange}
        generateGraph={generateGraph}
      />
    </AppBar>
  );
}
