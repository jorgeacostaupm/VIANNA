import { jStat } from "jstat";
import * as aq from "arquero";

export const ownMean = {
  id: "own-mean",
  label: "Against own mean",
  description:
    "Compares each observation to the mean of its group at each time point",
  metric: { measure: "Mean Z-score", symbol: "Z̄" },

  run: (data, groupVar, timeVar, idVar, variable) => {
    const df = aq.from(data).derive({
      groupTimeKey: aq.escape((d) => `${d[groupVar]}||${d[timeVar]}`),
    });

    df.print();

    const groupTimeStats = df
      .groupby(groupVar, timeVar)
      .rollup({
        mean: aq.op.average(variable),
        std: aq.op.stdev(variable),
      })
      .derive({
        groupTimeKey: aq.escape((d) => `${d[groupVar]}||${d[timeVar]}`),
      })
      .select(aq.not(groupVar, timeVar));

    const withStats = df.join(groupTimeStats, "groupTimeKey").derive({
      zscore: aq.escape(
        (d) => (d[variable] - d.mean) / (d.std === 0 ? NaN : d.std)
      ),
    });
    withStats.print();
    const idGroupZMeans = withStats.groupby(idVar, groupVar).rollup({
      z_mean: aq.op.average("zscore"),
    });
    const groupZMeans = idGroupZMeans.groupby(groupVar).rollup({
      group_zmean: aq.op.average("z_mean"),
    });
    groupZMeans.print();

    return {
      groupTimeStats,
      idGroupZMeans,
      groupZMeans,
    };
  },
};
