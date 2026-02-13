import React from "react";
import { HomeOutlined, PartitionOutlined } from "@ant-design/icons";

import LinkButton from "@/components/ui/ButtonLink";

export default function AppsButtons() {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <LinkButton to="overview" icon={<HomeOutlined />} />
      <LinkButton to="metadata" icon={<PartitionOutlined />} />
    </div>
  );
}
