import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RollbackOutlined } from "@ant-design/icons";

import { setDataframe } from "@/store/slices/dataSlice";
import BarButton from "@/components/ui/BarButton";
import { setFilteredData } from "@/store/slices/cantabSlice";
import { notifySuccess, notifyWarning } from "@/utils/notifications";

export default function ResetButton() {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.present.dataframe);
  const filteredData = useSelector(
    (state) => state.cantab.present.filteredData
  );

  const onReset = () => {
    if (!filteredData || filteredData.length === 0) {
      notifyWarning({
        message: "No backup data to restore",
        description: "There are no filtered rows waiting to be restored.",
      });
    } else {
      dispatch(setDataframe([...filteredData, ...dataframe]));
      dispatch(setFilteredData(null));
      notifySuccess({
        message: "Original data restored",
      });
    }
  };

  return (
    <BarButton
      title="Restore original data"
      icon={<RollbackOutlined />}
      onClick={onReset}
    />
  );
}
