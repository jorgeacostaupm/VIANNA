import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { getLineChartData } from "@/utils/functionsEvolution";
import { selectNumericVars } from "@/store/slices/cantabSlice";

export default function useLineChartData(
  variable,
  isSync = true,
  showComplete = true
) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);
  const timeVar = useSelector((s) => s.cantab.present.timeVar);
  const idVar = useSelector((s) => s.cantab.present.idVar);
  const variables = useSelector(selectNumericVars);

  useEffect(() => {
    if (!isSync || !variables.includes(variable)) return;

    const result = getLineChartData(
      selection,
      variable,
      groupVar,
      timeVar,
      idVar,
      showComplete
    );
    setData(result);
  }, [isSync, variable, selection, groupVar, showComplete]);

  return [data, setData];
}
