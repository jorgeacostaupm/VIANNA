import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Layout } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import AppBar from "@/components/ui/AppBar";
import styles from "@/styles/App.module.css";
import useRootStyles from "@/hooks/useRootStyles";
import useNotification from "@/hooks/useNotification";
import { APP_NAME, APP_DESC } from "@/utils/Constants";

import { setInit } from "@/store/slices/cantabSlice";

import Explorer from "../explorer";
import loadTestData from "./loadTestData";
import AppsButtons from "./AppsButtons";

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
            <Explorer />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}
