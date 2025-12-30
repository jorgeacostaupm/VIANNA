import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Tooltip } from "antd";
import DragDropHierarchy from "../DragDrop/DragDropHierarchy";
import {
  selectNumericNodes,
  selectTextNodes,
  selectDetermineNodes,
  selectAggregationNodes,
} from "@/store/selectors/metaSelectors";
import DragDropDesc from "../DragDrop/DragDropDesc";

const { Title, Text } = Typography;

const Info = () => {
  const filename = useSelector((state) => state.metadata.filename);
  const dt = useSelector((state) => state.metadata.attributes);
  const numericNodes = useSelector((state) => selectNumericNodes(state));
  const textNodes = useSelector((state) => selectTextNodes(state));
  const determineNodes = useSelector((state) => selectDetermineNodes(state));
  const aggregationNodes = useSelector((state) =>
    selectAggregationNodes(state)
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
        Actual Hierarchy
      </Title>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          File Name:
        </Text>{" "}
        <Text>{filename ? filename : "—"}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Nodes:
        </Text>{" "}
        <Text>
          {dt?.length - aggregationNodes?.length || 0} original,{" "}
          {aggregationNodes?.length || 0} new
        </Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Numeric Nodes:
        </Text>{" "}
        <Text>{numericNodes?.length || 0}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Textual Nodes:
        </Text>{" "}
        <Text>{textNodes?.length || 0}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Unknown Nodes:
        </Text>{" "}
        <Text>{determineNodes?.length || 0}</Text>
      </div>
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
        style={{ marginBottom: 0, color: "var(--primary-color)" }}
      >
        Upload Hierarchy
      </Title>
      <DragDropHierarchy />
    </div>
  );
};

export default function TabHierarchy() {
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
      <Info />
      <UploadPanel />
    </div>
  );
}
