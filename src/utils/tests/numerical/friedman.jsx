export const friedmanTest = {
  id: "friedman-test",
  label: "Friedman Test",
  description:
    "Non-parametric test for comparing more than two paired samples.",
  isApplicable: (count) => count >= 3,
  variableType: VariableTypes.NUMERICAL,
  run: (groups) => {
    const k = groups.length;
    const n = groups[0].values.length;
    const ranks = [];

    for (let i = 0; i < n; i++) {
      const row = groups.map((g) => g.values[i]);
      ranks.push(jStat.rank(row));
    }

    const rankSums = Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < k; j++) {
        rankSums[j] += ranks[i][j];
      }
    }

    const chiSquare =
      (12 / (n * k * (k + 1))) *
        rankSums.reduce((sum, Rj) => sum + Math.pow(Rj, 2), 0) -
      3 * n * (k + 1);

    const df = k - 1;
    const pValue = 1 - jStat.chisquare.cdf(chiSquare, df);

    return {
      statisticName: "χ²",
      statistic: chiSquare,
      pValue,
      df,
      descriptionString: `Friedman test (n=${n}, k=${k}): χ²(${df}) = ${chiSquare.toFixed(
        2
      )}, p = ${pValue.toFixed(3)}`,
    };
  },
};
