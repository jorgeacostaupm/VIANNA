import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { UndoOutlined } from "@ant-design/icons";

import { setDataframe } from "@/features/data/dataSlice";
import BarButton from "@/utils/BarButton";

export default function ResetButton() {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.dataframe);
  const filteredData = useSelector((state) => state.cantab.filteredData);

  const onReset = () => {
    if (!filteredData || filteredData.length === 0) return;

    dispatch(setDataframe([...filteredData, ...dataframe]));
  };

  return (
    <BarButton
      title="Restore original data"
      icon={<UndoOutlined />}
      onClick={onReset}
    />
  );
}
