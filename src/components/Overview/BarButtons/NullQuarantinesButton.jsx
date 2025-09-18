import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { WarningTwoTone } from "@ant-design/icons";

import { setDataframe } from "@/features/data/dataSlice";
import { setQuarantineData } from "@/features/cantab/cantabSlice";
import { ORDER_VARIABLE } from "@/utils/Constants";
import BarButton from "@/utils/BarButton";

export default function NullQuarantineButton() {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.dataframe.selection) || [];
  const data = useSelector((state) => state.dataframe.dataframe) || [];
  const qData = useSelector((state) => state.cantab.quarantineData) || [];

  const ids = selection.map((item) => item[ORDER_VARIABLE]);

  const onNullQuarantine = () => {
    const removedRows = selection.filter((row) =>
      Object.values(row).some(
        (value) =>
          value === null ||
          value === undefined ||
          (typeof value === "number" && isNaN(value))
      )
    );

    if (removedRows.length === 0) return;

    const newData = data.filter(
      (row) =>
        !removedRows.some((r) => r[ORDER_VARIABLE] === row[ORDER_VARIABLE])
    );

    dispatch(setDataframe(newData));
    dispatch(setQuarantineData([...qData, ...removedRows]));
  };

  const hasEmptyInSelection = selection.some((row) =>
    Object.values(row).some(
      (value) =>
        value === null ||
        value === undefined ||
        (typeof value === "number" && isNaN(value))
    )
  );

  return (
    hasEmptyInSelection && (
      <BarButton
        title="There are empty values in the selection, click to send them to Quarantine"
        onClick={onNullQuarantine}
        icon={<WarningTwoTone twoToneColor={["#000", "#f5dd07"]} />}
      />
    )
  );
}
