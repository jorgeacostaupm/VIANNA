import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const cochranQ = {
  id: "cochran-q",
  label: "Cochran's Q",
  description: "Paired test for binary outcomes across k conditions.",
  isApplicable: (count) => count >= 3,
  variableType: VariableTypes.CATEGORICAL,
  category: "Categóricas — Pareadas",
  run: (groups) => {
    const k = groups.length;
    const n = groups[0].values.length;
    if (groups.some((g) => g.values.length !== n)) {
      throw new Error("Cochran's Q requires equal-length groups.");
    }
    const categories = [...new Set(groups.flatMap((g) => g.values))].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
    if (categories.length !== 2) {
      throw new Error("Cochran's Q requires exactly 2 categories.");
    }
    const success = categories[0];

    const data = Array.from({ length: n }, (_, i) =>
      groups.map((g) => (g.values[i] === success ? 1 : 0))
    );
    const Tj = Array(k).fill(0);
    const Ri = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let rowSum = 0;
      for (let j = 0; j < k; j++) {
        const v = data[i][j];
        Tj[j] += v;
        rowSum += v;
      }
      Ri[i] = rowSum;
    }

    const sumT = Tj.reduce((s, v) => s + v, 0);
    const sumT2 = Tj.reduce((s, v) => s + v * v, 0);
    const sumR = Ri.reduce((s, v) => s + v, 0);
    const sumR2 = Ri.reduce((s, v) => s + v * v, 0);
    const denom = k * sumR - sumR2;
    if (denom <= 0) {
      throw new Error("Cochran's Q requires variability across subjects.");
    }
    const Q = ((k - 1) * (k * sumT2 - sumT * sumT)) / denom;
    const pValue = 1 - jStat.chisquare.cdf(Q, k - 1);
    const kendallW = Q / (n * (k - 1));

    const descriptionString = `Cochran's Q (k=${k}, n=${n}) — Q=${Q.toFixed(
      2
    )}, p=${pValue.toFixed(3)}, W=${kendallW.toFixed(3)}.`;
    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>Cochran&apos;s Q (k = {k}, n = {n})</div>
        <div>
          Q = {Q.toFixed(2)}, p = {pValue.toFixed(3)}, W ={" "}
          {kendallW.toFixed(3)}
        </div>
      </div>
    );

    return {
      statisticName: "Q",
      statistic: Q,
      pValue,
      summaries: [],
      descriptionString,
      descriptionJSX,
      metric: { name: "Kendall's W", symbol: "W", value: kendallW },
    };
  },
  metric: { measure: "Kendall's W", symbol: "W" },
};
