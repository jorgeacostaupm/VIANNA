import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";

import { selectVars } from "@/store/features/main";
import { checkAssumptions, setSelectedVar } from "@/store/features/compare";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";
import styles from "@/styles/modules/analysisPanels.module.css";

const { Option } = Select;

export default function VariableSelector({ generateDistribution }) {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const groupVar = useSelector((s) => s.compare.groupVar);

  useEffect(() => {
    if (selectedVar && groupVar) {
      dispatch(checkAssumptions());
    }
  }, [selectedVar, groupVar, dispatch]);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar, dispatch]);

  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  return (
    <>
      <div className={styles.selectorField}>
        <span className={styles.selectorLabel}>Variable</span>
        <Select
          size="small"
          value={selectedVar ?? undefined}
          onChange={(v) => dispatch(setSelectedVar(v ?? null))}
          placeholder="Select variable"
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
      </div>

      <AppButton
        preset={APP_BUTTON_PRESETS.ACTION}
        tooltip={
          groupVar
            ? "Add distribution plots for the selected variable."
            : "Group variable must be set."
        }
        tooltipPlacement={"bottom"}
        icon={<AreaChartOutlined />}
        onClick={() => selectedVar && generateDistribution(selectedVar)}
        disabled={!selectedVar || !groupVar}
      />
    </>
  );
}
