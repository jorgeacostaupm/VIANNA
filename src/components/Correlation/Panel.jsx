import React from "react";
import { Select } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";

import AppBar from "@/utils/AppBar";
import { Graphs } from "@/utils/Constants";
import BarButton from "@/utils/BarButton";

const { Option } = Select;

function Buttons({ selectedVar, onChange, generateGraph }) {
  return (
    <div
      style={{
        border: "3px solid white",
        borderRadius: 8,
        padding: "16px 20px",
        backgroundColor: "var(--primary-color)",
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Select
        onChange={onChange}
        placeholder="Select graph"
        style={{ width: "300px" }}
        size="large"
      >
        {Object.values(Graphs).map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <BarButton
        title={"Add the selected correlation chart"}
        icon={<AreaChartOutlined />}
        onClick={() => {
          if (selectedVar) generateGraph(selectedVar);
        }}
      />
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
