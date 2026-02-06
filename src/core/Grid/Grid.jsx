import GridLayout, { WidthProvider } from "react-grid-layout";
import styles from "@/styles/App.module.css";
import { Layout } from "antd";
import useNotification from "@/hooks/useNotification";
import useRootStyles from "@/hooks/useRootStyles";
import useGridViews from "./useGridViews";
import { createViewRenderer } from "./ViewRegistry";
import { APP_NAME } from "@/utils/Constants";

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function Grid({ registry, panel, setInit, componentName }) {
  const holder = useNotification();
  useRootStyles(setInit, APP_NAME + " - " + componentName);
  const { views, layout, setLayout, addView, removeView } = useGridViews();

  const renderView = createViewRenderer(registry, removeView);

  return (
    <>
      {holder}
      <Layout className={styles.fullScreenLayout}>
        {panel && panel(addView)}
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          onLayoutChange={setLayout}
          cols={12}
          rowHeight={100}
          draggableHandle=".drag-handle"
          containerPadding={[10, 10]}
        >
          {views.map(renderView)}
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}
