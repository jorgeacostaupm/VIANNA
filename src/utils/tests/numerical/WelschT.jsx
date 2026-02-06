import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const welchTest = {
  id: "t-test-welch",
  label: "Welch's t-test",
  description:
    "Comparison of two independent groups with unequal variances, with CIs for means, mean difference, and Cohen's d",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.NUMERICAL,
  category: "Numéricas — Independientes",
  run: (groups) => {
    const alpha = 0.05;
    const [g1, g2] = groups;
    const n1 = g1.values.length;
    const n2 = g2.values.length;
    if (n1 < 2 || n2 < 2) {
      throw new Error("Welch t-test requires at least 2 observations per group.");
    }

    const mean1 = jStat.mean(g1.values);
    const mean2 = jStat.mean(g2.values);
    const var1 = jStat.variance(g1.values, true);
    const var2 = jStat.variance(g2.values, true);

    const diff = mean1 - mean2;

    const seDiff = Math.sqrt(var1 / n1 + var2 / n2);
    if (!Number.isFinite(seDiff) || seDiff === 0) {
      throw new Error("Welch t-test requires non-zero variance.");
    }
    const tStatistic = diff / seDiff;

    const numerator = Math.pow(var1 / n1 + var2 / n2, 2);
    const denominator =
      Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
    const df = numerator / denominator;
    if (!Number.isFinite(df) || df <= 0) {
      throw new Error("Welch t-test failed due to invalid degrees of freedom.");
    }

    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), df));
    const tCrit = jStat.studentt.inv(1 - alpha / 2, df);

    const ciDiffLower = diff - tCrit * seDiff;
    const ciDiffUpper = diff + tCrit * seDiff;

    const dfD = n1 + n2 - 2;
    const pooledSD = Math.sqrt(
      ((n1 - 1) * var1 + (n2 - 1) * var2) / dfD
    );
    const d = diff / pooledSD;
    const seD = Math.sqrt((n1 + n2) / (n1 * n2) + (d * d) / (2 * dfD));
    const tCritD = jStat.studentt.inv(1 - alpha / 2, dfD);
    const ciDLower = d - tCritD * seD;
    const ciDUpper = d + tCritD * seD;

    const se1 = Math.sqrt(var1 / n1);
    const se2 = Math.sqrt(var2 / n2);
    const tCrit1 = jStat.studentt.inv(1 - alpha / 2, n1 - 1);
    const tCrit2 = jStat.studentt.inv(1 - alpha / 2, n2 - 1);
    const ci1Lower = mean1 - tCrit1 * se1;
    const ci1Upper = mean1 + tCrit1 * se1;
    const ci2Lower = mean2 - tCrit2 * se2;
    const ci2Upper = mean2 + tCrit2 * se2;

    const summaries = [
      {
        name: g1.name,
        n: n1,
        measure: "Mean",
        value: mean1,
        ci95: { lower: ci1Lower, upper: ci1Upper },
      },
      {
        name: g2.name,
        n: n2,
        measure: "Mean",
        value: mean2,
        ci95: { lower: ci2Lower, upper: ci2Upper },
      },
    ];

    const pairwiseEffects = [
      {
        groups: [g1.name, g2.name],
        value: d,
        measure: "Cohen's d",
        ci95: { lower: ciDLower, upper: ciDUpper },
        statistic: tStatistic,
        statisticName: "t",
        pValue,
      },
    ];

    const descriptionString =
      `Welch's t-test (n1=${n1}, n2=${n2}) — ` +
      `t(${df.toFixed(2)}) = ${tStatistic.toFixed(2)}, p = ${pValue.toFixed(
        3
      )}, ` +
      `mean diff = ${diff.toFixed(2)} [${ciDiffLower.toFixed(
        2
      )}, ${ciDiffUpper.toFixed(2)}], ` +
      `d = ${d.toFixed(2)} [${ciDLower.toFixed(2)}, ${ciDUpper.toFixed(2)}].`;

    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>
          Welch&apos;s t-test (n₁ = {n1}, n₂ = {n2})
        </div>
        <div>
          t({df.toFixed(2)}) = {tStatistic.toFixed(2)}, p = {pValue.toFixed(3)}
        </div>
        <div>
          Mean difference = {diff.toFixed(2)} [{ciDiffLower.toFixed(2)},{" "}
          {ciDiffUpper.toFixed(2)}]
        </div>
        <div>
          Cohen&apos;s d = {d.toFixed(2)} [{ciDLower.toFixed(2)},{" "}
          {ciDUpper.toFixed(2)}]
        </div>
      </div>
    );

    return {
      statisticName: "t",
      statistic: tStatistic,
      df,
      pValue,
      difference: {
        value: diff,
        ci95: { lower: ciDiffLower, upper: ciDiffUpper },
      },
      summaries,
      summariesTitle: "Means & 95% CI",
      pairwiseEffects,
      pairwiseTitle: "Effect Size (Cohen's d)",
      descriptionString,
      descriptionJSX,
      metric: { name: "Cohen's d", symbol: "d", value: d },
    };
  },
  metric: { measure: "Cohen's d", symbol: "d" },
};
