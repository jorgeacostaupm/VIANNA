// SelectorPanel.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";

import { selectVars } from "@/features/cantab/cantabSlice";
import BarButton from "@/utils/BarButton";
import {
  checkAssumptions,
  setSelectedVar,
} from "@/features/compare/compareSlice";

const { Option } = Select;

export default function VariableSelector({ generateDistribution }) {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const groupVar = useSelector((s) => s.cantab.groupVar);

  useEffect(() => {
    if (selectedVar && groupVar) {
      dispatch(checkAssumptions());
    }
  }, [selectedVar, groupVar]);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar]);

  return (
    <>
      <Select
        value={selectedVar}
        onChange={(v) => dispatch(setSelectedVar(v))}
        placeholder="Select variable"
        style={{ width: "200px", fontSize: 18 }}
        size="large"
      >
        {variables.map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <BarButton
        title={
          groupVar
            ? "Add distribution plots for the selected variable."
            : "Group variable must be set."
        }
        icon={<AreaChartOutlined />}
        onClick={() => selectedVar && generateDistribution(selectedVar)}
        disabled={!selectedVar || !groupVar}
      />
    </>
  );
}
