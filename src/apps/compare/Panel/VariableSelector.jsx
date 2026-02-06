import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";

import { selectVars } from "@/store/slices/cantabSlice";
import { checkAssumptions, setSelectedVar } from "@/store/slices/compareSlice";
import ColoredButton from "@/components/ui/ColoredButton";

const { Option } = Select;

export default function VariableSelector({ generateDistribution }) {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);

  useEffect(() => {
    if (selectedVar && groupVar) {
      dispatch(checkAssumptions());
    }
  }, [selectedVar, groupVar]);

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
        placeholder="Search or Select variable"
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
            : "Group variable must be set. Actual grouping variable: " +
              groupVar +
              "."
        }
        icon={<AreaChartOutlined />}
        onClick={() => selectedVar && generateDistribution(selectedVar)}
        disabled={!selectedVar || !groupVar || !variables.includes(groupVar)}
      />
    </>
  );
}
