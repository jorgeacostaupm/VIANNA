import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import { getPCAData } from "@/utils/functions";
import { notifyError } from "@/notifications";
import { ORDER_VARIABLE } from "@/utils/Constants";
import { uniqueColumns } from "@/utils/viewRecords";
import useSelectionRows from "@/hooks/useSelectionRows";

export default function usePCAData(isSync = true, params, setInfo) {
  const [data, setData] = useState([]);
  const groupVar = useSelector((s) => s.correlation.groupVar);
  const idVar = useSelector((s) => s.main.idVar);
  const selectionColumns = useMemo(
    () => uniqueColumns([...(params?.variables || []), groupVar, idVar, ORDER_VARIABLE]),
    [
      Array.isArray(params?.variables) ? params.variables.join("|") : "",
      groupVar,
      idVar,
    ],
  );
  const selection = useSelectionRows(selectionColumns);

  useEffect(() => {
    const variables = Array.isArray(params?.variables) ? params.variables : [];
    if (!isSync || variables.length < 2) {
      setData([]);
      setInfo?.(null);
      return;
    }

    try {
      const res = getPCAData(selection, params);
      if (!res || !Array.isArray(res.points)) {
        setData([]);
        setInfo?.(null);
        return;
      }
      setData(res.points);
      setInfo?.(res.info);
    } catch (error) {
      notifyError({
        message: "Could not compute PCA data",
        error,
        fallback: "Failed to compute principal component analysis.",
      });
      setData([]);
      setInfo?.(null);
    }
  }, [selection, isSync, params, setInfo]);

  return [data, setData];
}
