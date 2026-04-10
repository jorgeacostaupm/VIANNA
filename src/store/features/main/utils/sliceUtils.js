import { getVariableTypes } from "@/utils/functions";
export const applyGeneratedColumns = (state, action) => {
  const data = Array.isArray(action.payload?.data) ? action.payload.data : [];
  const quarantineData = Array.isArray(action.payload?.quarantineData)
    ? action.payload.quarantineData
    : [];

  state.quarantineData = quarantineData;
  state.varTypes = getVariableTypes(data);
};

export const resetMainDataContext = (state) => {
  state.quarantineData = [];
  state.quarantineSelection = [];

  state.timeVar = null;
  state.groupVar = null;
  state.idVar = null;
};
