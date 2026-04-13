import React from "react";

import AnalysisSidebar from "@/components/ui/AnalysisSidebar";
import AnalysisPanelSection from "@/components/ui/AnalysisPanelSection";
import VariableSelector from "./VariableSelector";
import AssumptionsTags from "./AssumptionsTags";
import TestSelector from "./TestSelector";
import ContextSelector from "./ContextSelector";
import { COMP_DESC } from "@/utils/constants";

export default function Panel({
  generateDistribution,
  generateTest,
  generateRanking,
}) {
  return (
    <AnalysisSidebar description={COMP_DESC}>
      <AnalysisPanelSection title="Analysis Context" variant="context">
        <ContextSelector />
      </AnalysisPanelSection>

      <AnalysisPanelSection title="Distribution">
        <VariableSelector generateDistribution={generateDistribution} />
        <AssumptionsTags />
      </AnalysisPanelSection>

      <AnalysisPanelSection title="Statistical Tests">
        <TestSelector
          generateTest={generateTest}
          generateRanking={generateRanking}
        />
      </AnalysisPanelSection>
    </AnalysisSidebar>
  );
}
