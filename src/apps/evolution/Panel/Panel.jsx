import React from "react";

import AnalysisSidebar from "@/components/ui/AnalysisSidebar";
import styles from "@/styles/App.module.css";
import VariableSelector from "./VariableSelector";
import ContextSelector from "./ContextSelector";
import { EVO_DESC } from "@/utils/Constants";

export default function Panel(props) {
  const { generateEvolution } = props;

  return (
    <AnalysisSidebar description={EVO_DESC}>
      <div className={`${styles.panelBox} ${styles.panelBoxContext}`}>
        <div className={styles.panelBoxTitle}>Analysis Context</div>
        <div className={styles.panelBoxBody}>
          <ContextSelector />
        </div>
      </div>

      <div className={styles.panelBox}>
        <div className={styles.panelBoxTitle}>Evolution Variable</div>
        <div className={styles.panelBoxBody}>
          <VariableSelector generateEvolution={generateEvolution} />
        </div>
      </div>
    </AnalysisSidebar>
  );
}
