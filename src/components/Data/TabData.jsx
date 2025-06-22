import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Typography, Divider, Tooltip } from "antd";
import DragDropData from "./DragDropData";
import {
  setGroupVar,
  setTimeVar,
  setIdVar,
} from "@/features/cantab/cantabSlice";
import {
  selectAllVars,
  selectCategoricalVars,
  selectNumericVars,
  selectUnkownVars,
} from "@/features/cantab/cantabSlice";

const { Title, Text } = Typography;
const safeJoin = (arr) => (arr && arr.length ? arr.join(", ") : "—");

const DataInfoPanel = () => {
  const dispatch = useDispatch();
  const filename = useSelector((state) => state.dataframe.filename);
  const dt = useSelector((state) => state.dataframe.dataframe);
  const idVar = useSelector((state) => state.cantab.idVar);
  const groupVar = useSelector((state) => state.cantab.groupVar);
  const timeVar = useSelector((state) => state.cantab.timeVar);
  const vars = useSelector(selectAllVars);
  const numericVars = useSelector(selectNumericVars);
  const categoricalVars = useSelector(selectCategoricalVars);
  const unknownVars = useSelector(selectUnkownVars);

  const [highlight, setHighlight] = useState(false);
  const prevDtRef = useRef(dt);

  useEffect(() => {
    if (prevDtRef.current !== dt && prevDtRef.current !== undefined) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timer);
    }
    prevDtRef.current = dt;
  }, [dt]);

  const handleChange = useCallback(
    (setter) => (value) => dispatch(setter(value)),
    [dispatch]
  );

  return (
    <div
      style={{
        display: "flex",
        width: "50%",
        flexDirection: "column",
        gap: "1rem",
        padding: "20px",
        border: "3px solid transparent",
        boxSizing: "border-box",
        borderRadius: "4px",
        transition: "border-color 0.3s ease-in-out",
        borderColor: highlight ? "var(--primary-color)" : "transparent",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: 0, color: "var(--primary-color)" }}
      >
        Actual Data
      </Title>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Name:
        </Text>{" "}
        <Text>{filename || "—"}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Items:
        </Text>{" "}
        <Tooltip placement="right" title={`${dt?.length || 0} rows`}>
          <Text>{dt?.length || 0}</Text>
        </Tooltip>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Numerical variables:
        </Text>{" "}
        <Tooltip placement="right" title={safeJoin(numericVars)}>
          <Text>{numericVars.length}</Text>
        </Tooltip>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Categorical variables:
        </Text>{" "}
        <Tooltip placement="right" title={safeJoin(categoricalVars)}>
          <Text>{categoricalVars.length}</Text>
        </Tooltip>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Unknown variables:
        </Text>{" "}
        <Tooltip placement="right" title={safeJoin(unknownVars)}>
          <Text>{unknownVars.length}</Text>
        </Tooltip>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      {[
        ["ID variable", idVar, setIdVar],
        ["Group variable", groupVar, setGroupVar],
        ["Time variable", timeVar, setTimeVar],
      ].map(([label, value, setter]) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text strong style={{ color: "var(--primary-color)" }}>
            {label}:
          </Text>
          <Select
            style={{ width: "60%", marginTop: 0 }}
            value={value}
            onChange={handleChange(setter)}
            placeholder={`Select ${label.toLowerCase()}`}
            options={vars.map((key) => ({ label: key, value: key }))}
          />
        </div>
      ))}
    </div>
  );
};

const UploadPanel = () => (
  <div
    style={{
      width: "50%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "1rem",
      borderLeft: "1px solid #eee",
      padding: "20px",
      boxSizing: "border-box",
    }}
  >
    <Title level={4} style={{ marginBottom: 4, color: "var(--primary-color)" }}>
      Upload Data
    </Title>
    <DragDropData />
  </div>
);

export default function TabData() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "500px",
        width: "100%",
        gap: "1rem",
      }}
    >
      <DataInfoPanel />
      <UploadPanel />
    </div>
  );
}
