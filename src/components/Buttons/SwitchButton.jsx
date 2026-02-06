import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RetweetOutlined } from "@ant-design/icons";

import { setDataframe } from "@/store/slices/dataSlice";
import { setQuarantineData } from "@/store/slices/cantabSlice";
import BarButton from "@/components/ui/BarButton";

export default function SwitchButton() {
  const dispatch = useDispatch();
  const qData = useSelector((s) => s.cantab.present.quarantineData);
  const oData = useSelector((s) => s.dataframe.present.dataframe);

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
