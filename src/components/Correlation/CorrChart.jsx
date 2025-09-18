import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import useResizeObserver from "@/utils/useResizeObserver";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import styles from "@/utils/Charts.module.css";
import { pubsub } from "@/utils/pubsub";
const { publish } = pubsub;

export default function CorrChart({ config, params, drawChart, getChartData }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);
  const selection = useSelector((s) => s.dataframe.selection);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!config.isSync) {
      return;
    }
    try {
      let res = getChartData(selection, params);
      setData(res);
    } catch (error) {
      const configuration = {
        message: "Error computing data",
        description: error.message,
        type: "error",
      };
      publish("notification", configuration);
      setData(null);
    }
  }, [selection, params, config.isSync]);

  useEffect(() => {
    if (ref.current && data && dimensions) {
      drawChart(data, config, ref.current, dimensions);
    } else {
      ref.current.innerHTML = "";
    }
  }, [data, config, dimensions]);

  return (
    <>
      <div ref={ref} className={styles.correlationContainer}></div>
      {!data && <NoDataPlaceholder></NoDataPlaceholder>}
    </>
  );
}
