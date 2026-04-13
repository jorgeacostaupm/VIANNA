import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RollbackOutlined } from "@ant-design/icons";

import { setDataframe } from "@/store/features/dataframe";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";
import { setFilteredData } from "@/store/features/main";
import { notifyWarning } from "@/components/notifications";

export default function ResetButton() {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.dataframe);
  const filteredData = useSelector((state) => state.main.filteredData);

  const onReset = () => {
    if (!filteredData || filteredData.length === 0) {
      notifyWarning({
        message: "No backup data to restore",
        description: "There are no filtered rows waiting to be restored.",
      });
    } else {
      dispatch(setDataframe([...filteredData, ...dataframe]));
      dispatch(setFilteredData(null));
    }
  };

  return (
    <AppButton
      preset={APP_BUTTON_PRESETS.TOOLBAR_ICON}
      tooltip="Restore original data"
      icon={<RollbackOutlined />}
      onClick={onReset}
    />
  );
}
