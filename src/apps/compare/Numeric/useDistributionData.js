import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { notifyError } from "@/utils/notifications";
import { selectVars } from "@/store/slices/cantabSlice";

export default function useDistributionData(
  getData,
  variable,
  isSync = true,
  { groupVar = null, timeVar = null } = {}
) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);
  const idVar = useSelector((s) => s.cantab.present.idVar);
  const variables = useSelector(selectVars);

  useEffect(() => {
    if (!isSync || !variables.includes(variable) || !groupVar) return;

    try {
      const result = getData(selection, variable, groupVar, timeVar, idVar);
      setData(result);
    } catch (error) {
      notifyError({
        message: "Could not compute distribution data",
        error,
        fallback: "Distribution calculation failed.",
      });
      setData(null);
    }
  }, [isSync, variable, selection, groupVar, timeVar, idVar, variables, getData]);

  return [data, setData];
}
