import React from "react";
import { useSelector } from "react-redux";
import {
  BarChartOutlined,
  DotChartOutlined,
  LineChartOutlined,
  PartitionOutlined,
  BugFilled,
} from "@ant-design/icons";

import { setInit as setInitMetadata } from "@/store/slices/metaSlice";
import { setInit as setInitCompare } from "@/store/slices/compareSlice";
import { setInit as setInitEvolution } from "@/store/slices/evolutionSlice";
import { setInit as setInitCorrelation } from "@/store/slices/correlationSlice";
import { setInitQuarantine } from "@/store/slices/cantabSlice";

import LinkButton from "@/components/ui/ButtonLink";
import DataManagementButton from "./Data/Buttons/DataManagementButton";

export default function AppsButtons() {
  const initHierarchy = useSelector((state) => state.metadata.init);
  const initCompare = useSelector((state) => state.compare.init);
  const initEvolution = useSelector((state) => state.evolution.init);
  const initCorrelation = useSelector((state) => state.correlation.init);
  const initQuarantine = useSelector(
    (state) => state.cantab.present.initQuarantine
  );
  const dt = useSelector((state) => state.dataframe.present.dataframe);

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <DataManagementButton></DataManagementButton>
      <LinkButton
        to="metadata"
        setInit={setInitMetadata}
        icon={<PartitionOutlined />}
        disabled={initHierarchy}
        disabledTitle="Hierarchy Management is already open"
      />
      {dt && (
        <>
          <LinkButton
            to="compare"
            setInit={setInitCompare}
            icon={<BarChartOutlined />}
            disabled={initCompare}
            disabledTitle="Compare is already open"
          />

          <LinkButton
            to="evolution"
            setInit={setInitEvolution}
            icon={<LineChartOutlined />}
            disabled={initEvolution}
            disabledTitle="Evolution is already open"
          />

          <LinkButton
            to="correlation"
            setInit={setInitCorrelation}
            icon={<DotChartOutlined />}
            disabled={initCorrelation}
            disabledTitle="Correlation is already open"
          />

          <LinkButton
            to="cantab"
            setInit={setInitQuarantine}
            icon={<BugFilled />}
            disabled={initQuarantine}
            disabledTitle="Quarantine is already open"
          />
        </>
      )}
    </div>
  );
}
