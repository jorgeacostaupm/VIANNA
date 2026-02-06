import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Layout } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import useNotification from "@/hooks/useNotification";
import AppBar from "@/components/ui/AppBar";
import AppsButtons from "./AppsButtons";
import OverviewApp from "./old/Overview/OverviewApp";
import { pubsub } from "@/utils/pubsub";
import styles from "@/styles/App.module.css";
import { setInit } from "@/store/slices/cantabSlice";
import { APP_NAME, APP_DESC } from "@/utils/Constants";

const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

const layout = [{ i: "explorer", x: 0, y: 0, w: 12, h: 7 }];

export default function MainApp() {
  const dispatch = useDispatch();

  useRootStyles(setInit, APP_NAME);
  const holder = useNotification();

  useEffect(() => {
    loadTestData(dispatch);
  }, [dispatch]);

  return (
    <>
      {holder}
      <Layout className={styles.fullScreenLayout}>
        <AppBar description={APP_DESC}>
          <AppsButtons />
        </AppBar>

        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={100}
          isDraggable={false}
        >
          <div key={"explorer"}>
            <OverviewApp />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}

const idVar = "id";
const groupVar = "Country";
const timeVar = "Visit Name";

const shortData = "./vis/csv/full_data.csv";
const largeData = "./vis/csv/largeTestData.csv";
const financial = "./vis/csv/financial.xls";
const realData = "./vis/csv/realData.csv";

const largeHierarchy = "./vis/hierarchies/largeTestDatahierarchy.json";
const financialHierarchy = "./vis/hierarchies/financialHierarchy.json";
const realDataHierarchy = "./vis/hierarchies/realData.json";

const hierarchyFile = largeHierarchy;
const dataFile = largeData;

// TEST DATA LOADING
import { updateData } from "@/store/slices/dataSlice";
import { updateHierarchy } from "@/store/async/metaAsyncReducers";
import * as api from "@/services/cantabAppServices";
import { setGroupVar, setIdVar, setTimeVar } from "../store/slices/cantabSlice";
import useRootStyles from "@/hooks/useRootStyles";

async function loadTestData(dispatch) {
  try {
    let data = await api.fetchTestData(dataFile);

    await dispatch(
      updateData({ data, isGenerateHierarchy: true, filename: "Test data" })
    );

    let hierarchy = await api.fetchHierarchy(hierarchyFile);
    await dispatch(updateHierarchy({ hierarchy, filename: "Test Hierarchy" }));

    dispatch(setIdVar(idVar));
    dispatch(setGroupVar(groupVar));
    dispatch(setTimeVar(timeVar));
  } catch (error) {
    publish("notification", {
      message: "Error Loading Test Data",
      description: error.message,
      type: "error",
    });
  }
}
