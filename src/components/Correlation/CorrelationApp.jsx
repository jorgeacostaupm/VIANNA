import React, { useEffect, useState, useCallback, useMemo } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { useSelector, useDispatch } from "react-redux";
import { Layout, notification } from "antd";

import { setSelectedChart } from "@/features/correlation/correlationSlice";
import { setInit } from "@/features/correlation/correlationSlice";

import { Apps, Graphs, APP_NAME } from "@/utils/Constants";
import { pubsub } from "@/utils/pubsub";
import useNotification from "@/utils/useNotification";
import useRootStyles from "@/utils/useRootStyles";
import Panel from "./Panel";
import Scatterplot from "./Scatterplot";
import Correlation from "./Correlation";
import PCA from "./PCA";
import UMAP from "./UMAP";
import styles from "@/utils/App.module.css";

const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

function App() {
  const dispatch = useDispatch();
  const selectedChart = useSelector((s) => s.correlation.selectedChart);

  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const createView = useCallback((type) => {
    const id = `${type}-${Date.now()}`;
    const defaultW = 5;
    const defaultH = 7;

    setViews((prev) => [{ id, type }, ...prev]);

    setLayout((prev) => [
      {
        i: id,
        x: 0,
        y: 0,
        w: defaultW,
        h: defaultH,
      },
      ...prev.map((l) => ({ ...l, y: l.y + defaultH })),
    ]);
  }, []);

  const removeView = useCallback((id) => {
    setViews((prev) => prev.filter((v) => v.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  function generateGraph(selectedVar) {
    createView(selectedVar);
  }

  return (
    <Layout className={styles.fullScreenLayout}>
      <Panel
        selectedVar={selectedChart}
        onVarChange={(v) => dispatch(setSelectedChart(v))}
        generateGraph={generateGraph}
      />

      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={setLayout}
        cols={12}
        rowHeight={100}
        draggableHandle=".drag-handle"
        containerPadding={[10, 10]}
      >
        {views.map((v) => (
          <div key={v.id}>
            {v.type === Graphs.SCATTER && (
              <Scatterplot remove={() => removeView(v.id)} />
            )}
            {v.type === Graphs.CORRELATION && (
              <Correlation remove={() => removeView(v.id)} />
            )}
            {v.type === Graphs.PCA && <PCA remove={() => removeView(v.id)} />}
            {v.type === Graphs.UMAP && <UMAP remove={() => removeView(v.id)} />}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Layout>
  );
}

export default function CorrelationApp() {
  const groupVar = useSelector((s) => s.cantab.groupVar);
  const selection = useSelector((state) => state.dataframe.selection);
  const navioCols = useSelector((s) => s.dataframe.navioColumns);

  useRootStyles(setInit, APP_NAME + " - " + Apps.CORRELATION);
  const holder = useNotification();

  useEffect(() => {
    let config = null;
    if (!groupVar || !selection || !navioCols) {
      config = {};
    }
    if (config?.message) publish("notification", config);
  }, [groupVar, selection, navioCols]);

  return (
    <>
      {holder}
      <App />
    </>
  );
}
