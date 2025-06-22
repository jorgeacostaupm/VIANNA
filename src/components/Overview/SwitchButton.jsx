import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import { SyncOutlined } from "@ant-design/icons";

import buttonStyles from "@/utils/Buttons.module.css";
import { setDataframe } from "@/features/data/dataSlice";
import { setQuarantineData } from "@/features/cantab/cantabSlice";

const iconStyle = { fontSize: "20px" };

export default function SwitchButton() {
  const dispatch = useDispatch();
  const qData = useSelector((s) => s.cantab.quarantineData);
  const oData = useSelector((s) => s.dataframe.dataframe);

  function onClick() {
    dispatch(setDataframe(qData));
    dispatch(setQuarantineData(oData));
  }

  return (
    <Tooltip title={"Switch data between Quarantine and Explorer"}>
      <Button
        className={buttonStyles.coloredButton}
        shape="circle"
        onClick={onClick}
      >
        {<SyncOutlined style={iconStyle} />}
      </Button>
    </Tooltip>
  );
}
