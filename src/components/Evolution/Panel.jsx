// SelectorPanel.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, Tooltip, Tag, Button } from "antd";
import { LineChartOutlined } from "@ant-design/icons";

import AppBar from "@/utils/AppBar";
import styles from "@/utils/Buttons.module.css";
import tests from "@/utils/evolution_tests";
import { setSelectedVar } from "@/features/evolution/evolutionSlice";

const color = "#7bb2ff";
const { Option } = Select;
const iconStyle = { fontSize: "25px" };

function Variable({ generateEvolution }) {
  const dispatch = useDispatch();
  const selectedVar = useSelector((s) => s.evolution.selectedVar);
  const groupVar = useSelector((s) => s.cantab.groupVar);
  const timeVar = useSelector((s) => s.cantab.timeVar);
  const variables = useSelector(selectNumericVars);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar]);

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

      <Tooltip title={"Add distribution plots for the selected variable"}>
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<LineChartOutlined style={iconStyle} />}
          onClick={() => selectedVar && generateEvolution(selectedVar)}
          disabled={!selectedVar || !groupVar || !timeVar}
        />
      </Tooltip>
    </div>
  );
}

import { ExperimentOutlined, BarChartOutlined } from "@ant-design/icons"; // puedes cambiar estos si prefieres otros íconos
import { group } from "d3";
import { selectNumericVars } from "../../features/cantab/cantabSlice";

function TestSelector({ selectedTest, onChange, generateRanking }) {
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
        placeholder="Select test"
        style={{ width: "150px" }}
        size="large"
      >
        {tests.map((t) => (
          <Option key={t.label} value={t.label}>
            {t.label}
          </Option>
        ))}
      </Select>

      <Tooltip title="Compare all variables with the selected test">
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<BarChartOutlined style={iconStyle} />}
          onClick={() => selectedTest && generateRanking()}
        />
      </Tooltip>
    </div>
  );
}

export default function Panel(props) {
  const { generateEvolution } = props;

  return (
    <AppBar title="EVOLUTION">
      <Variable generateEvolution={generateEvolution} />
      {/*       <TestSelector
        selectedTest={selectedTest}
        onChange={onTestChange}
        generateRanking={generateRanking}
      /> */}
    </AppBar>
  );
}
