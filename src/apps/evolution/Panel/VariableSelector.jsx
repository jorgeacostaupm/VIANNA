import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { LineChartOutlined } from "@ant-design/icons";

import { setSelectedVar } from "@/store/slices/evolutionSlice";
import { selectNumericVars } from "@/store/slices/cantabSlice";
import ColoredButton from "@/components/ui/ColoredButton";

const { Option } = Select;

export default function VariableSelector({ generateEvolution }) {
  const dispatch = useDispatch();
  const selectedVar = useSelector((s) => s.evolution.selectedVar);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);
  const timeVar = useSelector((s) => s.cantab.present.timeVar);
  const variables = useSelector(selectNumericVars);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar]);

  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  return (
    <>
      <Select
        value={selectedVar}
        onChange={(v) => dispatch(setSelectedVar(v))}
        placeholder="Search or select variable"
        style={{ width: "250px" }}
        showSearch={true}
        filterOption={filterOption}
        optionFilterProp="children"
        notFoundContent="No variables found"
        allowClear={true}
      >
        {variables.map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <ColoredButton
        title={
          groupVar && variables.includes(groupVar)
            ? "Add distribution plots for the selected variable."
            : "Group and Time variables must be set. Actual grouping variable: " +
              groupVar +
              ". Actual time variable: " +
              timeVar +
              "."
        }
        icon={<LineChartOutlined />}
        onClick={() => selectedVar && generateEvolution(selectedVar)}
        disabled={!groupVar || !timeVar}
      />
    </>
  );
}
