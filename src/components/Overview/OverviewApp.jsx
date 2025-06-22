import React, { useState } from "react";
import { useSelector, shallowEqual } from "react-redux";

import { setSelection } from "@/features/cantab/cantabSlice";
import Overview from "./Overview";
import OverviewBar from "./OverviewBar";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import { navioLabelHeight } from "@/utils/Constants";
import styles from "@/utils/Charts.module.css";

export default function OverviewApp() {
  const dt = useSelector((state) => state.dataframe.dataframe, shallowEqual);

  const [config, setConfig] = useState({ attrWidth: 30, y0: navioLabelHeight });

  return (
    <div className={styles.viewContainer}>
      <OverviewBar title="Overview" config={config} setConfig={setConfig} />

      {dt && dt.length > 0 ? (
        <Overview config={config} data={dt} setSelection={setSelection} />
      ) : (
        <NoDataPlaceholder></NoDataPlaceholder>
      )}
    </div>
  );
}
