import React from "react";
import { useSelector, shallowEqual } from "react-redux";

import styles from "@/styles/Charts.module.css";
import { setQuarantineSelection } from "@/store/slices/cantabSlice";
import Navio from "@/components/Navio";
import Bar from "./Bar";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import { updateConfig } from "@/store/slices/cantabSlice";

export default function Quarantine() {
  const dt = useSelector(
    (state) => state.cantab.present.quarantineData,
    shallowEqual
  );
  const config = useSelector((state) => state.cantab.present.config);

  return (
    <div className={styles.viewContainer}>
      <Bar title="Quarantine" config={config} updateConfig={updateConfig} />

      {dt && dt.length > 0 ? (
        <Navio
          config={config}
          data={dt}
          setSelection={setQuarantineSelection}
        />
      ) : (
        <NoDataPlaceholder message="No quarantine data available"></NoDataPlaceholder>
      )}
    </div>
  );
}
