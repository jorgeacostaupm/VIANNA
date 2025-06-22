import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Tooltip } from "antd";
import {
  BarChartOutlined,
  DotChartOutlined,
  LineChartOutlined,
  PartitionOutlined,
  BugOutlined,
} from "@ant-design/icons";

import { setInit as setInitMetadata } from "@/features/metadata/metaSlice";
import { setInit as setInitCompare } from "@/features/compare/compareSlice";
import { setInit as setInitEvolution } from "@/features/evolution/evolutionSlice";
import { setInit as setInitCorrelation } from "@/features/correlation/correlationSlice";
import { setInitQuarantine } from "@/features/cantab/cantabSlice";

import ButtonLink from "@/utils/ButtonLink";
import DataManagement from "./Data/DataManagement";

export default function Buttons() {
  const initHierarchy = useSelector((state) => state.metadata.init);
  const initCompare = useSelector((state) => state.compare.init);
  const initEvolution = useSelector((state) => state.evolution.init);
  const initCorrelation = useSelector((state) => state.correlation.init);
  const initQuarantine = useSelector((state) => state.cantab.initQuarantine);
  const dt = useSelector((state) => state.dataframe.dataframe);

  const iconStyle = { fontSize: "40px" };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <DataManagement></DataManagement>
      {!initHierarchy && (
        <ButtonLink
          to="metadata"
          setInit={setInitMetadata}
          icon={<PartitionOutlined style={iconStyle} />}
        />
      )}
      {dt && (
        <>
          {!initCompare && (
            <ButtonLink
              to="compare"
              setInit={setInitCompare}
              icon={<BarChartOutlined style={iconStyle} />}
            />
          )}

          {!initEvolution && (
            <ButtonLink
              to="evolution"
              setInit={setInitEvolution}
              icon={<LineChartOutlined style={iconStyle} />}
            />
          )}

          {!initCorrelation && (
            <ButtonLink
              to="correlation"
              setInit={setInitCorrelation}
              icon={<DotChartOutlined style={iconStyle} />}
            />
          )}

          {!initQuarantine && (
            <ButtonLink
              to="cantab"
              setInit={setInitQuarantine}
              icon={<BugOutlined style={iconStyle} />}
            />
          )}
        </>
      )}
    </div>
  );
}
