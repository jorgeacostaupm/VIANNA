import { useRef } from "react";

import useGroupedBarChart from "./useGroupedBarChart";
import ChartWithLegend from "@/components/charts/ChartWithLegend";

export default function GroupedBarChart({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useGroupedBarChart({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}
