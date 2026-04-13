import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import { getLineChartData } from "@/utils/functionsEvolution";
import evolutionTests from "@/utils/evolution_tests";
import { selectNumericVars, selectVarTypes } from "@/store/features/main";
import { notifyError } from "@/components/notifications";
import useSelectionRows from "@/hooks/useSelectionRows";
import { uniqueColumns } from "@/utils/viewRecords";

export default function useLineChartData(
  variable,
  isSync = true,
  showComplete = true,
  showIncomplete = false,
  testIds = [],
  timeRange = null,
  testOptions = null
) {
  const [data, setData] = useState([]);
  const lastErrorRef = useRef(null);
  const groupVar = useSelector((s) => s.evolution.groupVar);
  const timeVar = useSelector((s) => s.evolution.timeVar);
  const timeOrderConfig = useSelector((s) =>
    timeVar ? s.evolution.timeOrderByVar?.[timeVar] : null
  );
  const idVar = useSelector((s) => s.main.idVar);
  const variables = useSelector(selectNumericVars);
  const varTypes = useSelector(selectVarTypes);
  const selectionColumns = useMemo(
    () =>
      uniqueColumns([
        variable,
        groupVar,
        timeVar,
        idVar,
        ...(Array.isArray(testOptions?.lmmCovariates)
          ? testOptions.lmmCovariates
          : []),
      ]),
    [
      variable,
      groupVar,
      timeVar,
      idVar,
      Array.isArray(testOptions?.lmmCovariates)
        ? testOptions.lmmCovariates.join("|")
        : "",
    ],
  );
  const selection = useSelectionRows(selectionColumns);

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
      const result = getLineChartData(
        selection,
        variable,
        groupVar,
        timeVar,
        idVar,
        showComplete,
        showIncomplete,
        selectedTests,
        timeRange,
        timeOrderConfig,
        testOptions,
        varTypes
      );
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
    showIncomplete,
    selectedTests,
    timeRange?.from,
    timeRange?.to,
    timeOrderConfig?.valueMode,
    timeOrderConfig?.direction,
    timeOrderConfig?.useManualOrder,
    Array.isArray(timeOrderConfig?.manualOrder)
      ? timeOrderConfig.manualOrder.join("|")
      : "",
    testOptions?.lmmReferenceGroup,
    testOptions?.lmmIncludeInteraction,
    testOptions?.lmmTimeCoding,
    Array.isArray(testOptions?.lmmCovariates)
      ? testOptions.lmmCovariates.join("|")
      : "",
    varTypes,
    variables,
  ]);

  return [data, setData];
}
