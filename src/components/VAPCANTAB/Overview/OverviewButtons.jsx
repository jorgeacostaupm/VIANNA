import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  BarChartOutlined,
  ApartmentOutlined,
  DotChartOutlined,
} from "@ant-design/icons";

import ButtonLink from "@/components/VAPConnectivity/components/ButtonLink/ButtonLink";
import { Menu } from "@/components/VAPUtils/Menu";

import { setInit as setInitMetadata } from "@/components/VAPUtils/features/metadata/metaSlice";
import { setInit as setInitCompare } from "@/components/VAPUtils/features/compare/compareSlice";
import { setInit as setInitEvolution } from "@/components/VAPUtils/features/evolution/evolutionSlice";
import { setInit as setInitCorrelation } from "@/components/VAPUtils/features/correlation/correlationSlice";
import { setFilteredData } from "@/components/VAPUtils/features/cantab/cantabSlice";

import { DEFAULT_ORDER_VARIABLE } from "@/components/VAPCANTAB/Utils/constants/Constants";

import PopulationGenerator from "./PopulationGenerator";
import OverviewConfiguration from "./OverviewConfiguration";
import { ColorScalesModal } from "./FolderHierarchy";
import { Button } from "antd";
import { setDataframe } from "../../VAPUtils/features/data/dataSlice";

const items = [
  {
    key: 0,
    label: "Create Population",
    children: <PopulationGenerator />,
  },
  {
    key: 1,
    label: "Configuration",
    children: <OverviewConfiguration />,
  },
];

const OverviewButtons = () => {
  const initHierarchy = useSelector((state) => state.metadata.init);
  const initCompare = useSelector((state) => state.compare.init);
  const initEvolution = useSelector((state) => state.evolution.init);
  const initCorrelation = useSelector((state) => state.correlation.init);

  return (
    <div
      style={{
        position: "absolute",
        right: 5,
        top: 5,
        zIndex: 100,
        gap: 5,
        display: "flex",
      }}
    >
      {!initHierarchy && (
        <ButtonLink
          to="metadata"
          setInit={setInitMetadata}
          icon={<ApartmentOutlined />}
        >
          Hierarchy
        </ButtonLink>
      )}
      {!initCompare && (
        <ButtonLink
          to="compare"
          setInit={setInitCompare}
          icon={<BarChartOutlined />}
        >
          Compare
        </ButtonLink>
      )}
      {!initEvolution && (
        <ButtonLink
          to="evolution"
          setInit={setInitEvolution}
          icon={<BarChartOutlined />}
        >
          Evolution
        </ButtonLink>
      )}
      {!initCorrelation && (
        <ButtonLink
          to="correlation"
          setInit={setInitCorrelation}
          icon={<DotChartOutlined />}
        >
          Correlation
        </ButtonLink>
      )}
      <ColorScalesModal />
      <FixSelectionButtons></FixSelectionButtons>

      <Menu items={items} />
    </div>
  );
};

export default OverviewButtons;

const FixSelectionButtons = () => {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.cantab.selection);
  const dataframe = useSelector((state) => state.dataframe.dataframe);
  const filteredData = useSelector((state) => state.cantab.filteredData);

  function onFilter() {
    const ids = selection.map((item) => item[DEFAULT_ORDER_VARIABLE]);
    const filteredData = dataframe.filter(
      (item) => !ids.includes(item[DEFAULT_ORDER_VARIABLE])
    );
    console.log("kkkk", selection, filteredData);
    dispatch(setDataframe(selection));
    dispatch(setFilteredData(filteredData));
  }

  function onReset() {
    console.log("RESET DATA", filteredData, dataframe);
    dispatch(setDataframe([...filteredData, ...dataframe]));
  }

  return (
    <>
      <Button onClick={onFilter} type="primary">
        Fix Selection
      </Button>
      <Button onClick={onReset} type="primary">
        Reset
      </Button>
    </>
  );
};
