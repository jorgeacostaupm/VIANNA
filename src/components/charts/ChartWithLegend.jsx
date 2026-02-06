import React from "react";
import styles from "@/styles/Charts.module.css";

export default function ChartWithLegend({
  id,
  chartRef,
  legendRef,
  showLegend = true,
}) {
  return (
    <div className={styles.chartLegendContainer}>
      <svg
        ref={chartRef}
        id={id}
        className={
          showLegend ? styles.distributionChart : styles.distributionChartFull
        }
      />

      <div className={showLegend ? styles.legend : styles.legendHidden}>
        <svg ref={legendRef} id={`${id}-legend`} />
      </div>
    </div>
  );
}
