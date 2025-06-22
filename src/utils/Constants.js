export const DEFAULT_ID_VARIABLE = "id";
export const DEFAULT_GROUP_VARIABLE = "Country";
export const DEFAULT_TIMESTAMP_VARIABLE = "Visit Name";

export const ORDER_VARIABLE = "__ord";
export const DESCRIPTION_VARIABLE = "__desc";

export const HIDDEN_VARIABLES = [ORDER_VARIABLE, DESCRIPTION_VARIABLE];

export const navioLabelHeight = 140;

export const Apps = Object.freeze({
  HIERARCHY: "Hierarchy Editor",
  COMPARE: "Comparison",
  CORRELATION: "Correlation",
  EVOLUTION: "Evolution",
  MATRIX: "Matrix",
  QUARANTINE: "QUARANTINE",
});

export const Graphs = Object.freeze({
  SCATTER: "Scatterplot Matrix",
  CORRELATION: "Correlation Matrix",
  PCA: "PCA",
  UMAP: "UMAP",
});

export const VariableTypes = Object.freeze({
  CATEGORICAL: "Categorical",
  NUMERICAL: "Numerical",
  UNKNOWN: "Unknown",
});

export const DataTypes = Object.freeze({
  TEXT: "Textual",
  NUMERICAL: "Numerical",
  DATE: "Date",
  UNKNOWN: "To determine",
});

export const NodeColors = Object.freeze({
  TEXT: "#f781bf",
  NUMERICAL: "#377eb8",
  DATE: "#4daf4a",
  UNKNOWN: "#ff7f00",
  ROOT: "black",
});
