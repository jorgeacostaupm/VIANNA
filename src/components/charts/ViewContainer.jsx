import React from "react";
import ChartBar from "@/components/charts/ChartBar";
import styles from "@/styles/Charts.module.css";

export default function ViewContainer({
  title,
  svgIDs,
  info,
  settings,
  chart,
  remove,
  config,
  setConfig,
}) {
  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={title}
        info={info}
        svgIDs={svgIDs}
        remove={remove}
        settings={settings}
        config={config}
        setConfig={setConfig}
      />
      {chart}
    </div>
  );
}
