import React from "react";
import { useSelector } from "react-redux";
import { Typography, Divider } from "antd";

import DragDropDesc from "../DragDrop/DragDropDesc";
import { selectDescribedNodes } from "@/store/selectors/metaSelectors";

const { Title, Text } = Typography;
const formatPreview = (arr, max = 12) => {
  if (!arr || arr.length === 0) return "—";
  const preview = arr.slice(0, max);
  const remaining = arr.length - preview.length;
  return remaining > 0
    ? `${preview.join(", ")} (+${remaining} more)`
    : preview.join(", ");
};

const Info = () => {
  const filename = useSelector((state) => state.metadata.descriptionsFilename);
  const attributes = useSelector(selectDescribedNodes);
  const allAttributes = useSelector((state) => state.metadata.attributes) || [];
  const describedSet = new Set(attributes);
  const missing = Array.from(
    new Set(
      allAttributes
        .filter((attr) => attr.type !== "root")
        .map((attr) => attr.name),
    ),
  ).filter((name) => !describedSet.has(name));

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
          Nº Descriptions:
        </Text>{" "}
        <Text>{attributes.length}</Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Summary
      </Title>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Measurements with description:
        </Text>{" "}
        <Text>{formatPreview([...attributes].sort())}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Missing descriptions:
        </Text>{" "}
        <Text>{formatPreview(missing.sort())}</Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Expected File
      </Title>
      <div>
        <Text type="secondary">
          Upload a CSV with headers `name` and `description`.
        </Text>
      </div>
      <div>
        <Text type="secondary">
          `name` must match the measurement names in your data.
        </Text>
      </div>
      <div>
        <Text type="secondary">
          One row per measurement is recommended; if a measurement appears
          multiple times, the last one takes priority.
        </Text>
      </div>
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
      <Text type="secondary">
        Each row maps a measurement name to its description.
      </Text>
      <DragDropDesc />
    </div>
  );
};

export default function TabDescriptions() {
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
      <UploadDesc />
    </div>
  );
}
