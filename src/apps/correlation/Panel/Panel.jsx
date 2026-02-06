import React from "react";

import AppBar from "@/components/ui/AppBar";
import ChartSelector from "./ChartSelector";
import { CORR_DESC } from "@/utils/Constants";

export default function Panel(props) {
  const { addView } = props;

  return (
    <AppBar description={CORR_DESC}>
      <ChartSelector addView={addView} />
    </AppBar>
  );
}
