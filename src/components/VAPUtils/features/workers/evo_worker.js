import * as aq from 'arquero';
import { jStat } from 'jstat';
import { mean } from 'd3-array';

// worker.js
onmessage = function (event) {
  const [data, timeVar, measure, pValue] = event.data;
  let result;
  console.log('EVO WORKER DATA:', data, timeVar, pValue);
  if (measure === 'Z-Score') result = getEvolutionZscores(data, timeVar, pValue);
  else if (measure === 'F-Value') result = getEvolutionFvalues(data, timeVar, pValue);
  else if (measure === 'Chi-Square') result = getChiSquaredValues(data, timeVar, pValue);
  const msg = {
    data: result.data.filter((d) => d.p_value < pValue),
    measure: measure,
    populations: result.populations
  };

  console.log('MSG', msg);

  postMessage(msg);
};

function getEvolutionZscores(groups, time_var, pValue) {
  const z_scores = [];
  const pops = [];

  groups.forEach((group) => {
    const populationName = group[0];
    const population = group[1];

    const timestamps = [...new Set(population.map((d) => d[time_var]).sort())];
    const len = timestamps.length;
    const min = timestamps[0];
    const max = timestamps[len - 1];

    const extremeVisits = population.filter((d) => d[time_var] == max || d[time_var] == min);
    const cleanedPopulation = aq.from(extremeVisits);

    /*     console.log(extremeVisits.map((d) => d[time_var]));
    console.log(extremeVisits); */

    // Calcular Z-scores
    const group_z_scores = computeZscores(cleanedPopulation, time_var, pValue).map((d) => ({
      population: populationName,
      variable: d.variable,
      value: d.value,
      p_value: d.p_value
    }));

    z_scores.push(...group_z_scores);
    pops.push(populationName);
  });

  return { data: z_scores, populations: pops };
}

function getEvolutionFvalues(groups, timeVar, pValue) {
  const f_values = [];
  const pops = [];
  groups.forEach((group) => {
    const population = group[0];
    const tmp = aq.from(group[1]);
    const group_f_values = computeFvalues(tmp, timeVar, pValue).map((d) => ({
      variable: d.variable + '^' + population,
      value: d.value,
      var: d.variable,
      p_value: d.p_value,
      population: population
    }));
    f_values.push(...group_f_values);
    pops.push(population);
  });
  return { data: f_values, populations: pops };
}

function getChiSquaredValues(groups, time_var, pValue) {
  const f_values = [];
  const pops = [];
  groups.forEach((group) => {
    const population = group[0];
    const tmp = group[1];
    const group_f_values = computeChiSquaredValues(tmp, time_var, pValue).map((d) => ({
      variable: d.variable + '^' + population,
      value: d.value,
      var: d.variable,
      p_value: d.p_value,
      population: population
    }));
    f_values.push(...group_f_values);
    pops.push(population);
  });
  return { data: f_values, populations: pops };
}
export function computeChiSquaredValues(data, grouping_var, p_limit) {
  const table = aq.from(data);
  const columns = getCategoricCols(table);
  const values = [];
  columns.forEach((variable) => {
    const contingency_table = getContingencyTable(data, variable, grouping_var);
    const { chiSquared, pValue } = chiSquaredStatistic(contingency_table);
    const obj = { variable: variable, value: chiSquared, p_value: pValue };
    if (
      !Number.isNaN(chiSquared) &&
      Number.isFinite(chiSquared) &&
      chiSquared > 0 &&
      pValue < p_limit &&
      variable !== grouping_var
    )
      values.push(obj);
  });

  return values;
}

export function computeZscores(table, grouping, p_limit) {
  const grouped_table = table.groupby(grouping);
  const numeric_columns = getNumericCols(table);

  const z_scores = [];
  numeric_columns.forEach((variable) => {
    const stats = getStats(grouped_table, variable, grouping);
    const means = stats.array('mean');
    const std = stats.array('std').map((d) => (d ? d : 0));
    const count = stats.array('count');

    const z_score =
      (means[0] - means[1]) / Math.sqrt(std[0] ** 2 / count[0] + std[1] ** 2 / count[1]);

    const p_value = 2 * (1 - jStat.normal.cdf(Math.abs(z_score), 0, 1));

    const obj = {
      variable: variable,
      value: z_score,
      p_value: p_value,
      my_value: 'lalalala',
      statistics: stats.objects()
    };

    if (!Number.isNaN(z_score) && Number.isFinite(z_score) && p_value < p_limit) z_scores.push(obj);
  });

  return z_scores;
}

