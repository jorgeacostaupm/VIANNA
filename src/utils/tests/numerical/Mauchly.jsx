import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

function covarianceMatrix(data) {
  const n = data.length;
  const k = data[0].length;
  const means = Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < k; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < k; j++) means[j] /= n;

  const cov = Array.from({ length: k }, () => Array(k).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < k; j++) {
      for (let l = 0; l < k; l++) {
        cov[j][l] += (data[i][j] - means[j]) * (data[i][l] - means[l]);
      }
    }
  }
  const denom = n - 1;
  for (let j = 0; j < k; j++) {
    for (let l = 0; l < k; l++) {
      cov[j][l] /= denom;
    }
  }
  return cov;
}

function trace(matrix) {
  return matrix.reduce((s, row, i) => s + row[i], 0);
}

function traceSquare(matrix) {
  const k = matrix.length;
  let sum = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      sum += matrix[i][j] * matrix[i][j];
    }
  }
  return sum;
}

export const mauchlyTest = {
  id: "mauchly-test",
  label: "Mauchly's test",
  description: "Sphericity test for repeated-measures designs.",
  isApplicable: (count) => count >= 3,
  variableType: VariableTypes.NUMERICAL,
  category: "Numéricas — Pareadas/Repetidas",
  run: (groups) => {
    const k = groups.length;
    const n = groups[0].values.length;
    if (groups.some((g) => g.values.length !== n)) {
      throw new Error("Mauchly's test requires equal-length groups.");
    }
    if (n < 3) {
      throw new Error("Mauchly's test requires at least 3 observations.");
    }

    const data = Array.from({ length: n }, (_, i) =>
      groups.map((g) => g.values[i])
    );
    const S = covarianceMatrix(data);
    const tr = trace(S);
    const det = jStat.det(S);
    if (!Number.isFinite(det) || det <= 0) {
      throw new Error("Mauchly's test failed due to non-positive determinant.");
    }

    const W = det / Math.pow(tr / k, k);
    const df = (k * (k - 1)) / 2 - 1;
    const correction = 1 - (2 * k + 1) / (6 * (k - 1));
    const chi2 = -(n - 1) * correction * Math.log(W);
    const pValue = 1 - jStat.chisquare.cdf(chi2, df);

    const trS2 = traceSquare(S);
    const epsilonGG = Math.max(
      0,
      Math.min(1, (tr * tr) / ((k - 1) * trS2))
    );
    const epsilonHF = Math.max(
      0,
      Math.min(
        1,
        (n * (k - 1) * epsilonGG - 2) /
          ((k - 1) * (n - 1) - (k - 1) * epsilonGG)
      )
    );

    const descriptionString = `Mauchly's test (k=${k}, n=${n}) — W=${W.toFixed(
      4
    )}, χ²(${df})=${chi2.toFixed(2)}, p=${pValue.toFixed(
      3
    )}, εGG=${epsilonGG.toFixed(3)}, εHF=${epsilonHF.toFixed(3)}.`;

    const descriptionJSX = (
      <div style={{ whiteSpace: "normal", maxWidth: "none" }}>
        <div>Mauchly&apos;s test (k = {k}, n = {n})</div>
        <div>
          W = {W.toFixed(4)}, χ²({df}) = {chi2.toFixed(2)}, p ={" "}
          {pValue.toFixed(3)}
        </div>
        <div>
          ε<sub>GG</sub> = {epsilonGG.toFixed(3)}, ε<sub>HF</sub> ={" "}
          {epsilonHF.toFixed(3)}
        </div>
      </div>
    );

    return {
      statisticName: "W",
      statistic: W,
      pValue,
      df,
      epsilonGG,
      epsilonHF,
      summaries: [],
      descriptionString,
      descriptionJSX,
      metric: { name: "Mauchly W", symbol: "W", value: W },
    };
  },
  metric: { measure: "Mauchly W", symbol: "W" },
};
