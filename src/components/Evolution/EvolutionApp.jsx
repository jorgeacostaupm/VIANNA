import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, notification } from "antd";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import GridLayout, { WidthProvider } from "react-grid-layout";

import useNotification from "@/utils/useNotification";
import useRootStyles from "@/utils/useRootStyles";
import { setInit } from "@/features/evolution/evolutionSlice";
import Ranking from "./Ranking";
import Evolutions from "./Evolutions";
import Panel from "./Panel";
import { pubsub } from "@/utils/pubsub";

import styles from "@/utils/App.module.css";
import { APP_NAME, Apps } from "@/utils/Constants";

const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

function App() {
  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const addView = (type, props) => {
    const id = `${type}-${Date.now()}`;
    const defaultW = 12;
    const defaultH = 4;

    setViews((prev) => [{ id, type, ...props }, ...prev]);

    setLayout((prev) => {
      const newLayout = [
        {
          i: id,
          x: 0,
          y: 4,
          w: defaultW,
          h: defaultH,
        },
        ...prev.map((l) => ({
          ...l,
          y: l.y + defaultH,
        })),
      ];
      return newLayout;
    });
  };

  const removeView = useCallback((id) => {
    setViews((prev) => prev.filter((v) => v.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  function generateEvolution(variable) {
    addView("evolution", {
      variable,
    });
  }

  return (
    <Layout className={styles.fullScreenLayout}>
      <Panel generateEvolution={generateEvolution} />

      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        cols={12}
        rowHeight={100}
        draggableHandle=".drag-handle"
        containerPadding={[10, 10]}
      >
        {views.map((v) => (
          <div key={v.id}>
            {v.type === "evolution" && (
              <Evolutions {...v} remove={() => removeView(v.id)} />
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

export default function EvolutionApp() {
  const groupVar = useSelector((s) => s.cantab.groupVar);
  const timeVar = useSelector((s) => s.cantab.timeVar);
  const navioCols = useSelector((s) => s.dataframe.navioColumns);

  useRootStyles(setInit, APP_NAME + " - " + Apps.EVOLUTION);
  const holder = useNotification();

  useEffect(() => {
    let config = null;
    if (!groupVar || !timeVar || !navioCols) {
      config = {};
    } else if (!navioCols.includes(groupVar)) {
      config = {
        message: "Invalid grouping/timestamp/id variable",
        description: "Please select a different grouping variable.",
        type: "error",
      };
    }
    if (config?.message) publish("notification", config);
  }, [groupVar, timeVar, navioCols]);

  return (
    <>
      {holder}
      <App />
    </>
  );
}
