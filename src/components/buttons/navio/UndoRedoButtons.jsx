import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StepBackwardFilled, StepForwardFilled } from "@ant-design/icons";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";
import {
  redoAssignmentChange,
  selectCanRedoNodeAssignment,
  selectCanUndoNodeAssignment,
  undoAssignmentChange,
} from "@/store/features/metadata";

export default function UndoRedoButtons() {
  const dispatch = useDispatch();
  const canUndo = useSelector(selectCanUndoNodeAssignment);
  const canRedo = useSelector(selectCanRedoNodeAssignment);
  const [pendingAction, setPendingAction] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(
    () => () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const runHistoryAction = useCallback(
    (actionType, actionCreator) => {
      if (pendingAction) return;

      setPendingAction(actionType);
      timeoutRef.current = setTimeout(() => {
        dispatch(actionCreator());
        setPendingAction(null);
        timeoutRef.current = null;
      }, 0);
    },
    [dispatch, pendingAction],
  );

  const handleUndoMeta = useCallback(
    () => runHistoryAction("undo", undoAssignmentChange),
    [runHistoryAction],
  );
  const handleRedoMeta = useCallback(
    () => runHistoryAction("redo", redoAssignmentChange),
    [runHistoryAction],
  );

  return (
    <>
      <AppButton
        preset={APP_BUTTON_PRESETS.TOOLBAR_ICON}
        tooltip="Undo node reassignment"
        icon={<StepBackwardFilled />}
        onClick={handleUndoMeta}
        disabled={!canUndo || pendingAction === "redo"}
        loading={pendingAction === "undo"}
      />
      <AppButton
        preset={APP_BUTTON_PRESETS.TOOLBAR_ICON}
        tooltip="Redo node reassignment"
        icon={<StepForwardFilled />}
        onClick={handleRedoMeta}
        disabled={!canRedo || pendingAction === "undo"}
        loading={pendingAction === "redo"}
      />
    </>
  );
}
