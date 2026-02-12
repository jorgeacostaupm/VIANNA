import React, { useState, useMemo } from "react";

import { getDistributionData as getData } from "@/utils/functionsCompare";
import useDistributionData from "./useDistributionData";
import ViewContainer from "@/components/charts/ViewContainer";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import { Density, Histogram } from "./charts";
import Settings from "./Settings";
import Boxplot from "./charts/Boxplot/Boxplot";
import Vilonplot from "./charts/Violinplot/Violinplot";

const defaultConfig = {
  chartType: "box",
  isSync: true,
  showLegend: false,
  showGrid: true,
  useCustomRange: false,
  range: [null, null],
  nPoints: 30,
  margin: 0.5,
  xForce: 0.05,
  yForce: 1.0,
  collideForce: 0.8,
  alpha: 0.8,
  alphaDecay: 0.2,
  timeout: 500,
  pointSize: 3,
  showPoints: false,
};
const info = "";

export default function Numeric({ id, variable, remove }) {
  const [config, setConfig] = useState(defaultConfig);
  const [data] = useDistributionData(getData, variable, config.isSync);

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return <NoDataPlaceholder />;
    } else if (config.chartType === "density") {
      return <Density data={data} config={config} id={id} />;
    } else if (config.chartType === "violin") {
      return <Vilonplot data={data} config={config} id={id} />;
    } else if (config.chartType === "box") {
      return <Boxplot data={data} config={config} id={id} />;
    } else {
      return <Histogram data={data} config={config} id={id} />;
    }
  }, [config, data]);

  return (
    <ViewContainer
      title={`Distribution · ${variable}`}
      svgIDs={[id, `${id}-legend`]}
      info={info}
      remove={remove}
      settings={<Settings config={config} setConfig={setConfig} />}
      chart={chart}
      config={config}
      setConfig={setConfig}
    />
  );
}
