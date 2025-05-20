import React, { useState } from "react";
import { Button, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { capitalizeFirstLetter } from "@/components/VAPUtils/functions";

export const ButtonLink = ({ to, children, setInit, icon }) => {
  const initialized = useSelector((state) => state[to].init);
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();

  const handleOpenTab = () => {
    if (initialized) {
      let appName = to;
      if (to === "metadata") appName = "Hierarchy Editor";
      if (to === "compare") appName = "Comparison App";
      if (to === "correlation") appName = "Correlation App";
      if (to === "evolution") appName = "Evolution App";
      if (to === "matrix") appName = "Matrix App";

      messageApi.open({
        type: "error",
        content: `${capitalizeFirstLetter(appName)} is already open!`,
      });
    } else {
      dispatch(setInit(true));
      window.open(
        window.location.href + "#/" + to,
        "_blank",
        "noopener,noreferrer,toolbar=0,location=0,menubar=0"
      );
    }
  };

  return (
    <>
      {contextHolder}
      <Button type="primary" onClick={handleOpenTab}>
        {icon && icon}
        {children}
      </Button>
    </>
  );
};

export default ButtonLink;
