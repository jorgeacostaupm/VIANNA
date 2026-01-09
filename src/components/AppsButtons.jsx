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

import LinkButton from "@/utils/ButtonLink";
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
      {!initHierarchy && (
        <LinkButton
          to="metadata"
          setInit={setInitMetadata}
          icon={<PartitionOutlined />}
        />
      )}
      {dt && (
        <>
          {!initCompare && (
            <LinkButton
              to="compare"
              setInit={setInitCompare}
              icon={<BarChartOutlined />}
            />
          )}

          {!initEvolution && (
            <LinkButton
              to="evolution"
              setInit={setInitEvolution}
              icon={<LineChartOutlined />}
            />
          )}

          {!initCorrelation && (
            <LinkButton
              to="correlation"
              setInit={setInitCorrelation}
              icon={<DotChartOutlined />}
            />
          )}

          {!initQuarantine && (
            <LinkButton
              to="cantab"
              setInit={setInitQuarantine}
              icon={<BugFilled />}
            />
          )}
        </>
      )}
    </div>
  );
}
