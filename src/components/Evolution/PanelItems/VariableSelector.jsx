import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { LineChartOutlined } from "@ant-design/icons";

import BarButton from "@/utils/BarButton";
import { setSelectedVar } from "@/features/evolution/evolutionSlice";
import { selectNumericVars } from "@/features/cantab/cantabSlice";

const { Option } = Select;

export default function VariableSelector({ generateEvolution }) {
  const dispatch = useDispatch();
  const selectedVar = useSelector((s) => s.evolution.selectedVar);
  const groupVar = useSelector((s) => s.cantab.groupVar);
  const timeVar = useSelector((s) => s.cantab.timeVar);
  const variables = useSelector(selectNumericVars);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar]);

  return (
    <>
      <Select
        value={selectedVar}
        onChange={(v) => dispatch(setSelectedVar(v))}
        placeholder="Select a variable"
        style={{ width: "250px" }}
        size="large"
      >
        {variables.map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <BarButton
        title={"Add distribution plots for the selected variable"}
        icon={<LineChartOutlined />}
        onClick={() => selectedVar && generateEvolution(selectedVar)}
        disabled={!selectedVar || !groupVar || !timeVar}
      />
    </>
  );
}
