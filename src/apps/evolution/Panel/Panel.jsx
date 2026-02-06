import React from "react";

import AppBar from "@/components/ui/AppBar";
import styles from "@/styles/App.module.css";
import VariableSelector from "./VariableSelector";
import { EVO_DESC } from "@/utils/Constants";

export default function Panel(props) {
  const { generateEvolution } = props;

  return (
    <AppBar description={EVO_DESC}>
      <div className={styles.panelBox}>
        <VariableSelector generateEvolution={generateEvolution} />
      </div>
    </AppBar>
  );
}
