import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const repeatedMeasuresANOVA = {
  id: "anova-repeated-measures",
  label: "Repeated Measures ANOVA",
  description:
    "Comparison of k ≥ 2 related conditions (within-subjects), assuming normality and sphericity.",
  isApplicable: (count) => count >= 2,
  variableType: VariableTypes.NUMERICAL,
  run: (groups) => {
    const alpha = 0.05;
    const k = groups.length;
    const n = groups[0].values.length;

    const subjectMeans = Array(n).fill(0);
    const conditionMeans = groups.map((g) => jStat.mean(g.values));
    const grandMean = jStat.mean(groups.flatMap((g) => g.values));

    const ssConditions =
      n *
      conditionMeans.reduce((sum, m) => sum + Math.pow(m - grandMean, 2), 0);

    for (let i = 0; i < n; i++) {
      subjectMeans[i] = jStat.mean(groups.map((g) => g.values[i]));
    }

    const ssSubjects =
      k * subjectMeans.reduce((sum, m) => sum + Math.pow(m - grandMean, 2), 0);

    const ssTotal = groups.reduce(
      (sum, g) =>
        sum + g.values.reduce((s, v) => s + Math.pow(v - grandMean, 2), 0),
      0
    );

    const ssError = ssTotal - ssConditions - ssSubjects;

    const dfConditions = k - 1;
    const dfError = (n - 1) * dfConditions;

    const msConditions = ssConditions / dfConditions;
    const msError = ssError / dfError;

    const F = msConditions / msError;
    const pValue = 1 - jStat.centralF.cdf(F, dfConditions, dfError);

    const etaSquared = ssConditions / (ssConditions + ssError);

    const descriptionString =
      `Repeated Measures ANOVA (n=${n}, k=${k}) ` +
      `F(${dfConditions},${dfError}) = ${F.toFixed(2)}, ` +
      `p = ${pValue.toFixed(3)}, η² = ${etaSquared.toFixed(3)}`;

    const summaries = groups.map((g, i) => {
      const m = conditionMeans[i];
      const sd = jStat.stdev(g.values, true);
      const se = sd / Math.sqrt(n);
      const tCrit = jStat.studentt.inv(1 - alpha / 2, n - 1);
      return {
        name: g.name,
        n,
        measure: "Mean",
        value: m,
        variance: Math.pow(sd, 2),
        intervalMeasure: "CI95%",
        ci95: {
          lower: m - tCrit * se,
          upper: m + tCrit * se,
        },
      };
    });

    return {
      statisticName: "F",
      statistic: F,
      pValue,
      etaSquared,
      df: { df1: dfConditions, df2: dfError },
      summaries,
      descriptionString,
      metric: { name: "eta squared", symbol: "η²", value: etaSquared },
    };
  },
};
