import { useState, useEffect, useMemo } from "react";

import { getCorrelationData as getData } from "@/utils/functionsCorrelation";
import { notifyError } from "@/notifications";
import useSelectionRows from "@/hooks/useSelectionRows";
import { uniqueColumns } from "@/utils/viewRecords";

export default function useCorrelationMatrixData(
  isSync = true,
  params,
  setInfo,
) {
  const [data, setData] = useState([]);
  const selectionColumns = useMemo(
    () => uniqueColumns(params?.variables || []),
    [Array.isArray(params?.variables) ? params.variables.join("|") : ""],
  );
  const selection = useSelectionRows(selectionColumns);

  useEffect(() => {
    if (!isSync) return;

    try {
      const res = getData(selection, params);
      if (params.nTop > 0 && res) {
        const info = getInfo(res, params.nTop);
        setInfo(info);
      } else {
        setInfo(null);
      }

      setData(res);
    } catch (error) {
      notifyError({
        message: "Could not compute correlation matrix",
        error,
        fallback: "Correlation matrix calculation failed.",
      });
      setData(null);
    }
  }, [isSync, params, selection]);

  return [data, setData];
}

function getInfo(correlations, nTop) {
  let info = "";
  const topCorrelations = correlations
    .filter((corr) => corr.x !== corr.y)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, nTop);
  topCorrelations.forEach(
    (corr, i) =>
      (info += `${i + 1}. ${corr.x}, ${corr.y}: ${corr.value.toFixed(2)}\n`),
  );
  return info;
}
