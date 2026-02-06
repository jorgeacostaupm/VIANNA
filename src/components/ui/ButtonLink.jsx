import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Apps } from "@/utils/Constants";
import PanelButton from "./PanelButton";

const APP_ROUTE_MAP = {
  metadata: Apps.HIERARCHY,
  compare: Apps.COMPARE,
  correlation: Apps.CORRELATION,
  evolution: Apps.EVOLUTION,
  cantab: Apps.QUARANTINE,
};

export default function LinkButton({
  to,
  setInit,
  icon,
  disabled = false,
  disabledTitle,
}) {
  const initialized = useSelector((state) => state[to]?.init);
  const dispatch = useDispatch();

  const appName = APP_ROUTE_MAP[to] || to;
  const isDisabled = Boolean(disabled);
  const tooltipTitle =
    isDisabled && disabledTitle
      ? disabledTitle
      : isDisabled
      ? `${appName} is already open`
      : `Open ${appName}`;

  const handleOpenTab = () => {
    if (isDisabled) return;
    if (!initialized) {
      dispatch(setInit(true));
      window.open(
        window.location.href + "#/" + to,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <PanelButton
      title={tooltipTitle}
      onClick={handleOpenTab}
      icon={icon}
      disabled={isDisabled}
    />
  );
}
