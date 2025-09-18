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
import useNotification from "@/utils/useNotification";
import useRootStyles from "@/utils/useRootStyles";
import { navioLabelHeight, APP_NAME, Apps } from "@/utils/Constants";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";

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

const Quarantine = () => {
  const dt = useSelector((state) => state.cantab.quarantineData, shallowEqual);
  const config = useSelector((state) => state.dataframe.config);

  return (
    <div className={styles.viewContainer}>
      <QuarantineBar title="Quarantine" config={config} setConfig={() => {}} />

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
