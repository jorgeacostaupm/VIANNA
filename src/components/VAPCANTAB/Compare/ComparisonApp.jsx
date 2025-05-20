import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppMenu } from "@/components/VAPUtils/Menu";
import OptionsRanking from "./OptionsRanking";
import OptionsDensities from "./OptionsDensities";
import NoData from "@/components/VAPConnectivity/components/NoData";
import { pubsub } from "@/components/VAPUtils/pubsub";
import { setInit } from "@/components/VAPUtils/features/compare/compareSlice";
import { useNotificationSubscription } from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import useRootStyles from "@/components/VAPUtils/useRootStyles";
import { notification, Spin } from "antd";
import ComparisonBarplot from "./ComparisonBarplot";
import ComparisonDistributionPlots from "./ComparisonDistributionPlots";
const { publish } = pubsub;

const items = [
  {
    key: 0,
    label: "Ranking",
    children: <OptionsRanking />,
  },

  {
    key: 1,
    label: "Distribution",
    children: <OptionsDensities />,
  },
];

function App({ selectionPopulations, groupVar, navioColumns }) {
  const [apiNotif, contextHolder] = notification.useNotification();
  const [isDataOk, setIsDataOk] = useState(false);

  useRootStyles(
    { padding: "0px 0px", maxWidth: "100vw" },
    setInit,
    "Comparison App"
  );
  useNotificationSubscription(apiNotif);

  useEffect(() => {
    let configuration;
    if (!navioColumns.includes(groupVar)) {
      configuration = {
        message: "Population variable not found.",
        description:
          "Population variable not among the available ones in the dataset.",
        type: "error",
      };
    } else if (selectionPopulations.length < 2) {
      configuration = {
        message: "Not enough populations.",
        description: "This app is to compare 2 or more populations.",
        type: "error",
      };
    }

    if (configuration) {
      publish("notification", configuration);
      setIsDataOk(false);
    } else {
      setIsDataOk(true);
    }
  }, [navioColumns, groupVar, selectionPopulations]);

  return (
    <>
      {contextHolder}
      <div className="appLayout">
        <AppMenu items={items} />

        {isDataOk && <ComparisonBarplot />}
        {isDataOk && <ComparisonDistributionPlots />}

        {!isDataOk && <NoData></NoData>}
      </div>
    </>
  );
}

function ComparisonApp() {
  const groupVar = useSelector((state) => state.cantab.group_var);
  const selectionPopulations = useSelector(
    (state) => state.cantab.selection_populations
  );
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);

  if (
    groupVar == null ||
    selectionPopulations == null ||
    navioColumns == null
  ) {
    return null;
  }

  return (
    <App
      selectionPopulations={selectionPopulations}
      groupVar={groupVar}
      navioColumns={navioColumns}
    ></App>
  );
}

export default ComparisonApp;
