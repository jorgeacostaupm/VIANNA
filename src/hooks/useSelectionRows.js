import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  makeSelectProjectedSelection,
  selectSelectionOrderValues,
} from "@/store/features/dataframe";

export default function useSelectionRows(requiredColumns = null) {
  const selectProjectedSelection = useMemo(makeSelectProjectedSelection, []);
  return useSelector((state) =>
    selectProjectedSelection(state, requiredColumns),
  );
}

export function useSelectionOrderValues() {
  return useSelector(selectSelectionOrderValues);
}
