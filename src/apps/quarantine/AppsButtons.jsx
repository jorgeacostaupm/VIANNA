import React from "react";
import { HomeOutlined, PartitionOutlined } from "@ant-design/icons";

import GoToAppButton from "@/components/ui/ButtonLink";

export default function AppsButtons() {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <GoToAppButton to="overview" icon={<HomeOutlined />} />
      <GoToAppButton to="metadata" icon={<PartitionOutlined />} />
    </div>
  );
}
