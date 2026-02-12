import React, { useState } from "react";
import { Layout, Popover } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import HierarchyEditor from "./editor/HierarchyEditor";
import styles from "@/styles/App.module.css";
import { Apps, APP_NAME, HIER_DESC } from "@/utils/Constants";
import { setInit } from "@/store/slices/metaSlice";
import useRootStyles from "@/hooks/useRootStyles";
import useNotification from "@/hooks/useNotification";
import AppsButtons from "./AppsButtons";
const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function HierarchyApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  useRootStyles(setInit, APP_NAME + " · " + Apps.HIERARCHY);
  const holder = useNotification();

  const layout = [
    {
      i: "hierarchy",
      x: 0,
      y: 0,
      w: 12,
      h: 8,
    },
  ];

  const logoSrc = "./app_name.svg";
  const mainContentClassName = [
    styles.mainAppContent,
    isSidebarOpen
      ? styles.mainAppContentWithSidebar
      : styles.mainAppContentWithoutSidebar,
  ].join(" ");
  const mainSidebarClassName = [
    styles.mainSidebar,
    isSidebarOpen ? styles.mainSidebarOpen : styles.mainSidebarClosed,
  ].join(" ");

  return (
    <>
      {holder}
      <Layout className={styles.fullScreenLayout}>
        <div className={styles.mainSidebarContainer}>
          <aside className={mainSidebarClassName}>
            <Popover
              content={<div className={styles.appBarPopoverContent}>{HIER_DESC}</div>}
              trigger="hover"
              placement="rightTop"
            >
              <img
                src={logoSrc}
                alt="VIANNA"
                className={`${styles.appBarLogo} ${styles.mainSidebarLogo}`}
              />
            </Popover>

            <div className={styles.mainSidebarControls}>
              <AppsButtons />
            </div>

            <button
              type="button"
              className={styles.mainSidebarHideButton}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Hide hierarchy sidebar"
            >
              <MenuFoldOutlined />
            </button>
          </aside>

          {!isSidebarOpen && (
            <button
              type="button"
              className={styles.mainSidebarShowButton}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Show hierarchy sidebar"
            >
              <MenuUnfoldOutlined />
            </button>
          )}
        </div>

        <div className={mainContentClassName}>
          <ResponsiveGridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={95}
            containerPadding={[10, 10]}
            isDraggable={false}
          >
            <div key="hierarchy">
              <HierarchyEditor />
            </div>
          </ResponsiveGridLayout>
        </div>
      </Layout>
    </>
  );
}
