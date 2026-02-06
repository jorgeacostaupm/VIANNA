// components/SelectorPanel/AssumptionsTags.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { selectVars } from "@/store/slices/cantabSlice";
import { checkAssumptions, setSelectedVar } from "@/store/slices/compareSlice";

import { getColorByDtype, getNameByDtype } from "@/utils/Constants";
import AutoCloseTooltip from "@/components/ui/AutoCloseTooltip";

const grayStyle = {
  backgroundColor: "#f0f0f0",
  color: "#888",
};

const tagStyle = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  minWidth: "100px", // ajusta según necesites
  textAlign: "center",
  padding: "6px 10px",
  lineHeight: 1,
  gap: "6px",
  overflow: "visible",
};

const StatusTag = ({ condition, successText, failText, label }) =>
  condition !== null ? (
    <AutoCloseTooltip title={condition ? successText : failText}>
      <Tag
        icon={
          condition ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />
        }
        color={condition ? "success" : "warning"}
        style={tagStyle}
      >
        {label}
      </Tag>
    </AutoCloseTooltip>
  ) : (
    <Tag style={{ ...grayStyle, ...tagStyle }}>-</Tag>
  );

const TypeTag = ({ type }) =>
  type ? (
    <AutoCloseTooltip title={`Variable type: ${getNameByDtype(type)}`}>
      <Tag color={getColorByDtype(type)} style={tagStyle}>
        {getNameByDtype(type)}
      </Tag>
    </AutoCloseTooltip>
  ) : (
    <Tag style={{ ...grayStyle, ...tagStyle }}>-</Tag>
  );

export default function AssumptionsTags() {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);
  const assumptions = useSelector((s) => s.compare.assumptions);
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const varTypes = useSelector((s) => s.cantab.present.varTypes);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);

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
        condition={assumptions.normality && type !== null ? allNormal : null}
        successText="All distributions meet normality"
        failText="Some distributions fail normality"
        label="Normality"
      />

      <StatusTag
        condition={type !== null ? assumptions.equalVariance : null}
        successText="Homogeneous variances"
        failText="Heterogeneous variances"
        label="Equal σ²"
      />

      <TypeTag type={type} />
    </>
  );
}
