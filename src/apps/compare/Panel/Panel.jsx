import React from "react";

import AnalysisSidebar from "@/components/ui/AnalysisSidebar";
import styles from "@/styles/App.module.css";
import VariableSelector from "./VariableSelector";
import AssumptionsTags from "./AssumptionsTags";
import TestSelector from "./TestSelector";
import ContextSelector from "./ContextSelector";
import { COMP_DESC } from "@/utils/Constants";

export default function Panel({
  generateDistribution,
  generateTest,
  generateRanking,
}) {
  return (
    <AnalysisSidebar description={COMP_DESC}>
      <div className={`${styles.panelBox} ${styles.panelBoxContext}`}>
        <div className={styles.panelBoxTitle}>Analysis Context</div>
        <div className={styles.panelBoxBody}>
          <ContextSelector />
        </div>
      </div>

      <div className={styles.panelBox}>
        <div className={styles.panelBoxTitle}>Distribution</div>
        <div className={styles.panelBoxBody}>
          <VariableSelector generateDistribution={generateDistribution} />
          <AssumptionsTags />
        </div>
      </div>

      <div className={styles.panelBox}>
        <div className={styles.panelBoxTitle}>Statistical Tests</div>
        <div className={styles.panelBoxBody}>
          <TestSelector
            generateTest={generateTest}
            generateRanking={generateRanking}
          />
        </div>
      </div>
    </AnalysisSidebar>
  );
}
