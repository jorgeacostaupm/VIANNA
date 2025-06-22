import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const welschAnova = {
  id: "anova-welch",
  label: "Welch ANOVA",
  description:
    "Comparison of k ≥ 2 independent groups, robust to unequal variances, with CIs for means and Cohen’s d",
  isApplicable: (count) => count >= 2,
  variableType: VariableTypes.NUMERICAL,
  run: (groups) => {
    const alpha = 0.05;
    const k = groups.length;
    const groupNames = groups.map((g) => g.name);
    const groupSizes = groups.map((g) => g.values.length);
    const N = groupSizes.reduce((sum, n) => sum + n, 0);
    const groupMeans = groups.map((g) => jStat.mean(g.values));
    const groupVars = groups.map((g) => jStat.variance(g.values));
    const weights = groupSizes.map((n, i) => n / groupVars[i]);
    const W = weights.reduce((sum, w) => sum + w, 0);
    const weightedMean =
      groupMeans.reduce((sum, m, i) => sum + weights[i] * m, 0) / W;
    const df1 = k - 1;
    const between =
      weights.reduce(
        (sum, w, i) => sum + w * Math.pow(groupMeans[i] - weightedMean, 2),
        0
      ) / df1;
    const corrDenominator = groups.reduce(
      (sum, _, i) =>
        sum + Math.pow(1 - weights[i] / W, 2) / (groupSizes[i] - 1),
      0
    );
    const correction = ((2 * (k - 2)) / (k * k - 1)) * corrDenominator;
    const FValue = between / (1 + correction);
    const df2 = (k * k - 1) / (3 * corrDenominator);
    const pValue = 1 - jStat.centralF.cdf(FValue, df1, df2);
    const epsilonSquared = (FValue * df1 - df1) / (FValue * df1 + df2);
    const summaries = groups.map((g, i) => {
      const se = Math.sqrt(groupVars[i] / groupSizes[i]);
      const sd = Math.sqrt(groupVars[i]);
      const tCrit = jStat.studentt.inv(1 - alpha / 2, groupSizes[i] - 1);
      const m = groupMeans[i];
      return {
        name: g.name,
        n: groupSizes[i],
        measure: "Mean",
        value: m,
        sd,
        variance: groupVars[i],
        ci95: {
          lower: m - tCrit * se,
          upper: m + tCrit * se,
        },
      };
    });
    const pairwiseEffects = [];
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const n1 = groupSizes[i],
          n2 = groupSizes[j];
        const v1 = groupVars[i],
          v2 = groupVars[j];
        const m1 = groupMeans[i],
          m2 = groupMeans[j];
        const diff = m1 - m2;
        const seDiff = Math.sqrt(v1 / n1 + v2 / n2);
        const tStat = diff / seDiff;
        const dfPair =
          Math.pow(v1 / n1 + v2 / n2, 2) /
          (Math.pow(v1 / n1, 2) / (n1 - 1) + Math.pow(v2 / n2, 2) / (n2 - 1));
        const pPair = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), dfPair));
        const pooledSD = Math.sqrt((v1 + v2) / 2);
        const d = diff / pooledSD;
        const seD = Math.sqrt(
          (n1 + n2) / (n1 * n2) + (d * d) / (2 * (n1 + n2 - 2))
        );
        const tCritD = jStat.studentt.inv(1 - alpha / 2, n1 + n2 - 2);
        pairwiseEffects.push({
          groups: [groupNames[i], groupNames[j]],
          value: d,
          measure: "Cohen’s d",
          ci95: {
            lower: d - tCritD * seD,
            upper: d + tCritD * seD,
          },
          statistic: tStat,
          statisticName: "T-Statistic",
          pValue: pPair,
        });
      }
    }
    const descriptionString =
      `Welch’s ANOVA of ${k} groups (N=${N}) — F(${df1}, ${df2.toFixed(
        1
      )}) = ${FValue.toFixed(2)}, p = ${pValue.toFixed(
        3
      )}, ε² = ${epsilonSquared.toFixed(3)}.` +
      ` Tested groups: ${groupNames
        .map(
          (name, i) =>
            `${name} (n=${groupSizes[i]}, x̄=${groupMeans[i].toFixed(
              3
            )}, σ²=${groupVars[i].toFixed(3)})`
        )
        .join("; ")}`;

    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>
          Welch’s ANOVA of {k} groups (N={N})
        </div>
        <div>
          F({df1}, {df2.toFixed(1)}) = {FValue.toFixed(2)}, p ={" "}
          {pValue.toFixed(3)}, ε² = {epsilonSquared.toFixed(3)}
        </div>
        <div>Tested groups:</div>
        <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
          {groupNames.map((name, i) => (
            <li key={i}>
              {name} (n={groupSizes[i]}, x̄={groupMeans[i].toFixed(3)}, σ²=
              {groupVars[i].toFixed(3)})
            </li>
          ))}
        </ul>
      </div>
    );

    return {
      statisticName: "F",
      statistic: FValue,
      df1,
      df2,
      pValue,
      epsilonSquared,
      summaries,
      summariesTitle: "Means & 95% CI",
      pairwiseEffects,
      pairwiseTitle: "Pairwise Effect Sizes (Cohen’s d)",
      descriptionString,
      descriptionJSX,
      metric: {
        name: "epsilon squared",
        symbol: "ε²",
        value: epsilonSquared,
      },
    };
  },
  metric: { measure: "Epsilon Squared", symbol: "ε²" },
};
