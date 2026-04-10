import React, { useState, useMemo } from "react";

import { getCategoricDistributionData as getData } from "@/utils/functionsCompare";
import ViewContainer from "@/components/charts/ViewContainer";
import { GroupedBarChart, StackedBarChart } from "./charts";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import Settings from "./Settings";
import useDistributionViewState from "../useDistributionViewState";

const defaultConfig = {
  isSync: true,
  chartType: "stacked",
  stackedMode: "total",
  showLegend: true,
  showGrid: true,
  groupOrder: "alpha",
  categoryOrder: "alpha",
  axisLabelFontSize: 16,
};

const chartStrategies = {
  stacked: StackedBarChart,
  grouped: GroupedBarChart,
};

const isCategoricRowValid = ({ row, groupVar, variable }) => {
  const groupValue = row?.[groupVar];
  const categoryValue = row?.[variable];
  return groupValue != null && categoryValue != null;
};

export default function Categoric({
  id,
  variable,
  remove,
  sourceOrderValues = [],
}) {
  const [config, setConfig] = useState(defaultConfig);

  const { data, requiredVariables, recordOrders, variableDescription } =
    useDistributionViewState({
      variable,
      sourceOrderValues,
      isSync: config.isSync,
      getData,
      isRowValid: isCategoricRowValid,
    });

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return <NoDataPlaceholder />;
    }

    const ChartComponent = chartStrategies[config.chartType] ?? GroupedBarChart;
    return <ChartComponent data={data} config={config} id={id} />;
  }, [config, data, id]);

  return (
    <ViewContainer
      title={`Distribution · ${variable}`}
      hoverTitle={variableDescription || undefined}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={<Settings config={config} setConfig={setConfig} />}
      chart={chart}
      config={config}
      setConfig={setConfig}
      recordsExport={{
        filename: `distribution_${variable || "view"}`,
        recordOrders,
        requiredVariables,
      }}
    />
  );
}
