import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import PopulationsInfo from "./PopulationsInfo";
import MeasuresInfo from "./MeasuresInfo";
import BandsInfo from "./BandsInfo";

const items = [
  {
    label: "Populations",
    children: <PopulationsInfo />,
    key: "1",
    closable: false,
  },
  {
    label: "Measures",
    children: <MeasuresInfo />,
    key: "2",
    closable: false,
  },
  {
    label: "Bands",
    children: <BandsInfo />,
    key: "3",
    closable: false,
  },
];

export const GeneralInfo = () => {
  useEffect(() => {}, []);

  return (
    <Tabs
      type="card"
      style={{
        width: "100%",
        height: "80vh",
        background: "white",
        borderRadius: "5px",
        padding: "5px",
      }}
      items={items}
    />
  );
};

export default GeneralInfo;
