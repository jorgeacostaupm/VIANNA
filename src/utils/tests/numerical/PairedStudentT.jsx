import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const pairedTTest = {
  id: "t-test-paired",
  label: "Paired t-test",
  description:
    "Comparison of two related groups (paired samples) assuming normality of differences.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.NUMERICAL,
  run: (groups) => {
    const [group1, group2] = groups;
    const n = group1.values.length;
    const alpha = 0.05;

    const differences = group1.values.map((v, i) => v - group2.values[i]);
    const meanDiff = jStat.mean(differences);
    const sdDiff = jStat.stdev(differences, true);
    const seDiff = sdDiff / Math.sqrt(n);
    const tStat = meanDiff / seDiff;
    const df = n - 1;
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df));
    const tCrit = jStat.studentt.inv(1 - alpha / 2, df);

    const ci95 = {
      lower: meanDiff - tCrit * seDiff,
      upper: meanDiff + tCrit * seDiff,
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
      descriptionString: `Paired t-test (n=${n}): t(${df}) = ${tStat.toFixed(
        2
      )}, p = ${pValue.toFixed(3)}, CI95% = [${ci95.lower.toFixed(
        2
      )}, ${ci95.upper.toFixed(2)}]`,
    };
  },
};
