// SelectorPanel.jsx
import React from "react";

import AppBar from "@/utils/AppBar";
import styles from "@/utils/App.module.css";
import VariableSelector from "./PanelItems/VariableSelector";

export default function Panel(props) {
  const { generateEvolution } = props;

  return (
    <AppBar title="EVOLUTION">
      <div className={styles.panelBoxEvolution}>
        <VariableSelector generateEvolution={generateEvolution} />
      </div>
    </AppBar>
  );
}
