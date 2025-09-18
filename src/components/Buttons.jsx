import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Tooltip } from "antd";
import {
  BarChartOutlined,
  DotChartOutlined,
  LineChartOutlined,
  PartitionOutlined,
  BugOutlined,
  BugFilled,
} from "@ant-design/icons";

import { setInit as setInitMetadata } from "@/features/metadata/metaSlice";
import { setInit as setInitCompare } from "@/features/compare/compareSlice";
import { setInit as setInitEvolution } from "@/features/evolution/evolutionSlice";
import { setInit as setInitCorrelation } from "@/features/correlation/correlationSlice";
import { setInitQuarantine } from "@/features/cantab/cantabSlice";

import LinkButton from "@/utils/ButtonLink";
import DataManagementButton from "./Data/Buttons/DataManagementButton";

export default function Buttons() {
  const initHierarchy = useSelector((state) => state.metadata.init);
  const initCompare = useSelector((state) => state.compare.init);
  const initEvolution = useSelector((state) => state.evolution.init);
  const initCorrelation = useSelector((state) => state.correlation.init);
  const initQuarantine = useSelector((state) => state.cantab.initQuarantine);
  const dt = useSelector((state) => state.dataframe.dataframe);

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
