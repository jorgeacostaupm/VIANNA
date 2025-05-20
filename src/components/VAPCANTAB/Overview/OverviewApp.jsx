import React from "react";
import { useSelector } from "react-redux";
import NoData from "@/components/VAPConnectivity/components/NoData";
import Overview from "./Overview";
import OverviewButtons from "./OverviewButtons";

const OverviewApp = () => {
  const dt = useSelector((state) => state.dataframe.dataframe);

  return (
    <div className="overviewLayout">
      <OverviewButtons></OverviewButtons>
      <Overview></Overview>
      {!dt && <NoData />}
    </div>
  );
  1;
};

export default OverviewApp;
