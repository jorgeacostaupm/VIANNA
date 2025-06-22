import React from "react";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useNotification } from "@/utils/cantabAppHooks";
import HierarchyEditor from "./HierarchyEditor";
import styles from "@/utils/App.module.css";

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function HierarchyApp() {
  const [apiNotif, contextHolder] = notification.useNotification();

  useNotification(apiNotif);

  const layout = [
    {
      i: "hierarchy",
      x: 0,
      y: 0,
      w: 12,
      h: 12,
    },
  ];

  return (
    <>
      {contextHolder}
      <Layout className={styles.fullscreenLayout}>
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={95}
          containerPadding={[10, 10]}
          draggableHandle=".drag-handle"
        >
          <div key="hierarchy">
            <HierarchyEditor />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}
