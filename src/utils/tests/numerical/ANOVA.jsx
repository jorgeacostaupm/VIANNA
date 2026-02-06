import { jStat } from "jstat";
import { VariableTypes } from "../../Constants";

export const anova = {
  id: "anova-one-way",
  label: "ANOVA One-way",
  description:
    "Comparación de k ≥ 2 grupos independientes, con CIs para medias y d",
  isApplicable: (count) => count >= 2,
  variableType: VariableTypes.NUMERICAL,
  category: "Numéricas — Independientes",
  run: (groups) => {
    const alpha = 0.05;
    const k = groups.length;

    const groupNames = groups.map((g) => g.name);
    const groupSizes = groups.map((g) => g.values.length);
    if (groupSizes.some((n) => n < 2)) {
      throw new Error("ANOVA requires at least 2 observations per group.");
    }
    const N = groupSizes.reduce((sum, n) => sum + n, 0);
    const allValues = groups.flatMap((g) => g.values);

    const groupMeans = groups.map((g) => jStat.mean(g.values));
    const groupVars = groups.map((g) => jStat.variance(g.values, true));

    const grandMean = jStat.mean(allValues);
    const ssBetween = groups.reduce(
      (sum, g, i) =>
        sum + groupSizes[i] * Math.pow(groupMeans[i] - grandMean, 2),
      0
    );
    const ssWithin = groups.reduce(
      (sum, g, i) =>
        sum + g.values.reduce((s, v) => s + Math.pow(v - groupMeans[i], 2), 0),
      0
    );
    const ssTotal = ssBetween + ssWithin;

    const dfBetween = k - 1;
    const dfWithin = N - k;
    if (dfWithin <= 0) {
      throw new Error("ANOVA requires at least one degree of freedom.");
    }
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;

    const FValue = msBetween / msWithin;
    const pValue = 1 - jStat.centralF.cdf(FValue, dfBetween, dfWithin);
    const etaSquared = ssTotal > 0 ? ssBetween / ssTotal : 0;

    const tCritMean = jStat.studentt.inv(1 - alpha / 2, dfWithin);
    const summaries = groups.map((g, i) => {
      const se = Math.sqrt(msWithin / groupSizes[i]);
      const m = groupMeans[i];
      return {
        name: g.name,
        n: groupSizes[i],
        measure: "Mean",
        value: m,
        variance: groupVars[i],
        intervalMeasure: "CI95%",
        ci95: {
          lower: m - tCritMean * se,
          upper: m + tCritMean * se,
        },
      };
    });

    const effects = [];
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const n1 = groupSizes[i],
          n2 = groupSizes[j];
        const v1 = groupVars[i],
          v2 = groupVars[j];
        const m1 = groupMeans[i],
          m2 = groupMeans[j];

        const pooledSD = Math.sqrt(
          ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2)
        );
        const d = (m1 - m2) / pooledSD;

        const dfD = n1 + n2 - 2;
        const seDiff = pooledSD * Math.sqrt(1 / n1 + 1 / n2);
        const tStat = (m1 - m2) / seDiff;
        const pPair = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), dfD));

        const seD = Math.sqrt((n1 + n2) / (n1 * n2) + (d * d) / (2 * dfD));
        const tCritD = jStat.studentt.inv(1 - alpha / 2, dfD);

        effects.push({
          groups: [groups[i].name, groups[j].name],
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
      `One-way ANOVA of ${k} groups (N=${N})` +
      ` F(${dfBetween},${dfWithin}) = ${FValue.toFixed(
        2
      )}, p = ${pValue.toFixed(3)}, η² = ${etaSquared.toFixed(3)}` +
      ` Tested groups: ${groupNames
        .map(
          (name, i) =>
            `${name} (n=${groupSizes[i]}, x̄=${groupMeans[i].toFixed(
              2
            )}, sd=${Math.sqrt(groupVars[i]).toFixed(2)})`
        )
        .join("; ")}`;

    const descriptionJSX = (
      <>
        <div>
          One-way ANOVA of {k} groups (N={N})
        </div>
        <div>Effect measure: Cohen's d</div>
        <div>
          F({dfBetween},{dfWithin}) = {FValue.toFixed(2)} <br />p ={" "}
          {pValue.toFixed(3)} η² = {etaSquared.toFixed(3)}
        </div>
        <div>
          Tested groups:
          <ul style={{ paddingLeft: "1em", margin: 0 }}>
            {groupNames.map((name, i) => (
              <li key={i}>
                {name} (n={groupSizes[i]}, x̄={groupMeans[i].toFixed(2)}, sd=
                {Math.sqrt(groupVars[i]).toFixed(2)})
              </li>
            ))}
          </ul>
        </div>
      </>
    );

    const result = {
      statisticName: "F",
      statistic: FValue,
      pValue,
      etaSquared,
      summaries,
      summariesTitle: "Means & 95% CI",
      pairwiseEffects: effects,
      pairwiseTitle: "Pairwise Effect Sizes (Cohen’s d)",
      descriptionString,
      descriptionJSX,
      metric: { name: "eta squared", symbol: "η²", value: etaSquared },
    };

    return result;
  },
  metric: { measure: "Eta Squared", symbol: "η²" },
};
