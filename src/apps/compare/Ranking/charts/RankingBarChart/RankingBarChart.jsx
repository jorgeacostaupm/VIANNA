import { useRef } from "react";

import styles from "@/styles/Charts.module.css";
import useRankingBarChart from "./useRankingBarChart";

export default function RankingBarChart({ data, config, id, onVariableClick }) {
  const chartRef = useRef(null);

  useRankingBarChart({ chartRef, data, config, onVariableClick });

  return <svg ref={chartRef} id={id} className={styles.chartSvg} />;
}
