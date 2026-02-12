import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { getCategoricDistributionData as getData } from "@/utils/functionsCompare";
import useDistributionData from "../Numeric/useDistributionData";
import ViewContainer from "@/components/charts/ViewContainer";
import { GroupedBarChart, StackedBarChart } from "./charts";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import Settings from "./Settings";

const defaultConfig = {
  isSync: true,
  chartType: "stacked",
  stackedMode: "total",
  showLegend: true,
  showGrid: true,
  groupOrder: "alpha",
  categoryOrder: "alpha",
};
const info = "Categorical Distribution plots, Grouped or Stacked bar chart";

export default function Categoric({ id, variable, remove }) {
  const groupVar = useSelector((s) => s.compare.groupVar);
  const [config, setConfig] = useState(defaultConfig);
  const [data] = useDistributionData(getData, variable, config.isSync, {
    groupVar,
  });

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return <NoDataPlaceholder />;
    } else if (config.chartType === "stacked") {
      return <StackedBarChart data={data} config={config} id={id} />;
    } else {
      return <GroupedBarChart data={data} config={config} id={id} />;
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
