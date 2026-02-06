import { useRef } from "react";

import useHistogram from "./useHistogram";
import ChartWithLegend from "@/components/charts/ChartWithLegend";

export default function Histogram({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useHistogram({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}
