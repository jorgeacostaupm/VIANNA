import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import { getLineChartData } from "@/utils/functionsEvolution";
import evolutionTests from "@/utils/evolution_tests";
import { selectNumericVars } from "@/store/slices/cantabSlice";

export default function useLineChartData(
  variable,
  isSync = true,
  showComplete = true,
  testIds = [],
  timeRange = null
) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.evolution.groupVar);
  const timeVar = useSelector((s) => s.evolution.timeVar);
  const idVar = useSelector((s) => s.cantab.present.idVar);
  const variables = useSelector(selectNumericVars);

  const selectedTests = useMemo(() => {
    const ids = Array.isArray(testIds) ? testIds : [];
    const set = new Set(ids);
    return evolutionTests.filter((test) => set.has(test.id));
  }, [Array.isArray(testIds) ? testIds.join("|") : ""]);

  useEffect(() => {
    if (!isSync || !variables.includes(variable)) return;
    if (!groupVar || !timeVar || !idVar) {
      setData([]);
      return;
    }

    const result = getLineChartData(
      selection,
      variable,
      groupVar,
      timeVar,
      idVar,
      showComplete,
      selectedTests,
      timeRange
    );
    setData(result);
  }, [
    isSync,
    variable,
    selection,
    groupVar,
    timeVar,
    idVar,
    showComplete,
    selectedTests,
    timeRange?.from,
    timeRange?.to,
    variables,
  ]);

  return [data, setData];
}
