import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const signTest = {
  id: "sign-test",
  label: "Sign test",
  description: "Non-parametric paired test based on direction of differences.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.NUMERICAL,
  category: "Numéricas — Pareadas/Repetidas",
  run: (groups) => {
    const [group1, group2] = groups;
    if (!group1 || !group2) {
      throw new Error("Sign test requires two paired groups.");
    }
    if (group1.values.length !== group2.values.length) {
      throw new Error("Sign test requires paired samples.");
    }

    const differences = group1.values.map((v, i) => v - group2.values[i]);
    const nonZero = differences.filter((d) => Number.isFinite(d) && d !== 0);
    const n = nonZero.length;
    if (n < 1) {
      throw new Error("Sign test requires at least one non-zero difference.");
    }

    const pos = nonZero.filter((d) => d > 0).length;
    const neg = n - pos;
    const k = Math.min(pos, neg);
    let pValue = 2 * jStat.binomial.cdf(k, n, 0.5);
    if (pValue > 1) pValue = 1;

    const descriptionString = `Sign test (n=${n}): pos=${pos}, neg=${neg}, p=${pValue.toFixed(
      3
    )}`;

    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>Sign test (n = {n})</div>
        <div>
          pos = {pos}, neg = {neg}, p = {pValue.toFixed(3)}
        </div>
      </div>
    );

    return {
      statisticName: "S",
      statistic: pos,
      pValue,
      df: n,
      descriptionString,
      descriptionJSX,
      metric: { name: "Sign count", symbol: "S", value: pos },
    };
  },
  metric: { measure: "Sign count", symbol: "S" },
};
