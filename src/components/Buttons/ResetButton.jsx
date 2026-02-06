import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RollbackOutlined } from "@ant-design/icons";

import { setDataframe } from "@/store/slices/dataSlice";
import BarButton from "@/components/ui/BarButton";
import { setFilteredData } from "@/store/slices/cantabSlice";
import { pubsub } from "@/utils/pubsub";

const { publish } = pubsub;

export default function ResetButton() {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.present.dataframe);
  const filteredData = useSelector(
    (state) => state.cantab.present.filteredData
  );

  const onReset = () => {
    let configuration;
    if (!filteredData || filteredData.length === 0) {
      configuration = {
        message: "No data to restore",
        type: "warning",
      };
    } else {
      configuration = {
        message: "Data restored",
        type: "success",
      };
      dispatch(setDataframe([...filteredData, ...dataframe]));
      dispatch(setFilteredData(null));
    }
    publish("notification", configuration);
  };

  return (
    <BarButton
      title="Restore original data"
      icon={<RollbackOutlined />}
      onClick={onReset}
    />
  );
}
