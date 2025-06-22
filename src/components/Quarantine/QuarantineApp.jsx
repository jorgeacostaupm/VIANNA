import React, { useState, useMemo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import styles from "@/utils/Charts.module.css";
import {
  setQuarantineSelection,
  setInitQuarantine,
} from "@/features/cantab/cantabSlice";
import Overview from "../Overview/Overview";
import QuarantineBar from "./QuarantineBar";
import { useNotification } from "@/utils/cantabAppHooks";
import useRootStyles from "@/utils/useRootStyles";
import { Apps } from "@/utils/Constants";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import { navioLabelHeight } from "../../utils/Constants";

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
  const [apiNotif, contextHolder] = notification.useNotification();

  useNotification(apiNotif);
  useRootStyles(
    { padding: 0, maxWidth: "100vw" },
    setInitQuarantine,
    "Quarantine"
  );

  return (
    <>
      {contextHolder}
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

const Quarantine = () => {
  const dt = useSelector((state) => state.cantab.quarantineData, shallowEqual);

  const [config, setConfig] = useState({ attrWidth: 30, y0: navioLabelHeight });

  return (
    <div className={styles.viewContainer}>
      <QuarantineBar title="Quarantine" config={config} setConfig={setConfig} />

      {dt && dt.length > 0 ? (
        <Overview
          config={config}
          data={dt}
          setSelection={setQuarantineSelection}
        />
      ) : (
        <NoDataPlaceholder message="No quarantine data available"></NoDataPlaceholder>
      )}
    </div>
  );
};
