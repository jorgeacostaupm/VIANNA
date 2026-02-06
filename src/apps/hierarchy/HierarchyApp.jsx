import React from "react";
import { Layout } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import HierarchyEditor from "./editor/HierarchyEditor";
import styles from "@/styles/App.module.css";
import { Apps, APP_NAME } from "@/utils/Constants";
import { setInit } from "@/store/slices/metaSlice";
import useRootStyles from "@/hooks/useRootStyles";
import useNotification from "@/hooks/useNotification";
const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function HierarchyApp() {
  useRootStyles(setInit, APP_NAME + " - " + Apps.HIERARCHY);
  const holder = useNotification();

  const layout = [
    {
      i: "hierarchy",
      x: 0,
      y: 0,
      w: 12,
      h: 8,
    },
  ];

  return (
    <>
      {holder}
      <Layout className={styles.fullScreenLayout}>
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={95}
          containerPadding={[10, 10]}
          isDraggable={false}
        >
          <div key="hierarchy">
            <HierarchyEditor />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}