export function computeFvalues(table, grouping, p_limit) {
  const grouped_table = table.groupby(grouping);
  const n_groups = grouped_table.objects({ grouped: 'entries' }).length;
  const n_rows = grouped_table.numRows();
  const numeric_columns = getNumericCols(table);
  const f_values = [];
  numeric_columns.forEach((variable) => {
    const stats = getStats(grouped_table, variable, grouping);

    const group_means = stats.array('mean');
    const overall_mean = mean(table.array(variable));
    const ssb = getSSB(group_means, overall_mean);
    const msb = ssb / (n_groups - 1);

    const grouped = grouped_table.objects({ grouped: 'entries' });
    const ssw = getSSW(grouped, stats, variable);
    const msw = ssw / (n_rows - n_groups);
    const f_value = msb / msw;

    const df_between = n_groups - 1;
    const df_within = n_rows - n_groups;

    const p_value = jStat.ftest(f_value, df_between, df_within);

    if (!Number.isNaN(f_value) && Number.isFinite(f_value) && f_value > 0 && p_value < p_limit) {
      const obj = {
        variable: variable,
        value: f_value,
        p_value: p_value,
        statistics: stats.objects()
      };
      f_values.push(obj);
    }
  });
  return f_values;
}

function getStats(grouped_table, variable, grouping_var) {
  const stats = grouped_table
    .rollup({
      mean: aq.op.average(variable),
      std: aq.op.stdev(variable),
      variance: aq.op.variance(variable),
      count: aq.op.count()
    })
    .rename({
      [grouping_var]: 'group'
    });

  return stats;
}

function getSSB(group_means, overall_mean) {
  return group_means.reduce((sum, m) => {
    return sum + Math.pow(m - overall_mean, 2);
  }, 0);
}

function getSSW(grouped, stats, variable) {
  const partial_ssw = grouped.map((item) => {
    const group_name = item[0];
    const group_mean = stats.filter(aq.escape((d) => d.group === group_name)).get('mean');

    const group = item[1];
    const tmp = group.reduce((sum, m) => {
      return sum + Math.pow(m[variable] - group_mean, 2);
    }, 0);

    return tmp;
  });

  const ssw = partial_ssw.reduce((sum, m) => {
    return sum + m;
  }, 0);

  return ssw;
}

function getMeans(grouped_table, variable, grouping_var) {
  const means = grouped_table
    .rollup({
      mean: aq.op.average(variable),
      std: aq.op.stdev(variable)
    })
    .rename({
      [grouping_var]: 'group'
    });

  return means;
}

function getNumericCols(table) {
  const numeric_cols = table.columnNames().filter((col) => {
    if (col != '')
      return table.array(col).every((value) => typeof +value === 'number' && !isNaN(value));
  });

  return numeric_cols;
}

function getCategoricCols(table) {
  const numeric_cols = table.columnNames().filter((col) => {
    return table.array(col).every((value) => typeof +value === 'number' && !isNaN(value));
  });

  const categoric_cols = table.columnNames().filter((d) => !numeric_cols.includes(d));

  return categoric_cols;
}

function getContingencyTable(data, fixedVar, dynamicVar) {
  const fixedCategories = new Set();
  const dynamicCategories = new Set();

  data.forEach((item) => {
    fixedCategories.add(item[dynamicVar]);
    dynamicCategories.add(item[fixedVar]);
  });

  const fixedArray = Array.from(fixedCategories);
  const dynamicArray = Array.from(dynamicCategories);

  const matrix = Array.from({ length: fixedArray.length }, () =>
    Array(dynamicArray.length).fill(0)
  );

  data.forEach((item) => {
    const row = fixedArray.indexOf(item[dynamicVar]);
    const column = dynamicArray.indexOf(item[fixedVar]);
    matrix[row][column]++;
  });

  return matrix;
}

function chiSquaredStatistic(contingencyTable) {
  const rowTotals = contingencyTable.map((row) => row.reduce((sum, value) => sum + value, 0));
  const colTotals = contingencyTable[0].map((_, colIndex) =>
    contingencyTable.reduce((sum, row) => sum + row[colIndex], 0)
  );
  const total = rowTotals.reduce((sum, value) => sum + value, 0);

  let chiSquared = 0;
  for (let i = 0; i < contingencyTable.length; i++) {
    for (let j = 0; j < contingencyTable[i].length; j++) {
      const expected = (rowTotals[i] * colTotals[j]) / total;
      chiSquared += Math.pow(contingencyTable[i][j] - expected, 2) / expected;
    }
  }

  const degreesOfFreedom = (contingencyTable.length - 1) * (contingencyTable[0].length - 1);

  const pValue = 1 - jStat.chisquare.cdf(chiSquared, degreesOfFreedom);

  return { chiSquared, pValue };
}
