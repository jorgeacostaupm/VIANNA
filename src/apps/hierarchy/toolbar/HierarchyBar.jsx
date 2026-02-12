import React from "react";
import { useSelector } from "react-redux";
import {
  DragOutlined,
  DownloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import HierarchyManagementButtons from "@/components/Data/Buttons/HierarchyManagementButton";
import LegendButton from "./LegendButton";
import { Bar } from "@/components/charts/ChartBar";
import { hierarchySelector } from "@/store/selectors/metaSelectors";
import BarButton from "@/components/ui/BarButton";
import PopoverButton from "@/components/ui/PopoverButton";
import HierarchyViewSettings from "../tools/HierarchyViewSettings";

function downloadHierarchy(hierarchy) {
  const meta = JSON.stringify(hierarchy, null, 2);
  const blob = new Blob([meta], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = href;
  downloadLink.download = "hierarchy.json";
  downloadLink.click();
}

export default function HierarchyBar({
  orientation,
  onOrientationChange,
  linkStyle = "smooth",
  onLinkStyleChange,
  onActivateBrushSelection,
  viewConfig,
  onViewConfigChange,
}) {
  const hierarchy = useSelector(hierarchySelector);
  const hierarchyFilename = useSelector((state) => state.metadata.filename);
  const hasHierarchy = Array.isArray(hierarchy) && hierarchy.length > 0;
  const hierarchyTitle = hierarchyFilename
    ? `Hierarchy Editor · ${hierarchyFilename}`
    : "Hierarchy Editor";

  return (
    <>
      <Bar title={hierarchyTitle} drag={false}>
        {/* <UndoRedoButtons></UndoRedoButtons>
        <div className={styles.separator} /> */}

        <BarButton
          title="Activate brush selection (b)"
          onClick={() => onActivateBrushSelection?.()}
          icon={<DragOutlined />}
          disabled={!hasHierarchy}
        />

        <LegendButton />

        <BarButton
          title={"Download hierarchy"}
          onClick={() => downloadHierarchy(hierarchy)}
          icon={<DownloadOutlined />}
        />

        {/* <BarButton
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

        <BarButton
          title={`Link style: ${LINK_STYLE_LABELS[linkStyle] ?? LINK_STYLE_LABELS.smooth}. Click to switch to ${LINK_STYLE_LABELS[nextLinkStyle]}.`}
          onClick={() => onLinkStyleChange?.(nextLinkStyle)}
          icon={<SwapOutlined />}
        /> */}

        <PopoverButton
          title="Hierarchy settings"
          icon={<SettingOutlined />}
          content={
            <HierarchyViewSettings
              orientation={orientation}
              onOrientationChange={onOrientationChange}
              linkStyle={linkStyle}
              onLinkStyleChange={onLinkStyleChange}
              viewConfig={viewConfig}
              onViewConfigChange={onViewConfigChange}
            />
          }
        />
      </Bar>
    </>
  );
}
