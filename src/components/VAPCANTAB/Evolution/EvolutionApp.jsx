import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { notification } from "antd";

import { AppMenu } from "@/components/VAPUtils/Menu";
import NoData from "@/components/VAPConnectivity/components/NoData";

import { useNotificationSubscription } from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import useRootStyles from "@/components/VAPUtils/useRootStyles";

import { setInit } from "@/components/VAPUtils/features/evolution/evolutionSlice";

import EvolutionBarplot from "./EvolutionBarplot";
import EvolutionPlots from "./EvolutionPlots";

import OptionsRanking from "./OptionsRanking";
import OptionsEvolution from "./OptionsEvolution";

import { pubsub } from "@/components/VAPUtils/pubsub";
const { publish } = pubsub;

const items = [
  {
    key: 0,
    label: "Ranking",
    children: <OptionsRanking />,
  },

  {
    key: 1,
    label: "Evolutions",
    children: <OptionsEvolution />,
  },
];

export const App = ({ groupVar, timeVar, selectionTimes, navioColumns }) => {
  const [apiNotif, contextHolder] = notification.useNotification();
  const [isDataOk, setisDataOk] = useState(false);

  useRootStyles(
    { padding: "0px 0px", maxWidth: "100vw" },
    setInit,
    "Evolution App"
  );
  useNotificationSubscription(apiNotif);

  useEffect(() => {
    let configuration;
    if (!navioColumns.includes(groupVar)) {
      configuration = {
        message: "Population variable not found.",
        description: "",
        type: "error",
      };
    } else if (!navioColumns.includes(timeVar)) {
      configuration = {
        message: "Time variable not found.",
        description: "",
        type: "error",
      };
    } else if (selectionTimes.length < 2) {
      configuration = {
        message: "Not enough time points.",
        description: "This app is to compare 2 or more time points.",
        type: "error",
      };
    }

    if (configuration) {
      publish("notification", configuration);
      setisDataOk(false);
    } else {
      setisDataOk(true);
    }
  }, [groupVar, timeVar, selectionTimes, navioColumns]);

  console.log("RENDERING EVOLUTION APP...");
  return (
    <>
      {contextHolder}
      <div className="appLayout">
        <AppMenu items={items} />

        {isDataOk && <EvolutionBarplot />}
        {isDataOk && <EvolutionPlots />}

        {!isDataOk && <NoData></NoData>}
      </div>
    </>
  );
};

function EvolutionApp() {
  const groupVar = useSelector((state) => state.cantab.group_var);
  const timeVar = useSelector((state) => state.cantab.time_var);
  const selectionTimes = useSelector((state) => state.cantab.selection_times);

  const navioColumns = useSelector((state) => state.dataframe.navioColumns);

  if (
    groupVar === null ||
    timeVar === null ||
    selectionTimes === null ||
    navioColumns === null
  ) {
    return null;
  }

  return (
    <App
      groupVar={groupVar}
      timeVar={timeVar}
      selectionTimes={selectionTimes}
      navioColumns={navioColumns}
    ></App>
  );
}

export default EvolutionApp;
