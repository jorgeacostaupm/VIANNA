import React, { useCallback } from "react";
import { Typography } from "antd";
import { useDispatch } from "react-redux";
import { StepBackwardFilled, StepForwardFilled } from "@ant-design/icons";
import BarButton from "@/components/ui/BarButton";

const { Text } = Typography;

export default function UndoRedoButtons() {
  const dispatch = useDispatch();

  const handleUndoMeta = useCallback(
    () => dispatch({ type: "UNDO_META_SLICE" }),
    [dispatch]
  );
  const handleRedoMeta = useCallback(
    () => dispatch({ type: "REDO_META_SLICE" }),
    [dispatch]
  );

  return (
    <>
      <BarButton
        title="Undo hierarchy actions"
        icon={<StepBackwardFilled />}
        onClick={handleUndoMeta}
      ></BarButton>
      <BarButton
        title="Redo hierarchy actions"
        icon={<StepForwardFilled />}
        onClick={handleRedoMeta}
      ></BarButton>
    </>
  );
}
