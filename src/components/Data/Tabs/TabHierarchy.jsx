import React from "react";
import { useSelector } from "react-redux";
import { Typography, Divider } from "antd";
import DragDropHierarchy from "../DragDrop/DragDropHierarchy";
import {
  selectNumericNodes,
  selectTextNodes,
  selectDetermineNodes,
  selectAggregationNodes,
} from "@/store/selectors/metaSelectors";

const { Title, Text } = Typography;

const Info = () => {
  const filename = useSelector((state) => state.metadata.filename);
  const dt = useSelector((state) => state.metadata.attributes);
  const numericNodes = useSelector((state) => selectNumericNodes(state));
  const textNodes = useSelector((state) => selectTextNodes(state));
  const determineNodes = useSelector((state) => selectDetermineNodes(state));
  const aggregationNodes = useSelector((state) =>
    selectAggregationNodes(state),
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
        overflow: "auto",
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
          Nº Nodes:
        </Text>{" "}
        <Text>
          {dt?.length - aggregationNodes?.length || 0} original,{" "}
          {aggregationNodes?.length || 0} new
        </Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Summary
      </Title>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Numeric Measurements:
        </Text>{" "}
        <Text>{numericNodes?.length || 0}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Text Measurements:
        </Text>{" "}
        <Text>{textNodes?.length || 0}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Unknown Measurements:
        </Text>{" "}
        <Text>{determineNodes?.length || 0}</Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Expected File
      </Title>
      <div>
        <Text type="secondary">
          Upload a JSON array of hierarchy measurements. Each measurement should
          include the fields `id`, `name`, `type`, `dtype`, `related`, and
          `isShown`.
        </Text>
      </div>
      <div>
        <Text type="secondary">
          `related` is a list of child measurement IDs. The root measurement
          must have `id: 0` and `type: "root"`.
        </Text>
      </div>
      <div>
        <Text type="secondary">
          Aggregation measurements may include `info.exec` (formula) and should
          match existing data measurements by `name`.
        </Text>
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
        overflow: "auto",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: 0, color: "var(--primary-color)" }}
      >
        Upload Hierarchy
      </Title>
      <Text type="secondary">
        This replaces the current hierarchy and updates the visible measurements.
      </Text>
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
        width: "100%",
        gap: "1rem",
        overflow: "auto",
      }}
    >
      <Info />
      <UploadPanel />
    </div>
  );
}
