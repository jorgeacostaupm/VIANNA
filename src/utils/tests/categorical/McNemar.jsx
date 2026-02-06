import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const mcnemarTest = {
  id: "mcnemar-test",
  label: "McNemar",
  description: "Paired test for 2x2 categorical outcomes.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.CATEGORICAL,
  category: "Categóricas — Pareadas",
  run: (groups) => {
    const [g1, g2] = groups;
    if (g1.values.length !== g2.values.length) {
      throw new Error("McNemar test requires paired samples.");
    }
    const categories = [...new Set(groups.flatMap((g) => g.values))].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
    if (categories.length !== 2) {
      throw new Error("McNemar test requires exactly 2 categories.");
    }
    const [cat0, cat1] = categories;

    let b = 0;
    let c = 0;
    for (let i = 0; i < g1.values.length; i++) {
      const v1 = g1.values[i];
      const v2 = g2.values[i];
      if (v1 === cat0 && v2 === cat1) b++;
      if (v1 === cat1 && v2 === cat0) c++;
    }

    const denom = b + c;
    if (denom === 0) {
      throw new Error("McNemar test requires discordant pairs.");
    }
    const chi2 = Math.pow(Math.abs(b - c) - 1, 2) / denom;
    const pValue = 1 - jStat.chisquare.cdf(chi2, 1);

    const correction = b === 0 || c === 0 ? 0.5 : 0;
    const logOr = Math.log((b + correction) / (c + correction));
    const se = Math.sqrt(1 / (b + correction) + 1 / (c + correction));
    const zCrit = jStat.normal.inv(0.975, 0, 1);
    const ciLog = { lower: logOr - zCrit * se, upper: logOr + zCrit * se };

    const pairwiseEffects = [
      {
        groups: [g1.name, g2.name],
        value: logOr,
        measure: "log OR",
        ci95: ciLog,
        statistic: chi2,
        statisticName: "χ²",
        pValue,
      },
    ];

    const descriptionString = `McNemar test: χ²(1) = ${chi2.toFixed(
      2
    )}, p = ${pValue.toFixed(3)}.`;
    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>McNemar test</div>
        <div>
          χ²(1) = {chi2.toFixed(2)}, p = {pValue.toFixed(3)}
        </div>
        <div>
          b = {b}, c = {c}
        </div>
      </div>
    );

    return {
      statisticName: "χ²",
      statistic: chi2,
      pValue,
      summaries: [],
      pairwiseEffects,
      pairwiseTitle: "Effect Size (log OR)",
      descriptionString,
      descriptionJSX,
      metric: { name: "log OR", symbol: "logOR", value: logOr },
    };
  },
  metric: { measure: "log OR", symbol: "logOR" },
};
