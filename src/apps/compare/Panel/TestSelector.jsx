// SelectorPanel.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { ExperimentOutlined, BarChartOutlined } from "@ant-design/icons";

import { pubsub } from "@/utils/pubsub";
import tests from "@/utils/tests";
import { setSelectedTest } from "@/store/slices/compareSlice";
import ColoredButton from "@/utils/ColoredButton";

const { Option } = Select;
const { publish } = pubsub;

export default function TestSelector({ generateTest, generateRanking }) {
  const dispatch = useDispatch();
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const selectedTest = useSelector((s) => s.compare.selectedTest);

  const varTypes = useSelector((s) => s.cantab.present.varTypes);
  const groups = useSelector((s) => s.cantab.present.selectionGroups);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);

  function triggerTest() {
    const testObj = tests.find((t) => t.label === selectedTest);
    const testType = testObj.variableType;
    const variableType = varTypes[selectedVar];
    if (testType === variableType && testObj.isApplicable(groups.length))
      generateTest(selectedTest, selectedVar);
    else {
      const configuration = {
        message: "Test not applicable",
        type: "error",
      };
      publish("notification", configuration);
    }
  }

  return (
    <>
      <Select
        value={selectedTest}
        onChange={(v) => dispatch(setSelectedTest(v))}
        placeholder="Select test"
        style={{ width: "250px" }}
      >
        {tests.map((t) => (
          <Option key={t.label} value={t.label}>
            {t.label}
          </Option>
        ))}
      </Select>

      <ColoredButton
        title={
          groupVar
            ? "Run the selected test on current variable"
            : "Group variable must be set."
        }
        icon={<ExperimentOutlined />}
        onClick={triggerTest}
        disabled={!selectedVar || !selectedTest || !groupVar}
      />

      <ColoredButton
        title={
          groupVar
            ? "Compare all variables with the selected test"
            : "Group variable must be set."
        }
        icon={<BarChartOutlined />}
        onClick={() => selectedTest && generateRanking(selectedTest)}
        disabled={!selectedTest || !groupVar}
      />
    </>
  );
}
