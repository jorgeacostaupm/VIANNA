import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useRootStyle, useNotification } from "@/utils/cantabAppHooks";
import AppBar from "@/utils/AppBar";
import Buttons from "./Buttons";
import OverviewApp from "./Overview/OverviewApp";
import { pubsub } from "@/utils/pubsub";
import styles from "@/utils/App.module.css";

const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

const layout = [{ i: "overview", x: 0, y: 0, w: 12, h: 10 }];

export default function App() {
  const dispatch = useDispatch();
  const [apiNotif, contextHolder] = notification.useNotification();

  useRootStyle();
  useNotification(apiNotif);

  useEffect(() => {
    loadTestData(dispatch);
  }, [dispatch]);

  return (
    <>
      {contextHolder}
      <Layout className={styles.fullscreenLayout}>
        <AppBar title="EXPLORER">
          <Buttons />
        </AppBar>

        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={105}
          isDraggable={false}
        >
          <div key={"overview"}>
            <OverviewApp />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}

// TEST DATA LOADING
import { updateData } from "@/features/data/dataSlice";
import { updateHierarchy } from "@/features/metadata/metaSlice";
import * as api from "@/utils/cantabAppServices";
import {
  setGroupVar,
  setIdVar,
  setTimeVar,
} from "../features/cantab/cantabSlice";

async function loadTestData(dispatch) {
  try {
    const shortTestData = "./vis/csv/full_data.csv";
    const longTestData = "./vis/csv/largeTestData.csv";
    const financial = "./vis/csv/financial.xls";
    const data = await api.fetchTestData(longTestData);
    await dispatch(
      updateData({ data, isGenerateHierarchy: true, filename: "Test data" })
    );

    const largeHierrachy = "./vis/hierarchies/largeTestDatahierarchy.json";
    const financialHierarchy = "./vis/hierarchies/financialHierarchy.json";
    const hierarchy = await api.fetchHierarchy(largeHierrachy);
    await dispatch(updateHierarchy({ hierarchy, filename: "Test Hierarchy" }));

    dispatch(setGroupVar("Country"));
    dispatch(setTimeVar("Visit Name"));
    dispatch(setIdVar("id"));
  } catch (error) {
    handleError(error, "Error loading test data");
  }
}

function handleError(error, message) {
  console.error(message, error);
  publish("notification", {
    message,
    description: error.message,
    type: "error",
  });
}
