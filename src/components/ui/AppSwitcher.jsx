import React from "react";
import { GoToAppButton } from "@/components/buttons/app";
import { DataManagementButton } from "@/components/buttons/app";

const ROW_STYLE = Object.freeze({ display: "flex", gap: "10px" });

export default function AppSwitcher({
  appIds = [],
  dataManagementButtonProps = {},
  trailing = null,
  className,
  style,
}) {
  const rowStyle = style ? { ...ROW_STYLE, ...style } : ROW_STYLE;
  return (
    <div className={className} style={rowStyle}>
      <DataManagementButton {...dataManagementButtonProps} />
      {appIds.map((appId) => (
        <GoToAppButton key={appId} to={appId} />
      ))}
      {trailing}
    </div>
  );
}
