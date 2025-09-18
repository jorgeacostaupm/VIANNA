import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const wilcoxonSignedRank = {
  id: "wilcoxon-signed-rank",
  label: "Wilcoxon Signed-Rank",
  description: "Non-parametric test for comparing two paired samples.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.NUMERICAL,
  run: (groups) => {
    const [g1, g2] = groups;
    const n = g1.values.length;
    const diffs = g1.values.map((v, i) => v - g2.values[i]);
    const nonZeroDiffs = diffs
      .map((d, i) => ({ d, i }))
      .filter((x) => x.d !== 0);
    const ranks = jStat.rank(nonZeroDiffs.map((x) => Math.abs(x.d)));

    const Tplus = nonZeroDiffs.reduce(
      (sum, x, i) => (x.d > 0 ? sum + ranks[i] : sum),
      0
    );
    const Tminus = nonZeroDiffs.reduce(
      (sum, x, i) => (x.d < 0 ? sum + ranks[i] : sum),
      0
    );
    const W = Math.min(Tplus, Tminus);
    const z =
      (W - (n * (n + 1)) / 4) / Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
    const pValue = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));

    return {
      statisticName: "W",
      statistic: W,
      pValue,
      summaries: [
        {
          name: `${g1.name} – ${g2.name}`,
          n,
          measure: "Median difference",
          value: jStat.median(diffs),
        },
      ],
      descriptionString: `Wilcoxon signed-rank test (n=${n}): W = ${W.toFixed(
        2
      )}, p = ${pValue.toFixed(3)}`,
    };
  },
};
