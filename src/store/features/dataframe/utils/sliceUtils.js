import {
  createSelectionRefForAllRows,
  selectionHasEmptyValues,
} from "./selectionRef";

export const areColumnsEqual = (previousColumns = [], nextColumns = []) => {
  if (previousColumns === nextColumns) return true;
  if (!Array.isArray(previousColumns) || !Array.isArray(nextColumns)) {
    return false;
  }

  if (previousColumns.length !== nextColumns.length) return false;

  return previousColumns.every(
    (columnName, index) => columnName === nextColumns[index],
  );
};

export const syncSelectionFromDataframe = (state, dataframe) => {
  state.dataframe = dataframe;
  state.selectionRef = createSelectionRefForAllRows(dataframe);
  state.selection = null;
  state.hasEmptyValues = selectionHasEmptyValues({
    dataframe: state.dataframe,
    selectionRef: state.selectionRef,
    visibleColumns: state.navioColumns,
  });
};
