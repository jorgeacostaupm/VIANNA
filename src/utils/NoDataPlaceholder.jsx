import React from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

export default function NoDataPlaceholder({
  message = "No data available",
  description,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <Empty
        description={<Text type="secondary">{description || message}</Text>}
      />
    </div>
  );
}
