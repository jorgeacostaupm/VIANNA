// components/SelectorPanel/AssumptionsTags.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { selectVars } from "@/features/cantab/cantabSlice";
import {
  checkAssumptions,
  setSelectedVar,
} from "@/features/compare/compareSlice";

import { getColorByDtype, getNameByDtype } from "@/utils/Constants";
import AutoCloseTooltip from "@/utils/AutoCloseTooltip";

const grayStyle = {
  fontSize: 16,
  padding: "4px 10px",
  backgroundColor: "#f0f0f0",
  color: "#888",
};

const StatusTag = ({ condition, successText, failText, label }) =>
  condition !== null ? (
    <AutoCloseTooltip title={condition ? successText : failText}>
      <Tag
        icon={
          condition ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />
        }
        color={condition ? "success" : "warning"}
        style={{ fontSize: 20, padding: "4px 10px" }}
      >
        {label}
      </Tag>
    </AutoCloseTooltip>
  ) : (
    <Tag style={grayStyle}>-</Tag>
  );

const TypeTag = ({ type }) =>
  type ? (
    <AutoCloseTooltip title={`Variable type: ${getNameByDtype(type)}`}>
      <Tag
        color={getColorByDtype(type)}
        style={{
          display: "flex",
          fontSize: 20,
          padding: "4px 10px",
          width: "5vw",
          justifyContent: "center",
        }}
      >
        {getNameByDtype(type)}
      </Tag>
    </AutoCloseTooltip>
  ) : (
    <Tag style={grayStyle}>-</Tag>
  );

export default function AssumptionsTags() {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);
  const assumptions = useSelector((s) => s.compare.assumptions);
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const varTypes = useSelector((s) => s.cantab.varTypes);
  const groupVar = useSelector((s) => s.cantab.groupVar);

  const allNormal = assumptions.normality?.every((d) => d.normal);
  const type = varTypes[selectedVar] || null;

  useEffect(() => {
    if (selectedVar && groupVar) {
      dispatch(checkAssumptions());
    }
  }, [selectedVar, groupVar, dispatch]);

  useEffect(() => {
    if (!variables.includes(selectedVar)) {
      dispatch(setSelectedVar(null));
    }
  }, [variables, selectedVar, dispatch]);

  return (
    <>
      <StatusTag
        condition={assumptions.normality !== null ? allNormal : null}
        successText="All distributions meet normality"
        failText="Some distributions fail normality"
        label="Normality"
      />

      <StatusTag
        condition={assumptions.equalVariance}
        successText="Homogeneous variances"
        failText="Heterogeneous variances"
        label="Equal σ²"
      />

      <TypeTag type={type} />
    </>
  );
}
