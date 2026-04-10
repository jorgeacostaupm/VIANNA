import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { WarningTwoTone } from "@ant-design/icons";
import BarButton from "@/components/ui/BarButton";
import { nullsToQuarantine } from "@/store/features/main";

export default function NullQuarantineButton() {
  const dispatch = useDispatch();
  const hasEmptyInSelection = useSelector((state) => state.dataframe.hasEmptyValues);

  const onNullQuarantine = () => {
    dispatch(nullsToQuarantine());
  };

  return (
    hasEmptyInSelection && (
      <BarButton
        title="There are empty values in the actual data, click to send them to Quarantine"
        onClick={onNullQuarantine}
        icon={<WarningTwoTone twoToneColor={["#000", "#f5dd07"]} />}
      />
    )
  );
}
