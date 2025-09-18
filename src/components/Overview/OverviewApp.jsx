import React from "react";
import { useSelector, shallowEqual } from "react-redux";

import Overview from "./Overview";
import OverviewBar from "./OverviewBar";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import styles from "@/utils/Charts.module.css";
import { setSelection } from "@/features/data/dataSlice";

export default function OverviewApp() {
  const dt = useSelector((state) => state.dataframe.dataframe, shallowEqual);
  const config = useSelector((state) => state.dataframe.config);

  return (
    <div className={styles.viewContainer}>
      <OverviewBar title="Overview" />

      {dt && dt.length > 0 ? (
        <Overview data={dt} config={config} setSelection={setSelection} />
      ) : (
        <NoDataPlaceholder></NoDataPlaceholder>
      )}
    </div>
  );
}
