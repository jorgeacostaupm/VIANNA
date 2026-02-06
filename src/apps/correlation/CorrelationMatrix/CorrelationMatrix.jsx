import React, { useState, useMemo, useRef } from "react";

import Settings from "./Settings";
import BasicChart from "@/components/charts/BasicChart";
import useCorrelationMatrix from "./useCorrelationMatrix";
import useCorrelationMatrixData from "./useCorrelationMatrixData";
import ViewContainer from "@/components/charts/ViewContainer";

const defaultConfig = {
  isSync: true,
  range: [0, 1],
  showLegend: true,
  showLabels: true,
  colorScale: "rdBu",
};

const defaultParams = {
  groupVar: null,
  variables: [],
  nTop: 10,
  method: "pearson",
};

function Chart({ data, id, config, params }) {
  const chartRef = useRef(null);
  useCorrelationMatrix({ chartRef, data: data, config, params });
  return <BasicChart id={id} chartRef={chartRef} />;
}

export default function CorrelationMatrix({ id, remove }) {
  const [config, setConfig] = useState(defaultConfig);
  const [params, setParams] = useState(defaultParams);
  const [info, setInfo] = useState(null);
  const [data] = useCorrelationMatrixData(config.isSync, params, setInfo);

  const chart = useMemo(() => {
    return <Chart data={data} config={config} params={params} id={id} />;
  }, [config, data, params]);

  return (
    <ViewContainer
      title={`Correlation Matrix`}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={
        <Settings
          info
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
