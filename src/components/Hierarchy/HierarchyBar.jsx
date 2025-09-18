import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Card, Space } from "antd";
import { DownloadOutlined, SettingOutlined } from "@ant-design/icons";

import HierarchyManagementButton from "../Data/Buttons/HierarchyManagementButton";
import LegendButton from "./LegendButton";
import { Bar } from "@/utils/ChartBar";
import styles from "@/utils/ChartBar.module.css";
import EditOptions from "./EditButton";
import { hierarchySelector } from "@/features/metadata/metaSlice";
import BarButton from "@/utils/BarButton";
import EditButton from "./EditButton";

function downloadHierarchy(hierarchy) {
  const meta = JSON.stringify(hierarchy, null, 2);
  const blob = new Blob([meta], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = href;
  downloadLink.download = "hierarchy.json";
  downloadLink.click();
}

export default function HierarchyBar() {
  const hierarchy = useSelector(hierarchySelector);

  return (
    <>
      <Bar title={"Hierarchy Editor"} drag={false}>
        <HierarchyManagementButton></HierarchyManagementButton>

        <LegendButton />

        <BarButton
          title={"Download hierarchy"}
          onClick={() => downloadHierarchy(hierarchy)}
          icon={<DownloadOutlined style={{ fontSize: "20px" }} />}
        />

        <EditButton></EditButton>
      </Bar>
    </>
  );
}
