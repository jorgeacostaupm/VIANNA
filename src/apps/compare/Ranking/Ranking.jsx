import React, { useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { selectNumericVars } from "@/store/features/main";
import ViewContainer from "@/components/charts/ViewContainer";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import useRankingViewState from "./useRankingViewState";
import Settings from "./Settings";
import { RankingBarChart } from "./charts";

const defaultConfig = {
  isSync: true,
  filterList: [],
  nBars: 10,
  pValue: 0.05,
  desc: true,
  showGrid: true,
  axisLabelFontSize: 16,
};

export default function Ranking({
  test,
  remove,
  id,
  onVariableClick,
  sourceOrderValues = [],
}) {
  const numericVars = useSelector(selectNumericVars);
  const [config, setConfig] = useState({
    ...defaultConfig,
    nBars: Math.min(numericVars.length, defaultConfig.nBars),
  });

  const { data, recordOrders, requiredVariables } = useRankingViewState({
    test,
    isSync: config.isSync,
    sourceOrderValues,
    numericVars,
  });

  const chart = useMemo(() => {
    if (!data?.data?.length) {
      return <NoDataPlaceholder />;
    }

    return (
      <RankingBarChart
        id={id}
        data={data}
        config={config}
        onVariableClick={onVariableClick}
      />
    );
  }, [data, config, id, onVariableClick]);

  return (
    <ViewContainer
      title={`Ranking · ${test}`}
      info={data?.info}
      svgIDs={data?.data?.length ? [id] : undefined}
      remove={remove}
      config={config}
      setConfig={setConfig}
      settings={<Settings config={config} setConfig={setConfig} />}
      recordsExport={{
        filename: `ranking_${test || "view"}`,
        recordOrders,
        requiredVariables,
      }}
      chart={chart}
    />
  );
}
