import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import Settings from "./Settings";
import useScatter from "./useScatter";
import useScatterData from "./useScatterData";
import ViewContainer from "@/components/charts/ViewContainer";
import ChartWithLegend from "@/components/charts/ChartWithLegend";

function Chart({ data, id, config }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useScatter({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}

export default function ScatterMatrix({ id, remove }) {
  const groupVar = useSelector((s) => s.correlation.groupVar);

  const [config, setConfig] = useState({
    isSync: true,
    pointSize: 4,
    pointOpacity: 0.75,
    groupVar: groupVar,
    variables: [],
    showLegend: true,
  });

  useEffect(() => {
    setConfig((prev) =>
      prev.groupVar === groupVar ? prev : { ...prev, groupVar }
    );
  }, [groupVar]);

  const [data] = useScatterData(config.isSync, config);

  const chart = useMemo(() => {
    return <Chart data={data} config={config} id={id} />;
  }, [config, data]);

  return (
    <ViewContainer
      title={`Scatter Plot Matrix`}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={<Settings config={config} setConfig={setConfig} />}
      chart={chart}
      config={config}
      setConfig={setConfig}
    />
  );
}
