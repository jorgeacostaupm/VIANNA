import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RetweetOutlined } from "@ant-design/icons";

import { setDataframe } from "@/features/data/dataSlice";
import { setQuarantineData } from "@/features/cantab/cantabSlice";
import BarButton from "@/utils/BarButton";

export default function SwitchButton() {
  const dispatch = useDispatch();
  const qData = useSelector((s) => s.cantab.quarantineData);
  const oData = useSelector((s) => s.dataframe.dataframe);

  function onClick() {
    dispatch(setDataframe(qData));
    dispatch(setQuarantineData(oData));
  }

  return (
    <BarButton
      title={"Switch data between Quarantine and Explorer"}
      onClick={onClick}
      icon={<RetweetOutlined />}
    />
  );
}
