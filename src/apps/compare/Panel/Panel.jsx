import React from "react";

import AppBar from "@/components/ui/AppBar";
import styles from "@/styles/App.module.css";
import VariableSelector from "./VariableSelector";
import AssumptionsTags from "./AssumptionsTags";
import TestSelector from "./TestSelector";
import { COMP_DESC } from "@/utils/Constants";

export default function Panel({
  generateDistribution,
  generateTest,
  generateRanking,
}) {
  return (
    <AppBar description={COMP_DESC}>
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
