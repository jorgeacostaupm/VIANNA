import { useRef } from "react";

import styles from "@/styles/Charts.module.css";
import usePointRangeChart from "./usePointRangeChart";

export default function PointRangeChart({ id, data, config, colorDomain }) {
  const containerRef = useRef(null);

  usePointRangeChart({
    containerRef,
    id,
    data,
    config,
    colorDomain,
  });

  return <div ref={containerRef} className={styles.chartContainer} />;
}
