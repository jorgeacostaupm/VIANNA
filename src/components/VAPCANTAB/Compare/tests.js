import ss from "simple-statistics";
import jStat from "jstat";

const TESTS = {
  "Mann-Whitney U": {
    label: "Mann-Whitney U",
    description: "something",
    isApplicable: (groupCount) => groupCount === 2,
    run: (groups) => ({
      pValue: ss.mannWhitneyUTest(groups[0], groups[1]),
      effectSize: ss.ranksCorrelation(groups[0], groups[1]),
    }),
  },
  "ANOVA One-Way": {
    label: "ANOVA Un Factor",
    description: "something",
    isApplicable: (groupCount) => groupCount >= 2,
    run: (groups) => {
      const p = jStat.anovaftest(groups);
      const all = [].concat(...groups);
      const overallMean = jStat.mean(all);
      const ssBetween = groups.reduce(
        (sum, arr) =>
          sum + arr.length * Math.pow(jStat.mean(arr) - overallMean, 2),
        0
      );
      const ssTotal = all.reduce(
        (sum, v) => sum + Math.pow(v - overallMean, 2),
        0
      );
      return { pValue: p, effectSize: ssBetween / ssTotal };
    },
  },
};
