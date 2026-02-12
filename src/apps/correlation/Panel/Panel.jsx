import React from "react";

import AnalysisSidebar from "@/components/ui/AnalysisSidebar";
import ChartSelector from "./ChartSelector";
import ContextSelector from "./ContextSelector";
import styles from "@/styles/App.module.css";
import { CORR_DESC } from "@/utils/Constants";

export default function Panel(props) {
  const { addView } = props;

  return (
    <AnalysisSidebar description={CORR_DESC}>
      <div className={`${styles.panelBox} ${styles.panelBoxContext}`}>
        <div className={styles.panelBoxTitle}>Analysis Context</div>
        <div className={styles.panelBoxBody}>
          <ContextSelector />
        </div>
      </div>

      <div className={styles.panelBox}>
        <div className={styles.panelBoxTitle}>Chart Selection</div>
        <div className={styles.panelBoxBody}>
          <ChartSelector addView={addView} />
        </div>
      </div>
    </AnalysisSidebar>
  );
}
