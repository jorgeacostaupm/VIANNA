import React from "react";
import { Layout } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { setInitQuarantine } from "@/store/slices/cantabSlice";
import Quarantine from "./Quarantine";

import useNotification from "@/hooks/useNotification";
import useRootStyles from "@/hooks/useRootStyles";
import { APP_NAME, Apps } from "@/utils/Constants";

const ResponsiveGridLayout = WidthProvider(GridLayout);
const layout = [
  {
    i: "quarantine",
    x: 0,
    y: 0,
    w: 12,
    h: 12,
  },
];

export default function QuarantineApp() {
  useRootStyles(setInitQuarantine, APP_NAME + " - " + Apps.QUARANTINE);
  const holder = useNotification();

  return (
    <>
      {holder}
      <Layout
        style={{
          height: "100vh",
          width: "100vw",
          background: "#f0f2f5",
          overflow: "auto",
        }}
      >
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={95}
          draggableHandle=".drag-handle"
          containerPadding={[10, 10]}
        >
          <div key="quarantine">
            <Quarantine />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}
