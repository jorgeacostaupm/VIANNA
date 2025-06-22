import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import Panel from "./Panel";
import Distributions from "./Distributions";
import CategoricDistributions from "./CategoricDistributions";
import PointRange from "./PointRange";
import Pairwise from "./Pairwise";
import Ranking from "./Ranking";
import tests from "@/utils/tests";

import { setInit, setSelectedVar } from "@/features/compare/compareSlice";

import { Apps } from "@/utils/Constants";
import { useNotification } from "@/utils/cantabAppHooks";
import useRootStyles from "@/utils/useRootStyles";

import { pubsub } from "@/utils/pubsub";
import {
  selectVars,
  selectCategoricalVars,
} from "@/features/cantab/cantabSlice";
import { VariableTypes } from "@/utils/Constants";
import styles from "@/utils/App.module.css";

const { publish } = pubsub;
const wideCharts = ["ranking", "distribution", "categoric-distribution"];
const ResponsiveGridLayout = WidthProvider(GridLayout);

function App() {
  const categoricalVars = useSelector(selectCategoricalVars);

  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const createView = useCallback((type, props) => {
    const id = `${type}-${Date.now()}`;
    const defaultW = wideCharts.includes(type) ? 12 : 6;
    const defaultH = 4;

    setViews((prev) => [{ id, type, ...props }, ...prev]);

    setLayout((prev) => [
      {
        i: id,
        x: type === "means" ? 6 : 0,
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

  const generateDistribution = (variable) => {
    if (categoricalVars.includes(variable))
      createView("categoric-distribution", { variable });
    else createView("distribution", { variable });
  };

  const generateTest = (test, variable) => {
    const testObj = tests.find((t) => t.label === test);
    const props = { variable, test };
    createView("pairwise", props);
    if (testObj.variableType === VariableTypes.NUMERICAL)
      createView("means", props);
  };
  const generateRanking = (test) => createView("ranking", { test });

  return (
    <Layout className={styles.fullscreenLayout}>
      <Panel
        generateDistribution={generateDistribution}
        generateTest={generateTest}
        generateRanking={generateRanking}
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
            {v.type === "means" && (
              <PointRange {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "pairwise" && (
              <Pairwise {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "distribution" && (
              <Distributions {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "categoric-distribution" && (
              <CategoricDistributions {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "ranking" && (
              <Ranking {...v} remove={() => removeView(v.id)} />
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Layout>
  );
}

export default function ComparisonApp() {
  const [apiNotif, holder] = notification.useNotification();

  const groupVar = useSelector((s) => s.cantab.groupVar);
  const navioCols = useSelector((s) => s.dataframe.navioColumns);

  useRootStyles({ padding: 0, maxWidth: "100vw" }, setInit, Apps.COMPARE);
  useNotification(apiNotif);

  useEffect(() => {
    let config = null;
    if (!navioCols) {
      config = {};
    } else if (groupVar && !navioCols.includes(groupVar)) {
      config = {
        message: "Invalid grouping variable",
        description: "Please select a different group variable.",
        type: "warning",
      };
    }
    if (config?.message) publish("notification", config);
  }, [groupVar, navioCols]);

  return (
    <>
      {holder}
      <App />
    </>
  );
}
