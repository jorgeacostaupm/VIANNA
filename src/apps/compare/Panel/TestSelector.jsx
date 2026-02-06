// SelectorPanel.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { ExperimentOutlined, BarChartOutlined } from "@ant-design/icons";

import { pubsub } from "@/utils/pubsub";
import tests from "@/utils/tests";
import { VariableTypes } from "@/utils/Constants";
import { setSelectedTest } from "@/store/slices/compareSlice";
import ColoredButton from "@/components/ui/ColoredButton";

const { Option, OptGroup } = Select;
const { publish } = pubsub;

export default function TestSelector({ generateTest, generateRanking }) {
  const dispatch = useDispatch();
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const selectedTest = useSelector((s) => s.compare.selectedTest);

  const varTypes = useSelector((s) => s.cantab.present.varTypes);
  const groups = useSelector((s) => s.cantab.present.selectionGroups);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);
  const selectedTestObj = tests.find((t) => t.label === selectedTest);

  function getTypeLabel(test) {
    const category = String(test.category || "").toLowerCase();
    if (category.includes("propor")) return "Proportions";
    if (test.variableType === VariableTypes.NUMERICAL) return "Numerical";
    if (test.variableType === VariableTypes.CATEGORICAL) return "Categorical";
    return "Other";
  }

  function safeApplicable(test, count) {
    try {
      return typeof test.isApplicable === "function"
        ? test.isApplicable(count)
        : false;
    } catch {
      return false;
    }
  }

  function getCountLabel(test) {
    const supports2 = safeApplicable(test, 2);
    const supports3 = safeApplicable(test, 3);
    if (supports2 && !supports3) return "Pairs (n=2)";
    if (supports3) return "n>=2";
    if (supports2) return "Pairs (n=2)";
    return "Other";
  }

  const groupedTests = tests.reduce((acc, t) => {
    const label = `${getTypeLabel(t)} — ${getCountLabel(t)}`;
    if (!acc[label]) acc[label] = [];
    acc[label].push(t);
    return acc;
  }, {});

  const preferredOrder = [
    "Numerical — Pairs (n=2)",
    "Numerical — n>=2",
    "Categorical — Pairs (n=2)",
    "Categorical — n>=2",
    "Proportions — Pairs (n=2)",
    "Proportions — n>=2",
    "Other — Pairs (n=2)",
    "Other — n>=2",
  ];

  const orderedGroups = [
    ...preferredOrder.filter((label) => groupedTests[label]),
    ...Object.keys(groupedTests)
      .filter((label) => !preferredOrder.includes(label))
      .sort(),
  ];

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
        style={{ width: "400px" }}
        listHeight={520}
      >
        {orderedGroups.map((category) => (
          <OptGroup key={category} label={category}>
            {groupedTests[category].map((t) => (
              <Option key={t.label} value={t.label}>
                {t.label}
              </Option>
            ))}
          </OptGroup>
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
