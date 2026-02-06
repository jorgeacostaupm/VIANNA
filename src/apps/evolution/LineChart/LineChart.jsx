import React, { useState, useMemo, useRef, useEffect } from "react";

import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import Settings from "./Settings";

import useLineChart from "./useLineChart";
import useEvolutionData from "./useLineChartData";
import ChartWithLegend from "@/components/charts/ChartWithLegend";
import ViewContainer from "@/components/charts/ViewContainer";
import EvolutionTestsInfo from "./EvolutionTestsInfo";

const defaultConfig = {
  isSync: true,
  showObs: false,
  showMeans: true,
  showStds: false,
  showCIs: false,
  showComplete: true,
  showLegend: true,
  showGrid: true,
  meanPointSize: 8,
  subjectPointSize: 3,
  meanStrokeWidth: 5,
  subjectStrokeWidth: 1,
  testIds: ["rm-anova"],
  testTimeFrom: null,
  testTimeTo: null,
};

function Chart({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useLineChart({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}

export default function LineChart({ id, variable, remove }) {
  const [config, setConfig] = useState(defaultConfig);
  const timeRange = {
    from: config.testTimeFrom,
    to: config.testTimeTo,
  };

  const [data] = useEvolutionData(
    variable,
    config.isSync,
    config.showComplete,
    config.testIds,
    timeRange
  );

  const availableTimes = (data?.times || []).map((t) => String(t));

  useEffect(() => {
    if (!availableTimes.length) return;
    setConfig((prev) => {
      let from = prev.testTimeFrom;
      let to = prev.testTimeTo;
      if (!availableTimes.includes(from)) from = availableTimes[0];
      if (!availableTimes.includes(to))
        to = availableTimes[availableTimes.length - 1];
      if (from === to && availableTimes.length > 1) {
        to = availableTimes.find((t) => t !== from) ?? to;
      }
      if (from === prev.testTimeFrom && to === prev.testTimeTo) return prev;
      return { ...prev, testTimeFrom: from, testTimeTo: to };
    });
  }, [availableTimes.join("|")]);

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return <NoDataPlaceholder />;
    } else {
      return <Chart data={data} config={config} id={id} />;
    }
  }, [config, data]);

  return (
    <ViewContainer
      title={`Evolution - ${variable}`}
      svgIDs={[id, `${id}-legend`]}
      info={
        data?.tests?.length ? <EvolutionTestsInfo tests={data.tests} /> : null
      }
      remove={remove}
      settings={
        <Settings
          config={config}
          setConfig={setConfig}
          availableTimes={availableTimes}
        />
      }
      chart={chart}
      config={config}
      setConfig={setConfig}
    />
  );
}
