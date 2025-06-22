// SelectorPanel.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, Tooltip, Tag, Button } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  AreaChartOutlined,
  ExperimentOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

import { selectVars } from "@/features/cantab/cantabSlice";
import {
  checkAssumptions,
  setSelectedVar,
  setSelectedTest,
} from "@/features/compare/compareSlice";

import tests from "@/utils/tests";
import AppBar from "@/utils/AppBar";
import styles from "@/utils/Buttons.module.css";
import { VariableTypes } from "@/utils/Constants";

const color = "#7bb2ff";
const { Option } = Select;
const iconStyle = { fontSize: "25px" };

const grayStyle = {
  fontSize: 16,
  padding: "4px 10px",
  backgroundColor: "#f0f0f0",
  color: "#888",
};

function typeColor(type) {
  const tmp =
    type === VariableTypes.NUMERICAL
      ? "blue"
      : type === VariableTypes.CATEGORICAL
      ? "orange"
      : "pink";

  return tmp;
}

export function Variable({ generateDistribution }) {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);
  const assumptions = useSelector((s) => s.compare.assumptions);
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const varTypes = useSelector((s) => s.cantab.varTypes);
  const groupVar = useSelector((s) => s.cantab.groupVar);
  const allNormal = assumptions.normality?.every((d) => d.normal);
  const type = varTypes[selectedVar] ? varTypes[selectedVar] : null;

  useEffect(() => {
    if (selectedVar && groupVar) {
      dispatch(checkAssumptions());
    }
  }, [selectedVar, groupVar]);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar]);

  console.log(assumptions);
  return (
    <div
      style={{
        border: "3px solid white",
        borderRadius: 8,
        padding: "16px 20px",
        backgroundColor: color,
        display: "flex",
        gap: 8,
        minWidth: 400,
        alignItems: "center",
      }}
    >
      <Select
        value={selectedVar}
        onChange={(v) => dispatch(setSelectedVar(v))}
        placeholder="Select variable"
        style={{ width: "200px" }}
        size="large"
      >
        {variables.map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <Tooltip
        title={
          groupVar
            ? "Add distribution plots for the selected variable."
            : "Group variable must be set."
        }
      >
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<AreaChartOutlined style={iconStyle} />}
          onClick={() => selectedVar && generateDistribution(selectedVar)}
          disabled={!selectedVar || !groupVar}
        />
      </Tooltip>

      {assumptions.normality !== null ? (
        <Tooltip
          title={
            allNormal
              ? "All distributions meet normality"
              : "Some distributions fail normality"
          }
        >
          <Tag
            icon={
              allNormal ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )
            }
            color={allNormal ? "success" : "warning"}
            style={{ fontSize: 16, padding: "4px 10px" }}
          >
            Normality
          </Tag>
        </Tooltip>
      ) : (
        <Tag style={grayStyle}>-</Tag>
      )}

      {assumptions.equalVariance !== null ? (
        <Tooltip
          title={
            assumptions.equalVariance
              ? "Homogeneous variances"
              : "Heterogeneous variances"
          }
        >
          <Tag
            icon={
              assumptions.equalVariance ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )
            }
            color={assumptions.equalVariance ? "success" : "warning"}
            style={{ fontSize: 16, padding: "4px 10px" }}
          >
            Equal σ²
          </Tag>
        </Tooltip>
      ) : (
        <Tag style={grayStyle}>-</Tag>
      )}

      {selectedVar ? (
        <Tooltip title={`Variable type: ${type}`}>
          <Tag
            color={typeColor(type)}
            style={{ fontSize: 16, padding: "4px 10px" }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Tag>
        </Tooltip>
      ) : (
        <Tag style={grayStyle}>-</Tag>
      )}
    </div>
  );
}

import { pubsub } from "@/utils/pubsub";
const { publish } = pubsub;
function TestSelector({ generateTest, generateRanking }) {
  const dispatch = useDispatch();
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const selectedTest = useSelector((s) => s.compare.selectedTest);

  const varTypes = useSelector((s) => s.cantab.varTypes);
  const groups = useSelector((s) => s.cantab.selectionGroups);
  const groupVar = useSelector((s) => s.cantab.groupVar);

  function triggerTest() {
    const testObj = tests.find((t) => t.label === selectedTest);
    const testType = testObj.variableType;
    const variableType = varTypes[selectedVar];
    if (testType === variableType && testObj.isApplicable(groups.length))
      generateTest(selectedTest, selectedVar);
    else {
      const configuration = {
        message: "Test not applicable",
        description: "",
        placement: "bottomRight",
        type: "error",
      };
      publish("notification", configuration);
    }
  }

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
        value={selectedTest}
        onChange={(v) => dispatch(setSelectedTest(v))}
        placeholder="Select test"
        style={{ width: "250px" }}
        size="large"
      >
        {tests.map((t) => (
          <Option key={t.label} value={t.label}>
            {t.label}
          </Option>
        ))}
      </Select>

      <Tooltip
        title={
          groupVar
            ? "Run the selected test on current variable"
            : "Group variable must be set."
        }
      >
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<ExperimentOutlined style={iconStyle} />}
          onClick={triggerTest}
          disabled={!selectedVar || !selectedTest || !groupVar}
        />
      </Tooltip>

      <Tooltip
        title={
          groupVar
            ? "Compare all variables with the selected test"
            : "Group variable must be set."
        }
      >
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<BarChartOutlined style={iconStyle} />}
          onClick={() => selectedTest && generateRanking(selectedTest)}
          disabled={!selectedTest || !groupVar}
        />
      </Tooltip>
    </div>
  );
}

export default function Panel({
  generateDistribution,
  generateTest,
  generateRanking,
}) {
  return (
    <AppBar title="COMPARISON">
      <Variable generateDistribution={generateDistribution} />

      <TestSelector
        generateTest={generateTest}
        generateRanking={generateRanking}
      />
    </AppBar>
  );
}
