import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const pairedTTest = {
  id: "t-test-paired",
  label: "Paired t-test",
  description:
    "Comparison of two related groups (paired samples) assuming normality of differences.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.NUMERICAL,
  category: "Numéricas — Pareadas/Repetidas",
  run: (groups) => {
    const [group1, group2] = groups;
    if (group1.values.length !== group2.values.length) {
      throw new Error("Paired t-test requires paired samples.");
    }
    const n = group1.values.length;
    if (n < 2) {
      throw new Error("Paired t-test requires at least 2 paired observations.");
    }
    const alpha = 0.05;

    const differences = group1.values.map((v, i) => v - group2.values[i]);
    const meanDiff = jStat.mean(differences);
    const sdDiff = jStat.stdev(differences, true);
    if (!Number.isFinite(sdDiff) || sdDiff === 0) {
      throw new Error("Paired t-test requires non-zero variance of differences.");
    }
    const seDiff = sdDiff / Math.sqrt(n);
    const tStat = meanDiff / seDiff;
    const df = n - 1;
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df));
    const tCrit = jStat.studentt.inv(1 - alpha / 2, df);

    const ci95 = {
      lower: meanDiff - tCrit * seDiff,
      upper: meanDiff + tCrit * seDiff,
    };

    const dz = meanDiff / sdDiff;
    const seDz = Math.sqrt(1 / n + (dz * dz) / (2 * (n - 1)));
    const ciDz = {
      lower: dz - tCrit * seDz,
      upper: dz + tCrit * seDz,
    };

    return {
      statisticName: "t",
      statistic: tStat,
      pValue,
      df,
      ci95,
      summaries: [
        {
          name: `${group1.name} – ${group2.name}`,
          n,
          measure: "Mean difference",
          value: meanDiff,
          intervalMeasure: "CI95%",
          ci95,
        },
      ],
      summariesTitle: "Mean Difference & 95% CI",
      pairwiseEffects: [
        {
          groups: [group1.name, group2.name],
          value: dz,
          measure: "Cohen's dz",
          ci95: ciDz,
          statistic: tStat,
          statisticName: "t",
          pValue,
        },
      ],
      pairwiseTitle: "Effect Size (Cohen's dz)",
      descriptionString: `Paired t-test (n=${n}): t(${df}) = ${tStat.toFixed(
        2
      )}, p = ${pValue.toFixed(3)}, CI95% = [${ci95.lower.toFixed(
        2
      )}, ${ci95.upper.toFixed(2)}], dz = ${dz.toFixed(2)}.`,
      metric: { name: "Cohen's dz", symbol: "dz", value: dz },
    };
  },
  metric: { measure: "Cohen's dz", symbol: "dz" },
};
