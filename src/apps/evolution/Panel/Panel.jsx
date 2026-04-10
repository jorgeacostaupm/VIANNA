import React from "react";

import AnalysisSidebar from "@/components/ui/AnalysisSidebar";
import AnalysisPanelSection from "@/components/ui/AnalysisPanelSection";
import VariableSelector from "./VariableSelector";
import ContextSelector from "./ContextSelector";
import { EVO_DESC } from "@/utils/Constants";

export default function Panel(props) {
  const { generateEvolution } = props;

  return (
    <AnalysisSidebar description={EVO_DESC}>
      <AnalysisPanelSection title="Analysis Context" variant="context">
        <ContextSelector />
      </AnalysisPanelSection>

      <AnalysisPanelSection title="Evolution Variable">
        <VariableSelector generateEvolution={generateEvolution} />
      </AnalysisPanelSection>
    </AnalysisSidebar>
  );
}
