import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BugFilled } from "@ant-design/icons";

import { setQuarantineData } from "@/features/cantab/cantabSlice";
import { setDataframe } from "@/features/data/dataSlice";

import { ORDER_VARIABLE } from "@/utils/Constants";
import BarButton from "@/utils/BarButton";

export default function QuarantineButton() {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.dataframe.selection);
  const data = useSelector((state) => state.dataframe.dataframe);
  const qData = useSelector((state) => state.cantab.quarantineData) || [];
  const ids = selection?.map((item) => item[ORDER_VARIABLE]);

  const onQuarantine = () => {
    const newData = data?.filter(
      (item) => !ids?.includes(item[ORDER_VARIABLE])
    );

    const newQData = data?.filter((item) =>
      ids?.includes(item[ORDER_VARIABLE])
    );
    dispatch(setDataframe(newData));
    dispatch(setQuarantineData([...qData, ...newQData]));
  };

  return (
    <BarButton
      title={"Send selection to Quarantine view"}
      onClick={onQuarantine}
      icon={<BugFilled />}
    />
  );
}
