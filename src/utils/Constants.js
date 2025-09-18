export const APP_NAME = "CANTABVis";

export const DEFAULT_ID_VARIABLE = "pseudon_id";
export const DEFAULT_GROUP_VARIABLE = "site";
export const DEFAULT_TIMESTAMP_VARIABLE = "visit";

export const ORDER_VARIABLE = "__ord";
export const DESCRIPTION_VARIABLE = "__desc";

export const HIDDEN_VARIABLES = [ORDER_VARIABLE, DESCRIPTION_VARIABLE];

export const navioLabelHeight = 140;

export const Apps = Object.freeze({
  HIERARCHY: "Hierarchy Editor",
  COMPARE: "Comparison",
  CORRELATION: "Correlation",
  EVOLUTION: "Evolution",
  QUARANTINE: "Quarantine",
});

export const Graphs = Object.freeze({
  SCATTER: "Scatterplot Matrix",
  CORRELATION: "Correlation Matrix",
  PCA: "PCA",
  UMAP: "UMAP",
});

export const VariableTypes = Object.freeze({
  CATEGORICAL: "string",
  NUMERICAL: "number",
  UNKNOWN: "Unknown",
});

export const NodeColors = Object.freeze({
  TEXT: "#f781bf",
  NUMERICAL: "#377eb8",
  DATE: "#4daf4a",
  UNKNOWN: "#ff7f00",
  ROOT: "black",
});

export const DataType = Object.freeze({
  TEXT: { color: "#f781bf", name: "Text", dtype: "string" },
  NUMERICAL: { color: "#377eb8", name: "Numerical", dtype: "number" },
  UNKNOWN: { color: "#ff7f00", name: "Unknown", dtype: "determine" },
});

export function getColorByDtype(dtype) {
  const entry = Object.values(DataType).find((item) => item.dtype === dtype);
  console.log(dtype, entry?.color, entry);
  return entry ? entry.color : null;
}

export function getNameByDtype(dtype) {
  const entry = Object.values(DataType).find((item) => item.dtype === dtype);
  console.log(dtype, entry?.name, entry);
  return entry ? entry.name : null;
}
