import React, { useState, useMemo, useRef } from "react";

import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import Settings from "./Settings";

import useLineChart from "./useLineChart";
import useEvolutionData from "./useLineChartData";
import ChartWithLegend from "@/utils/ChartWithLegend";
import ViewContainer from "@/utils/ViewContainer";

const defaultConfig = {
  isSync: true,
  showObs: false,
  showMeans: true,
  showStds: false,
  showCIs: false,
  meanPointSize: 5,
  subjectPointSize: 3,
  meanStrokeWidth: 3,
  subjectStrokeWidth: 1,
};

function Chart({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useLineChart({ chartRef, legendRef, data, config });

  return <ChartWithLegend id={id} chartRef={chartRef} legendRef={legendRef} />;
}

export default function LineChart({ id, variable, remove }) {
  const [config, setConfig] = useState(defaultConfig);
  const [data] = useEvolutionData(variable, config.isSync);

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return <NoDataPlaceholder />;
    } else {
      return <Chart data={data} config={config} id={id} />;
    }
  }, [config, data]);

  return (
    <ViewContainer
      title={`${variable} - Distribution`}
      svgIDs={[id, `${id}-legend`]}
      info={data?.rmAnova?.html}
      remove={remove}
      settings={<Settings config={config} setConfig={setConfig} />}
      chart={chart}
      config={config}
      setConfig={setConfig}
    />
  );
}
