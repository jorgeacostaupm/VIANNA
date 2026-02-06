import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

function orderCategories(categories) {
  const allNumeric = categories.every((c) => typeof c === "number");
  if (allNumeric) return categories.slice().sort((a, b) => a - b);
  return categories.slice().sort((a, b) => String(a).localeCompare(String(b)));
}

function get2x2(groups) {
  const categories = orderCategories([
    ...new Set(groups.flatMap((g) => g.values)),
  ]);
  if (groups.length !== 2 || categories.length !== 2) {
    throw new Error("This test requires exactly 2 groups and 2 categories.");
  }
  const [cat0, cat1] = categories;
  const a = groups[0].values.filter((v) => v === cat0).length;
  const b = groups[0].values.filter((v) => v === cat1).length;
  const c = groups[1].values.filter((v) => v === cat0).length;
  const d = groups[1].values.filter((v) => v === cat1).length;
  return { a, b, c, d, cat0, cat1 };
}

function wilsonInterval(p, n, z = 1.96) {
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half =
    (z *
      Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) /
    denom;
  return { lower: Math.max(0, center - half), upper: Math.min(1, center + half) };
}

export const twoProportionZ = {
  id: "two-proportion-z",
  label: "Two-proportion z-test",
  description: "Test for difference in proportions between two groups.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.CATEGORICAL,
  category: "Binarias/Proporciones",
  run: (groups) => {
    const { a, b, c, d, cat0, cat1 } = get2x2(groups);
    const n1 = a + b;
    const n2 = c + d;
    const p1 = a / n1;
    const p2 = c / n2;
    const p = (a + c) / (n1 + n2);
    const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
    if (!Number.isFinite(se) || se === 0) {
      throw new Error("Two-proportion z-test requires variation in outcomes.");
    }
    const z = (p1 - p2) / se;
    const pValue = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));
    const zCrit = jStat.normal.inv(0.975, 0, 1);
    const seDiff = Math.sqrt(
      (p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2
    );
    const diff = p1 - p2;
    const ci = { lower: diff - zCrit * seDiff, upper: diff + zCrit * seDiff };

    const pairwiseEffects = [
      {
        groups: [groups[0].name, groups[1].name],
        value: diff,
        measure: "Proportion diff",
        ci95: ci,
        statistic: z,
        statisticName: "z",
        pValue,
      },
    ];

    const descriptionString = `Two-proportion z-test (${cat0} vs ${cat1}): z=${z.toFixed(
      2
    )}, p=${pValue.toFixed(3)}, diff=${diff.toFixed(3)}.`;
    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>Two-proportion z-test</div>
        <div>
          z = {z.toFixed(2)}, p = {pValue.toFixed(3)}
        </div>
        <div>
          diff = {diff.toFixed(3)} [{ci.lower.toFixed(3)},{" "}
          {ci.upper.toFixed(3)}]
        </div>
      </div>
    );

    return {
      statisticName: "z",
      statistic: z,
      pValue,
      summaries: [],
      pairwiseEffects,
      pairwiseTitle: "Effect Size (Proportion diff)",
      descriptionString,
      descriptionJSX,
      metric: { name: "Proportion diff", symbol: "Δp", value: diff },
    };
  },
  metric: { measure: "Proportion diff", symbol: "Δp" },
};

export const newcombeDiff = {
  id: "newcombe-diff",
  label: "Newcombe/Wilson Diff",
  description: "Difference of proportions with Newcombe/Wilson CI.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.CATEGORICAL,
  category: "Binarias/Proporciones",
  run: (groups) => {
    const { a, b, c, d, cat0 } = get2x2(groups);
    const n1 = a + b;
    const n2 = c + d;
    const p1 = a / n1;
    const p2 = c / n2;
    const diff = p1 - p2;
    const ci1 = wilsonInterval(p1, n1);
    const ci2 = wilsonInterval(p2, n2);
    const ci = { lower: ci1.lower - ci2.upper, upper: ci1.upper - ci2.lower };

    const pairwiseEffects = [
      {
        groups: [groups[0].name, groups[1].name],
        value: diff,
        measure: "Proportion diff",
        ci95: ci,
        statistic: diff,
        statisticName: "Δp",
        pValue: NaN,
      },
    ];

    const descriptionString = `Newcombe/Wilson CI for ${cat0}: diff=${diff.toFixed(
      3
    )} [${ci.lower.toFixed(3)}, ${ci.upper.toFixed(3)}].`;
    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>Newcombe/Wilson CI</div>
        <div>
          diff = {diff.toFixed(3)} [{ci.lower.toFixed(3)},{" "}
          {ci.upper.toFixed(3)}]
        </div>
      </div>
    );

    return {
      statisticName: "Δp",
      statistic: diff,
      pValue: NaN,
      summaries: [],
      pairwiseEffects,
      pairwiseTitle: "Effect Size (Proportion diff)",
      descriptionString,
      descriptionJSX,
      metric: { name: "Proportion diff", symbol: "Δp", value: diff },
    };
  },
  metric: { measure: "Proportion diff", symbol: "Δp" },
};

