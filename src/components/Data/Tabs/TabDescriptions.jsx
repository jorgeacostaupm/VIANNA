import React from "react";
import { useSelector } from "react-redux";
import { Typography } from "antd";

import DragDropDesc from "../DragDrop/DragDropDesc";
import { selectDescribedNodes } from "@/store/selectors/metaSelectors";

const { Title, Text } = Typography;

const Info = () => {
  const filename = useSelector((state) => state.metadata.descriptionsFilename);
  const attributes = useSelector(selectDescribedNodes);

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
        Actual Descriptions
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

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Variables Described:
        </Text>{" "}
        <Text>{attributes.sort().join(", ")}</Text>
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
        height: "500px",
        width: "100%",
        gap: "1rem",
      }}
    >
      <Info />
      <UploadDesc />
    </div>
  );
}
