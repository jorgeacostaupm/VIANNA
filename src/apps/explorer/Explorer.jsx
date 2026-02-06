import React from "react";
import { useSelector } from "react-redux";

import Bar from "./Bar";
import Navio from "@/components/Navio";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import styles from "@/styles/Charts.module.css";
import { setSelection } from "@/store/slices/dataSlice";
import { updateConfig } from "@/store/slices/dataSlice";

export default function Explorer() {
  const dt = useSelector((state) => state.dataframe.present.dataframe);
  const config = useSelector((state) => state.dataframe.present.config);

  return (
    <div className={styles.viewContainer}>
      <Bar title="Overview" config={config} updateConfig={updateConfig} />

      {dt && dt.length > 0 ? (
        <Navio data={dt} config={config} setSelection={setSelection} />
      ) : (
        <NoDataPlaceholder></NoDataPlaceholder>
      )}
    </div>
  );
}
