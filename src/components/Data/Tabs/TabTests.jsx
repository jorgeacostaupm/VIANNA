import React from "react";
import { Typography } from "antd";
import DragDropTest from "../DragDrop/DragDropTest";
import tests from "@/utils/tests";

const { Title, Text } = Typography;

const DataInfoPanel = () => {
  return (
    <div
      style={{
        display: "flex",
        width: "50%",
        flexDirection: "column",
        gap: "1rem",
        padding: "20px",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: 0, color: "var(--primary-color)" }}
      >
        Available tests:
      </Title>

      {tests.map((t) => (
        <Text> {t.label}</Text>
      ))}
    </div>
  );
};

const UploadPanel = () => {
  return (
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
      <Title
        level={4}
        style={{ marginBottom: 4, color: "var(--primary-color)" }}
      >
        Upload Test
      </Title>
      <DragDropTest />
    </div>
  );
};

export default function TabTest() {
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
