import React from "react";
import { useSelector } from "react-redux";
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import HierarchyManagementButtons from "@/components/Data/Buttons/HierarchyManagementButton";
import LegendButton from "./LegendButton";
import { Bar } from "@/components/charts/ChartBar";
import { hierarchySelector } from "@/store/selectors/metaSelectors";
import BarButton from "@/components/ui/BarButton";
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

export default function HierarchyBar({ orientation, onOrientationChange }) {
  const hierarchy = useSelector(hierarchySelector);
  const isHorizontal = orientation === "horizontal";
  const nextOrientation = isHorizontal ? "vertical" : "horizontal";

  return (
    <>
      <Bar title={"Hierarchy Editor"} drag={false}>
        {/* <UndoRedoButtons></UndoRedoButtons>
        <div className={styles.separator} /> */}
        <HierarchyManagementButtons></HierarchyManagementButtons>

        <LegendButton />

        <BarButton
          title={"Download hierarchy"}
          onClick={() => downloadHierarchy(hierarchy)}
          icon={<DownloadOutlined />}
        />

        <BarButton
          title={
            isHorizontal
              ? "Switch to vertical layout"
              : "Switch to horizontal layout"
          }
          onClick={() => onOrientationChange?.(nextOrientation)}
          icon={
            !isHorizontal ? <RotateLeftOutlined /> : <RotateRightOutlined />
          }
        />

        <EditButton></EditButton>
      </Bar>
    </>
  );
}
