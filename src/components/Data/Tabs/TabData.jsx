import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Typography, Divider, Tooltip } from "antd";
import DragDropData from "../DragDrop/DragDropData";
import { setGroupVar, setTimeVar, setIdVar } from "@/store/slices/cantabSlice";
import {
  selectNavioVars,
  selectCategoricalVars,
  selectNumericVars,
  selectUnkownVars,
} from "@/store/slices/cantabSlice";

const { Title, Text } = Typography;
const safeJoin = (arr) => (arr && arr.length ? arr.join(", ") : "—");

const Info = () => {
  const dispatch = useDispatch();
  const filename = useSelector((state) => state.dataframe.present.filename);
  const dt = useSelector((state) => state.dataframe.present.dataframe);
  const idVar = useSelector((state) => state.cantab.present.idVar);
  const groupVar = useSelector((state) => state.cantab.present.groupVar);
  const timeVar = useSelector((state) => state.cantab.present.timeVar);
  const vars = useSelector(selectNavioVars);
  const numericVars = useSelector(selectNumericVars);
  const categoricalVars = useSelector(selectCategoricalVars);
  const unknownVars = useSelector(selectUnkownVars);

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
        boxSizing: "border-box",
        borderRadius: "4px",
      }}
    >
      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Metadata
      </Title>
      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          File Name:
        </Text>{" "}
        <Text>{filename ? filename : "—"}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Rows:
        </Text>{" "}
        <Text>{dt?.length || 0}</Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Configuration Variables
      </Title>

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
        width: "100%",
      }}
    >
      <Info />
      <UploadPanel />
    </div>
  );
}
