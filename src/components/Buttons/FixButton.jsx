import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { PauseOutlined } from "@ant-design/icons";

import { setFilteredData } from "@/store/features/main";
import { setDataframe } from "@/store/features/dataframe";

import { ORDER_VARIABLE } from "@/utils/Constants";
import BarButton from "@/components/ui/BarButton";
import { useSelectionOrderValues } from "@/hooks/useSelectionRows";

export default function FixButton() {
  const dispatch = useDispatch();
  const selectedOrderValues = useSelectionOrderValues();
  const dataframe = useSelector((state) => state.dataframe.dataframe);

  const onFilter = () => {
    const selectedOrderSet = new Set(selectedOrderValues);
    const selection = dataframe.filter((item) =>
      selectedOrderSet.has(item?.[ORDER_VARIABLE]),
    );
    const filteredData = dataframe.filter(
      (item) => !selectedOrderSet.has(item?.[ORDER_VARIABLE]),
    );
    if (!filteredData || filteredData.length === 0) return;

    dispatch(setDataframe(selection));
    dispatch(setFilteredData(filteredData));
  };

  return (
    <BarButton
      title="Fix selection"
      icon={<PauseOutlined />}
      onClick={onFilter}
    />
  );
}
