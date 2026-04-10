import React from "react";
import { useSelector } from "react-redux";
import {
  HomeOutlined,
  BarChartOutlined,
  DotChartOutlined,
  LineChartOutlined,
  BugFilled,
} from "@ant-design/icons";

import GoToAppButton from "@/components/ui/ButtonLink";
import DataManagementButton from "@/components/Data/Buttons/DataManagementButton";

export default function AppsButtons() {
  const dt = useSelector((state) => state.dataframe.dataframe);

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <DataManagementButton />
      <GoToAppButton to="overview" icon={<HomeOutlined />} />
      {dt && (
        <>
          <GoToAppButton to="compare" icon={<BarChartOutlined />} />
          <GoToAppButton to="evolution" icon={<LineChartOutlined />} />
          <GoToAppButton to="correlation" icon={<DotChartOutlined />} />
          <GoToAppButton to="cantab" icon={<BugFilled />} />
        </>
      )}
    </div>
  );
}
