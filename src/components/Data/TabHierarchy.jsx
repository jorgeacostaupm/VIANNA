import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Tooltip } from "antd";
import DragDropHierarchy from "./DragDropHierarchy";
import {
  selectNumericNodes,
  selectTextNodes,
  selectDateNodes,
  selectDetermineNodes,
  selectAggregationNodes,
} from "@/features/metadata/metaSlice";
import DragDropDesc from "./DragDropDesc";

const { Title, Text } = Typography;

const DataInfoPanel = () => {
  const filename = useSelector((state) => state.metadata.filename);
  const dt = useSelector((state) => state.metadata.attributes);
  const numericNodes = useSelector((state) => selectNumericNodes(state));
  const textNodes = useSelector((state) => selectTextNodes(state));
  const dateNodes = useSelector((state) => selectDateNodes(state));
  const determineNodes = useSelector((state) => selectDetermineNodes(state));
  const aggregationNodes = useSelector((state) =>
    selectAggregationNodes(state)
  );

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

  const safeJoin = (arr) => (arr && arr.length ? arr.join(", ") : "—");

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
        Actual Hierarchy
      </Title>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Name:
        </Text>{" "}
        <Text>{filename || "—"}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Total Nodes:
        </Text>{" "}
        <Text>
          {dt?.length - aggregationNodes?.length || 0} original,{" "}
          {aggregationNodes?.length || 0} new
        </Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Undetermined Nodes:
        </Text>{" "}
        <Tooltip placement="right" title={safeJoin(determineNodes)}>
          <Text>{determineNodes?.length || 0}</Text>
        </Tooltip>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Numeric Nodes:
        </Text>{" "}
        <Tooltip placement="right" title={safeJoin(numericNodes)}>
          <Text>{numericNodes?.length || 0}</Text>
        </Tooltip>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Textual Nodes:
        </Text>{" "}
        <Tooltip placement="right" title={safeJoin(textNodes)}>
          <Text>{textNodes?.length || 0}</Text>
        </Tooltip>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Date Nodes:
        </Text>{" "}
        <Tooltip placement="right" title={safeJoin(dateNodes)}>
          <Text>{dateNodes?.length || 0}</Text>
        </Tooltip>
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
        style={{ marginBottom: 4, color: "var(--primary-color)" }}
      >
        Upload Hierarchy
      </Title>
      <DragDropHierarchy />
    </div>
  );
};

const UploadDesc = () => {
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
        Upload Descriptions
      </Title>
      <DragDropDesc />
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
      <DataInfoPanel />
      <UploadPanel />
      <UploadDesc />
    </div>
  );
}
