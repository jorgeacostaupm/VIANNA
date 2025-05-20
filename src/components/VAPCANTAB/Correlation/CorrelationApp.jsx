import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppMenu } from "@/components/VAPUtils/Menu";
import VarTable from "./VarTable";
import OptionsMatrix from "./OptionsMatrix";
import OptionsScatter from "./OptionsScatter";
import NoData from "@/components/VAPConnectivity/components/NoData";
import { pubsub } from "@/components/VAPUtils/pubsub";
import { setInit } from "@/components/VAPUtils/features/correlation/correlationSlice";
import useRootStyles from "@/components/VAPUtils/useRootStyles";
import ScatterPlotMatrix from "./ScatterPlotMatrix";
const { publish } = pubsub;

const menu = [
  {
    key: 0,
    label: "Matrix",
    children: <OptionsMatrix />,
  },

  {
    key: 1,
    label: "ScatterPlots",
    children: <OptionsScatter />,
  },
];

export const App = ({ selection, groupVar, navioColumns }) => {
  const [isDataOk, setIsDataOk] = useState(false);

  useRootStyles(
    { padding: "0px 0px", maxWidth: "100vw" },
    setInit,
    "Correlation App"
  );

  useEffect(() => {
    let configuration;
    if (!navioColumns.includes(groupVar)) {
      configuration = {
        message: "Population variable not found.",
        description:
          "Population variable not among the available ones in the dataset.",
        type: "error",
      };
    } else if (selection.length < 2) {
      configuration = {
        message: "Not enough data points.",
        type: "error",
      };
    }

    if (configuration) {
      publish("notification", configuration);
      setIsDataOk(false);
    } else setIsDataOk(true);
  }, [navioColumns, groupVar, selection]);

  console.log("RENDERING CORRELATION APP");
  return (
    <>
      {" "}
      <div className="appLayout correlationAppLayout">
        <AppMenu items={menu} />

        {isDataOk && <VarTable />}
        <div
          style={{
            height: "100%",
            width: "80%",
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            overflow: "visible",
          }}
        >
          {isDataOk && <ScatterPlotMatrix />}
        </div>
        {!isDataOk && <NoData></NoData>}
      </div>
    </>
  );
};

function CorrelationApp() {
  const groupVar = useSelector((state) => state.cantab.group_var);
  const selection = useSelector((state) => state.cantab.selection);
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);

  if (groupVar == null || selection == null || navioColumns == null) {
    return null;
  }

  return (
    <App
      selection={selection}
      groupVar={groupVar}
      navioColumns={navioColumns}
    ></App>
  );
}

export default CorrelationApp;
