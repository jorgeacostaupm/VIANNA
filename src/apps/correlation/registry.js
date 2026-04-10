import CorrelationMatrix from "./CorrelationMatrix";
import ScatterMatrix from "./ScatterMatrix";
import PCA from "./PCA";
import { defineView } from "@/core/Grid/viewDefinitions";

export default {
  ["Correlation Matrix"]: defineView(CorrelationMatrix, {
    layout: { w: 12, h: 8 },
  }),
  ["Scatter Plot Matrix"]: defineView(ScatterMatrix, {
    layout: { w: 12, h: 8 },
  }),
  ["PCA"]: defineView(PCA, {
    layout: { w: 12, h: 8 },
  }),
};
