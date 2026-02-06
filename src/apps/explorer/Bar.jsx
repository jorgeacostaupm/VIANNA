import React from "react";

import SwitchButton from "@/components/Buttons/SwitchButton";
import NullQuarantineButton from "@/components/Buttons/NullQuarantinesButton";
import QuarantineButton from "@/components/Buttons/QuarantineButton";
import LegendButton from "@/components/Buttons/LegendButton";
import SettingsButton from "@/components/Buttons/SettingsButton";
import EditButton from "@/components/Buttons/EditButton";
import EditValuesButton from "@/components/Buttons/EditValuesButton";
import ExportButton from "@/components/Buttons/ExportButton";

import styles from "@/styles/ChartBar.module.css";

export default function Bar({ title, config, updateConfig }) {
  return (
    <>
      <div className={styles.chartBar}>
        <div className={`${styles.chartTitle}`}>{title}</div>

        <div className={styles.right}>
          <NullQuarantineButton />
          <QuarantineButton />
          <SwitchButton />

          <div className={styles.separator} />

          <LegendButton />
          <EditValuesButton></EditValuesButton>
          <EditButton></EditButton>
          <ExportButton></ExportButton>
          <SettingsButton
            config={config}
            updateConfig={updateConfig}
          ></SettingsButton>
        </div>
      </div>
    </>
  );
}
