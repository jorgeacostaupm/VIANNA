import React from "react";

import AppBar from "@/utils/AppBar";
import styles from "@/utils/App.module.css";
import VariableSelector from "./PanelItems/VariableSelector";
import AssumptionsTags from "./PanelItems/AssumptionsTags";
import TestSelector from "./PanelItems/TestSelector";

export default function Panel({
  generateDistribution,
  generateTest,
  generateRanking,
}) {
  return (
    <AppBar title="COMPARISON">
      <div className={styles.panelBox}>
        <VariableSelector generateDistribution={generateDistribution} />
        <AssumptionsTags />
      </div>

      <div className={styles.panelBox}>
        <TestSelector
          generateTest={generateTest}
          generateRanking={generateRanking}
        />
      </div>
    </AppBar>
  );
}
