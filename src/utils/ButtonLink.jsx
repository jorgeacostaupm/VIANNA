import React from "react";
import { Button, message, Tooltip } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Apps } from "./Constants";
import styles from "./Buttons.module.css";

export default function ButtonLink({ to, children, setInit, icon }) {
  const initialized = useSelector((state) => state[to].init);
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();

  let appName = to;
  if (to === "metadata") appName = Apps.HIERARCHY;
  if (to === "compare") appName = Apps.COMPARE;
  if (to === "correlation") appName = Apps.CORRELATION;
  if (to === "evolution") appName = Apps.EVOLUTION;
  if (to === "cantab") appName = "Quarantine";

  const handleOpenTab = () => {
    if (initialized) {
      messageApi.open({
        type: "error",
        content: `${appName} is already open!`,
      });
    } else {
      dispatch(setInit(true));
      window.open(
        window.location.href + "#/" + to,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <>
      {contextHolder}
      <Tooltip placement="bottom" title={"Open " + appName + " in a new tab"}>
        <Button
          shape="circle"
          style={{ height: "auto", padding: "20px" }}
          className={styles.coloredButton}
          onClick={handleOpenTab}
        >
          {icon && icon}
          {children}
        </Button>
      </Tooltip>
    </>
  );
}
