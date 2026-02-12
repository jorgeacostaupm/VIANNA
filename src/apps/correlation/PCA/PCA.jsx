import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import Settings from "./Settings";
import ChartWithLegend from "@/components/charts/ChartWithLegend";
import usePCAPlot from "./usePCAPlot";
import usePCAData from "./usePCAData";
import ViewContainer from "@/components/charts/ViewContainer";

const defaultConfig = {
  isSync: true,
  pointSize: 2,
  pointOpacity: 0.75,
  showLegend: true,
  groupVar: null,
};

const defaultParams = {
  groupVar: null,
  variables: [],
  nTop: 10,
};

function Chart({ data, id, config }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  usePCAPlot({ chartRef, legendRef, data, config });

  return (
    <ChartWithLegend
      id={id}
      chartRef={chartRef}
      legendRef={legendRef}
      showLegend={config.showLegend}
    />
  );
}

export default function PCA({ id, remove }) {
  const groupVar = useSelector((s) => s.correlation.groupVar);
  const [config, setConfig] = useState(defaultConfig);
  const [params, setParams] = useState(defaultParams);
  const [info, setInfo] = useState(null);
  const [data] = usePCAData(config.isSync, params, setInfo);

  useEffect(() => {
    setConfig((prev) =>
      prev.groupVar === groupVar ? prev : { ...prev, groupVar }
    );
  }, [groupVar]);

  const chart = useMemo(() => {
    return <Chart data={data} config={config} id={id} />;
  }, [config, data]);

  return (
    <ViewContainer
      title={`PCA · ${params.variables.length} Variables`}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={
        <Settings
          info={info}
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
        />
      }
      chart={chart}
      config={config}
      setConfig={setConfig}
      info={info}
    />
  );
}
