import React, { useState, useMemo } from "react";

import { getDistributionData as getData } from "@/utils/functionsCompare";
import ViewContainer from "@/components/charts/ViewContainer";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import { Density, Histogram } from "./charts";
import Settings from "./Settings";
import Boxplot from "./charts/Boxplot/Boxplot";
import Vilonplot from "./charts/Violinplot/Violinplot";
import { isFiniteNumericValue } from "@/utils/viewRecords";
import useDistributionViewState from "../useDistributionViewState";

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
  showGroupCountInLegend: true,
  showGroupCountInAxis: true,
  scaleDensityStrokeByGroupSize: true,
  axisLabelFontSize: 16,
};

const chartStrategies = {
  density: Density,
  violin: Vilonplot,
  box: Boxplot,
  histogram: Histogram,
};

const isNumericRowValid = ({ row, groupVar, variable }) => {
  const groupValue = row?.[groupVar];
  const value = row?.[variable];
  return groupValue != null && isFiniteNumericValue(value);
};

const info = "";

export default function Numeric({ id, variable, remove, sourceOrderValues = [] }) {
  const [config, setConfig] = useState(defaultConfig);

  const { data, requiredVariables, recordOrders, variableDescription } =
    useDistributionViewState({
      variable,
      sourceOrderValues,
      isSync: config.isSync,
      getData,
      isRowValid: isNumericRowValid,
    });

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return <NoDataPlaceholder />;
    }

    const ChartComponent = chartStrategies[config.chartType] ?? Histogram;
    return <ChartComponent data={data} config={config} id={id} />;
  }, [config, data, id]);

  return (
    <ViewContainer
      title={`Distribution · ${variable}`}
      hoverTitle={variableDescription || undefined}
      svgIDs={[id, `${id}-legend`]}
      info={info}
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
