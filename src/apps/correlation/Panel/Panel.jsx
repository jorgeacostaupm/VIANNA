import React from "react";

import AnalysisSidebar from "@/components/ui/AnalysisSidebar";
import AnalysisPanelSection from "@/components/ui/AnalysisPanelSection";
import ChartSelector from "./ChartSelector";
import ContextSelector from "./ContextSelector";
import { CORR_DESC } from "@/utils/Constants";

export default function Panel({ commands }) {
  const { addChart } = commands;

  return (
    <AnalysisSidebar description={CORR_DESC}>
      <AnalysisPanelSection title="Analysis Context" variant="context">
        <ContextSelector />
      </AnalysisPanelSection>

      <AnalysisPanelSection title="Chart Selection">
        <ChartSelector onAddChart={addChart} />
      </AnalysisPanelSection>
    </AnalysisSidebar>
  );
}
