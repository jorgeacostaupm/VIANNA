import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import { getLineChartData } from "@/utils/functionsEvolution";
import evolutionTests from "@/utils/evolution_tests";
import { selectNumericVars } from "@/store/slices/cantabSlice";
import { notifyError } from "@/utils/notifications";

export default function useLineChartData(
  variable,
  isSync = true,
  showComplete = true,
  testIds = [],
  timeRange = null
) {
  const [data, setData] = useState([]);
  const lastErrorRef = useRef(null);
  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.evolution.groupVar);
  const timeVar = useSelector((s) => s.evolution.timeVar);
  const timeOrderConfig = useSelector((s) =>
    timeVar ? s.evolution.timeOrderByVar?.[timeVar] : null
  );
  const idVar = useSelector((s) => s.cantab.present.idVar);
  const variables = useSelector(selectNumericVars);

  const selectedTests = useMemo(() => {
    const ids = Array.isArray(testIds) ? testIds : [];
    const set = new Set(ids);
    return evolutionTests.filter((test) => set.has(test.id));
  }, [Array.isArray(testIds) ? testIds.join("|") : ""]);

  useEffect(() => {
    if (!isSync || !variables.includes(variable)) {
      return;
    }
    if (!groupVar || !timeVar || !idVar) {
      setData([]);
      return;
    }

    try {
      console.log("[Evolution] Loading line chart data", {
        variable,
        selectedRows: Array.isArray(selection) ? selection.length : 0,
        groupVar,
        timeVar,
        idVar,
        showComplete,
        selectedTests: selectedTests.map((test) => test.id),
      });

      const result = getLineChartData(
        selection,
        variable,
        groupVar,
        timeVar,
        idVar,
        showComplete,
        selectedTests,
        timeRange,
        timeOrderConfig
      );
      console.log("[Evolution] Line chart data ready", {
        meanGroups: Array.isArray(result?.meanData) ? result.meanData.length : null,
        participants: Array.isArray(result?.participantData)
          ? result.participantData.length
          : null,
        tests: Array.isArray(result?.tests) ? result.tests.length : null,
        hasRmAnova: Boolean(result?.rmAnova),
        times: Array.isArray(result?.times) ? result.times.length : null,
      });
      setData(result);
      lastErrorRef.current = null;
    } catch (error) {
      console.error("[Evolution] Line chart data load failed", {
        variable,
        groupVar,
        timeVar,
        idVar,
        error,
      });
      const errorMessage = error?.message || "Evolution calculation failed.";
      if (lastErrorRef.current !== errorMessage) {
        notifyError({
          message: "Could not compute evolution data",
          error,
          fallback: "Evolution calculation failed.",
        });
        lastErrorRef.current = errorMessage;
      }
      setData([]);
    }
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
    timeOrderConfig?.valueMode,
    timeOrderConfig?.direction,
    timeOrderConfig?.useManualOrder,
    Array.isArray(timeOrderConfig?.manualOrder)
      ? timeOrderConfig.manualOrder.join("|")
      : "",
    variables,
  ]);

  return [data, setData];
}
