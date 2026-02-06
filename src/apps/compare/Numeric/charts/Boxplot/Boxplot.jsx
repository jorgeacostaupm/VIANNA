import { useRef } from "react";

import useBoxplot from "./useBoxplot";
import ChartWithLegend from "@/components/charts/ChartWithLegend";

export default function Boxplot({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useBoxplot({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}
