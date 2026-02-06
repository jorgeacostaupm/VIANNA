import * as ss from "simple-statistics";
import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const kruskalWallis = {
  id: "kruskal-wallis-test",
  label: "Kruskal–Wallis",
  description:
    "Comparison of k ≥ 2 independent groups, non-parametric, with medians, IQR and epsilon H squared",
  isApplicable: (count) => count >= 2,
  variableType: VariableTypes.NUMERICAL,
  category: "Numéricas — Independientes",
  run: (groups) => {
    const alpha = 0.05;
    const B = 1000; // número de réplicas bootstrap para CI de mediana
    const k = groups.length;
    const groupNames = groups.map((g) => g.name);
    const groupSizes = groups.map((g) => g.values.length);
    const N = groupSizes.reduce((sum, n) => sum + n, 0);

    // función helper para CI bootstrap de la mediana
    function medianBootstrapCI(values) {
      const n = values.length;
      const bootMeds = [];
      for (let b = 0; b < B; b++) {
        const sample = [];
        for (let i = 0; i < n; i++) {
          sample.push(values[Math.floor(Math.random() * n)]);
        }
        sample.sort((a, b) => a - b);
        bootMeds.push(ss.median(sample));
      }
      bootMeds.sort((a, b) => a - b);
      const lowerIdx = Math.floor((alpha / 2) * B);
      const upperIdx = Math.floor((1 - alpha / 2) * B);
      return {
        lower: bootMeds[lowerIdx],
        upper: bootMeds[upperIdx],
      };
    }

    // calcular medianas, cuartiles y sus CIs
    const groupMedians = groups.map((g) => {
      const sorted = g.values.slice().sort((a, b) => a - b);
      const m = ss.median(sorted);
      const q1 = ss.quantile(sorted, 0.25);
      const q3 = ss.quantile(sorted, 0.75);
      const { lower: lowerMedian, upper: upperMedian } =
        medianBootstrapCI(sorted);
      return { m, q1, q3, lowerMedian, upperMedian };
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
    const Ri = [];
    let idx = 0;
    for (let i = 0; i < k; i++) {
      let sumRi = 0;
      for (let j = 0; j < groupSizes[i]; j++) sumRi += ranks[idx++];
      Ri.push(sumRi);
    }

    const tieCorrection = 1 - tieSum / (N * N * N - N);
    if (tieCorrection <= 0) {
      throw new Error("Kruskal–Wallis requires variability across groups.");
    }
    const HRaw =
      (12 / (N * (N + 1))) *
        Ri.reduce((sum, r, i) => sum + (r * r) / groupSizes[i], 0) -
      3 * (N + 1);
    const H = HRaw / tieCorrection;
    const df = k - 1;
    const pValue = 1 - jStat.chisquare.cdf(H, df);
    const epsilonHSquared = Math.max(0, (H - df) / (N - k));

    const summaries = groups.map((g, i) => ({
      name: g.name,
      n: groupSizes[i],
      measure: "Median",
      value: groupMedians[i].m,
      ci95: {
        lower: parseFloat(groupMedians[i].lowerMedian.toFixed(3)),
        upper: parseFloat(groupMedians[i].upperMedian.toFixed(3)),
      },
    }));

    const comparisons = (k * (k - 1)) / 2;
    const pairwiseEffects = [];
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const RiBar_i = Ri[i] / groupSizes[i];
        const RiBar_j = Ri[j] / groupSizes[j];
        const z =
          (RiBar_i - RiBar_j) /
          Math.sqrt(
            ((N * (N + 1)) / 12) *
              (1 / groupSizes[i] + 1 / groupSizes[j]) *
              tieCorrection
          );
        const pRaw = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));
        const pAdj = Math.min(pRaw * comparisons, 1);

        // cálculo de r
        const r = z / Math.sqrt(N);

        // **nuevo**: cálculo del IC al 95%
        const SE_r = 1 / Math.sqrt(N);
        const zCrit = jStat.normal.inv(1 - alpha / 2, 0, 1);
        const lower = r - zCrit * SE_r;
        const upper = r + zCrit * SE_r;

        pairwiseEffects.push({
          groups: [groupNames[i], groupNames[j]],
          value: r,
          measure: "Rank-biserial r",
          ci95: {
            lower: parseFloat(lower.toFixed(3)),
            upper: parseFloat(upper.toFixed(3)),
          },
          statistic: z,
          statisticName: "Z-Statistic",
          pValue: pAdj,
        });
      }
    }

    const descriptionString =
      `Kruskal–Wallis of ${k} groups (N=${N}) — H(${df}) = ${H.toFixed(
        2
      )}, p = ${pValue.toFixed(3)}, εH² = ${epsilonHSquared.toFixed(3)}.` +
      ` Tested groups: ${groupNames
        .map(
          (name, i) =>
            `${name} (n=${groupSizes[i]}, median=${groupMedians[i].m.toFixed(
              2
            )}, IQR=${groupMedians[i].q1.toFixed(2)}–${groupMedians[
              i
            ].q3.toFixed(2)})`
        )
        .join("; ")}`;

    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>
          Kruskal–Wallis test of {k} groups (N={N})
        </div>
        <div>
          H({df}) = {H.toFixed(2)}, p = {pValue.toFixed(3)}, ε<sub>H</sub>² ={" "}
          {epsilonHSquared.toFixed(3)}
        </div>
        <div>Tested groups:</div>
        <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
          {groupNames.map((name, i) => (
            <li key={i}>
              {name} (n={groupSizes[i]}, median={groupMedians[i].m.toFixed(2)},
              IQR={groupMedians[i].q1.toFixed(2)}–
              {groupMedians[i].q3.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    );

    return {
      statisticName: "H",
      statistic: H,
      df,
      pValue,
      epsilonHSquared,
      summaries,
      summariesTitle: "Medians & Bootstrap 95% CI",
      pairwiseEffects,
      pairwiseTitle: "Pairwise Effect Sizes (Rank-biserial r)",
      descriptionString,
      descriptionJSX,
      metric: {
        name: "epsilon H squared",
        symbol: "εH²",
        value: epsilonHSquared,
      },
    };
  },
  metric: { measure: "Epsilon H Squared", symbol: "εH²" },
};
