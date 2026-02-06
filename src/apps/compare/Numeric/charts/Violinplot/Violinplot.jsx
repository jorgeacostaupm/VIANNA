import { useRef } from "react";

import useViolinplot from "./useViolinplot";
import ChartWithLegend from "@/components/charts/ChartWithLegend";

export default function Vilonplot({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useViolinplot({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}
