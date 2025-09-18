import React from "react";
import { useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import { DownloadOutlined, SettingOutlined } from "@ant-design/icons";

import { HierarchyManagementButton } from "../Data/Buttons/DataManagementButton";
import { Legend } from "./LegendButton";
import { hierarchySelector } from "@/features/metadata/metaSlice";
import buttonStyles from "@/utils/Buttons.module.css";

export default function Buttons() {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <HierarchyManagementButton></HierarchyManagementButton>
    </div>
  );
}

export function HierarchyButtons() {
  const hierarchy = useSelector(hierarchySelector);

  return (
    <>
      <Tooltip title={"Download hierarchy"}>
        <Button
          shape="circle"
          className={buttonStyles.barButton}
          onClick={() => downloadHierarchy(hierarchy)}
        >
          <DownloadOutlined style={{ fontSize: "25px" }} />
        </Button>
      </Tooltip>

      <HierarchyManagementButton></HierarchyManagementButton>
      <Tooltip title={"Chart settings"}>
        <Button
          shape="circle"
          className={buttonStyles.barButton}
          onClick={() => downloadHierarchy(hierarchy)}
        >
          <SettingOutlined style={{ fontSize: "25px" }} />
        </Button>
      </Tooltip>

      <Legend />
    </>
  );
}

function downloadHierarchy(hierarchy) {
  const meta = JSON.stringify(hierarchy, null, 2);
  const blob = new Blob([meta], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = href;
  downloadLink.download = "hierarchy.json";
  downloadLink.click();
}
