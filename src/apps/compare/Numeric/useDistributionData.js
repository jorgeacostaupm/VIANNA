import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { pubsub } from "@/utils/pubsub";
import { selectVars } from "@/store/slices/cantabSlice";
const { publish } = pubsub;

export default function useDistributionData(getData, variable, isSync = true) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);
  const timeVar = useSelector((s) => s.cantab.present.timeVar);
  const idVar = useSelector((s) => s.cantab.present.idVar);
  const variables = useSelector(selectVars);

  useEffect(() => {
    if (!isSync || !variables.includes(variable)) return;

    try {
      const result = getData(selection, variable, groupVar, timeVar, idVar);
      setData(result);
    } catch (error) {
      publish("notification", {
        message: "Error computing data",
        description: error.message,
        type: "error",
      });
      setData(null);
    }
  }, [isSync, variable, selection, groupVar]);

  return [data, setData];
}
