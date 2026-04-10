import { useRef } from "react";

import styles from "@/styles/Charts.module.css";
import usePairwiseChart from "./usePairwiseChart";

export default function PairwiseChart({ id, data, config }) {
  const containerRef = useRef(null);

  usePairwiseChart({
    containerRef,
    id,
    data,
    config,
  });

  return <div ref={containerRef} className={styles.chartContainer} />;
}
