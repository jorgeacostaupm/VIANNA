import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { getPCAData } from "@/utils/functions";
import { notifyError } from "@/utils/notifications";

export default function usePCAData(isSync = true, params, setInfo) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);

  useEffect(() => {
    if (!isSync || params.variables.length < 2) return;

    try {
      let res = getPCAData(selection, params);
      setData(res.points);
      setInfo(res.info);
    } catch (error) {
      notifyError({
        message: "Could not compute PCA data",
        error,
        fallback: "Failed to compute principal component analysis.",
      });
      setData(null);
    }
  }, [selection, isSync, params]);

  return [data, setData];
}
