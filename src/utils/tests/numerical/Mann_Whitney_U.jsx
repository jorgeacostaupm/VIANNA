import * as ss from "simple-statistics";
import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const mannWhitney = {
  id: "mann-whitney-u",
  label: "Mann–Whitney U",
  description:
    "Comparison of two independent groups, non-parametric, with medians, 95% bootstrap CI, U statistic, p-value, and rank-biserial r",
  isApplicable: (count) => count === 2,
  variableType: VariableTypes.NUMERICAL,
  category: "Numéricas — Independientes",
  run: (groups) => {
    const alpha = 0.05;
    const B = 1000;
    const [g1, g2] = groups;
    const n1 = g1.values.length;
    const n2 = g2.values.length;
    if (n1 < 2 || n2 < 2) {
      throw new Error("Mann–Whitney U requires at least 2 observations per group.");
    }
    const N = n1 + n2;

    function medianBootstrapCI(values) {
      const n = values.length;
      const bootMeds = [];
      for (let b = 0; b < B; b++) {
        const sample = [];
        for (let i = 0; i < n; i++) {
          sample.push(values[Math.floor(Math.random() * n)]);
        }
        bootMeds.push(ss.median(sample));
      }
      bootMeds.sort((a, b) => a - b);
      const lowerIdx = Math.floor((alpha / 2) * B);
      const upperIdx = Math.floor((1 - alpha / 2) * B);
      return { lower: bootMeds[lowerIdx], upper: bootMeds[upperIdx] };
    }

    const groupMedians = groups.map((g) => {
      const sorted = g.values.slice().sort((a, b) => a - b);
      const m = ss.median(sorted);
      const { lower, upper } = medianBootstrapCI(sorted);
      return { m, lower, upper };
    });

    const allValues = groups.flatMap((g) => g.values);
    const ranked = allValues
      .map((v, i) => ({ value: v, idx: i }))
      .sort((a, b) => a.value - b.value);
    const ranks = Array(N);
    let tieSum = 0;
    for (let i = 0; i < N; ) {
      let j = i + 1;
      while (j < N && ranked[j].value === ranked[i].value) j++;
      const t = j - i;
      if (t > 1) tieSum += t * t * t - t;
      const avgRank = (i + 1 + j) / 2;
      for (let t = i; t < j; t++) ranks[ranked[t].idx] = avgRank;
      i = j;
    }

    let R1 = 0;
    for (let i = 0; i < n1; i++) R1 += ranks[i];
    const U1 = R1 - (n1 * (n1 + 1)) / 2;
    const U2 = n1 * n2 - U1;
    const U = U1;

    const meanU = (n1 * n2) / 2;
    const tieCorrection =
      N > 1 ? tieSum / (N * (N - 1)) : 0;
    const varU =
      (n1 * n2 * (N + 1 - tieCorrection)) / 12;
    if (!Number.isFinite(varU) || varU <= 0) {
      throw new Error("Mann–Whitney U failed due to invalid variance.");
    }
    const z = (U - meanU) / Math.sqrt(varU);
    const pValue = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));

    const r = z / Math.sqrt(N);
    const SE_r = 1 / Math.sqrt(N);
    const zCrit = jStat.normal.inv(1 - alpha / 2, 0, 1);
    const rLower = Math.max(-1, r - zCrit * SE_r);
    const rUpper = Math.min(1, r + zCrit * SE_r);

    const summaries = [
      {
        name: g1.name,
        n: n1,
        measure: "Median",
        value: groupMedians[0].m,
        ci95: { lower: groupMedians[0].lower, upper: groupMedians[0].upper },
      },
      {
        name: g2.name,
        n: n2,
        measure: "Median",
        value: groupMedians[1].m,
        ci95: { lower: groupMedians[1].lower, upper: groupMedians[1].upper },
      },
    ];

    const pairwiseEffects = [
      {
        groups: [g1.name, g2.name],
        value: r,
        measure: "Rank-biserial r",
        ci95: { lower: rLower, upper: rUpper },
        statistic: U,
        statisticName: "U",
        pValue,
      },
    ];

    const descriptionString = `Mann–Whitney U test (n1=${n1}, n2=${n2}) — U1=${U1.toFixed(
      2
    )}, U2=${U2.toFixed(2)}, z=${z.toFixed(2)}, p=${pValue.toFixed(
      3
    )}, r=${r.toFixed(2)}.`;

    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>
          Mann–Whitney U test (n₁ = {n1}, n₂ = {n2})
        </div>
        <div>
          U₁ = {U1.toFixed(2)}, U₂ = {U2.toFixed(2)}, z = {z.toFixed(2)}, p ={" "}
          {pValue.toFixed(3)}, r = {r.toFixed(2)}
        </div>
      </div>
    );

    return {
      statisticName: "U",
      statistic: U,
      pValue,
      summaries,
      summariesTitle: "Medians & 95% Bootstrap CI",
      pairwiseEffects,
      pairwiseTitle: "Effect Size (Rank-biserial r)",
      descriptionString,
      descriptionJSX,
      metric: { name: "Rank-biserial r", symbol: "r", value: r },
    };
  },
  metric: { measure: "Rank-biserial r", symbol: "r" },
};
