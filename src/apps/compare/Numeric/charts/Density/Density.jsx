import { useRef } from "react";

import useDensity from "./useDensity";
import ChartWithLegend from "@/components/charts/ChartWithLegend";

export default function Density({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useDensity({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}