export const oddsRatioTest = {
  id: "odds-ratio",
  label: "Odds Ratio (2x2)",
  description: "Odds ratio with 95% CI for 2x2 tables.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.CATEGORICAL,
  category: "Binarias/Proporciones",
  run: (groups) => {
    const { a, b, c, d } = get2x2(groups);
    const correction = a === 0 || b === 0 || c === 0 || d === 0 ? 0.5 : 0;
    const a2 = a + correction;
    const b2 = b + correction;
    const c2 = c + correction;
    const d2 = d + correction;
    const or = (a2 * d2) / (b2 * c2);
    const logOr = Math.log(or);
    const se = Math.sqrt(1 / a2 + 1 / b2 + 1 / c2 + 1 / d2);
    const zCrit = jStat.normal.inv(0.975, 0, 1);
    const ciLog = { lower: logOr - zCrit * se, upper: logOr + zCrit * se };

    const pairwiseEffects = [
      {
        groups: [groups[0].name, groups[1].name],
        value: logOr,
        measure: "log OR",
        ci95: ciLog,
        statistic: logOr,
        statisticName: "log OR",
        pValue: NaN,
      },
    ];

    const descriptionString = `Odds ratio: OR=${or.toFixed(
      3
    )} (log OR CI=[${ciLog.lower.toFixed(3)}, ${ciLog.upper.toFixed(3)}]).`;
    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>Odds ratio (2x2)</div>
        <div>
          OR = {or.toFixed(3)} (log OR CI [{ciLog.lower.toFixed(3)},{" "}
          {ciLog.upper.toFixed(3)}])
        </div>
      </div>
    );

    return {
      statisticName: "OR",
      statistic: or,
      pValue: NaN,
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

export const riskRatioTest = {
  id: "risk-ratio",
  label: "Risk Ratio (2x2)",
  description: "Risk ratio with 95% CI for 2x2 tables.",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.CATEGORICAL,
  category: "Binarias/Proporciones",
  run: (groups) => {
    const { a, b, c, d } = get2x2(groups);
    const needsCorrection = a === 0 || b === 0 || c === 0 || d === 0;
    const a2 = a + (needsCorrection ? 0.5 : 0);
    const b2 = b + (needsCorrection ? 0.5 : 0);
    const c2 = c + (needsCorrection ? 0.5 : 0);
    const d2 = d + (needsCorrection ? 0.5 : 0);
    const n1 = a2 + b2;
    const n2 = c2 + d2;
    const p1 = a2 / n1;
    const p2 = c2 / n2;
    const rr = p1 / p2;
    const logRr = Math.log(rr);
    const se = Math.sqrt(1 / a2 - 1 / n1 + 1 / c2 - 1 / n2);
    const zCrit = jStat.normal.inv(0.975, 0, 1);
    const ciLog = { lower: logRr - zCrit * se, upper: logRr + zCrit * se };

    const pairwiseEffects = [
      {
        groups: [groups[0].name, groups[1].name],
        value: logRr,
        measure: "log RR",
        ci95: ciLog,
        statistic: logRr,
        statisticName: "log RR",
        pValue: NaN,
      },
    ];

    const descriptionString = `Risk ratio: RR=${rr.toFixed(
      3
    )} (log RR CI=[${ciLog.lower.toFixed(3)}, ${ciLog.upper.toFixed(3)}]).`;
    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>Risk ratio (2x2)</div>
        <div>
          RR = {rr.toFixed(3)} (log RR CI [{ciLog.lower.toFixed(3)},{" "}
          {ciLog.upper.toFixed(3)}])
        </div>
      </div>
    );

    return {
      statisticName: "RR",
      statistic: rr,
      pValue: NaN,
      summaries: [],
      pairwiseEffects,
      pairwiseTitle: "Effect Size (log RR)",
      descriptionString,
      descriptionJSX,
      metric: { name: "log RR", symbol: "logRR", value: logRr },
    };
  },
  metric: { measure: "log RR", symbol: "logRR" },
};
