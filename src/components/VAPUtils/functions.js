import * as d3 from "d3";
import * as aq from "arquero";
import { jStat } from "jstat";
import { mean } from "d3-array";
import * as ss from "simple-statistics";
import store from "@/components/VAPUtils/features/store";

import { setQuarantineData } from "@/components/VAPUtils/features/cantab/cantabSlice";
import { setDataframe as setData } from "@/components/VAPUtils/features/data/dataSlice";
import {
  DEFAULT_ORDER_VARIABLE,
  HIDDEN_VARIABLES,
} from "@/components/VAPCANTAB/Utils/constants/Constants";

import { pubsub } from "./pubsub";

export function renderContextTooltip(tooltip, d, idVar) {
  let buttonHTML = `
    <div style="display: flex; flex-direction: column; gap: 4px; background: white">
      <button id='but1' class='btn-custom-antd'>Quarantine Observation</button>
    </div>
  `;

  /* if (idVar) {
    buttonHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px; background: white">
        <button id='but1' class='btn-custom-antd'>Quarantine by ID</button>
        <button id='but2' class='btn-custom-antd'>Quarantine Observation</button>
      </div>
    `;
  }

   d3.select('#but2').on('click', function () {
    quarantineSubjectVisit(d[DEFAULT_ORDER_VARIABLE], d[vis.timeVar], vis.timeVar);
  }); */

  tooltip.html(buttonHTML).style("display", "block");

  tooltip.select("#but1").on("click", function () {
    console.log("click");
    quarantineSubject(d[DEFAULT_ORDER_VARIABLE]);
  });

  d3.select("body").on("click", function () {
    tooltip.style("display", "none");
  });
}

export function quarantineSubject(id) {
  const data = store.getState().dataframe.dataframe;
  const quarantineData = store.getState().cantab.quarantineData;
  console.log("QUARATINE SUBJECT", id);
  const filteredData = data.filter(
    (item) => item[DEFAULT_ORDER_VARIABLE] === id
  );
  const newData = data.filter((item) => item[DEFAULT_ORDER_VARIABLE] !== id);
  const newQuarantineData = [...quarantineData, ...filteredData];

  store.dispatch(setData(newData));
  store.dispatch(setQuarantineData(newQuarantineData));
}

export function quarantineSubjectVisit(id, visit, timeVar) {
  const data = store.getState.dataframe.dataframe;
  const quarantineData = store.getState().cantab.quarantineData;

  const filteredData = data.filter(
    (item) => item.id === id && item[timeVar] === visit
  );

  const newData = data.filter(
    (item) => item.id !== id || item[timeVar] !== visit
  );
  const newQuarantineData = [...quarantineData, ...filteredData];

  console.log("QUARANTINE SUBJETCT VISIT!!!", filteredData, newData);

  store.dispatch(setData(newData));
  store.dispatch(setQuarantineData(newQuarantineData));
}

export function roundValue(value) {
  return +value % 1 !== 0 ? +value.toFixed(3) : +value;
}

export function capitalizeFirstLetter(string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function cleanData(data) {
  const navioColumns = store.getState().dataframe.navioColumns;

  console.log(navioColumns, data);

  const cleanedData = data.map((obj) => {
    return Object.keys(obj)
      .filter((key) => [...navioColumns].includes(key))
      .reduce((newObj, key) => {
        newObj[key] = obj[key];
        return newObj;
      }, {});
  });

  return cleanedData;
}

export function moveTooltip(e, tooltip, chart) {
  const [x, y] = d3.pointer(e, chart);
  const tooltipHeight = tooltip.node().getBoundingClientRect().height;

  tooltip
    .style("opacity", 1)
    .style("left", `${x}px`)
    .style("top", `${y - window.scrollY - tooltipHeight - 20}px`);
}

// NOTIFICATION FUNCTIONS

let notApiInstance;

export const useNotApi = () => {
  return notApiInstance;
};

export const setNotApi = (api) => {
  notApiInstance = api;
};

let notificationHandler = null;

export const subscribeToNotification = (api) => {
  if (notificationHandler) return;

  notificationHandler = (data) => {
    api.open({
      message: data.message || "Notification",
      description: data.description || "",
      type: data.type || "info", // 'info', 'success', 'warning', 'error'
      placement: data.placement || "bottomRight",
      duration: data.duration || 3,
      pauseOnHover: data.pauseOnHover || false,
      showProgress: data.pauseOnHover || false,
    });
  };

  pubsub.subscribe("notification", notificationHandler);
};

export const unsubscribeFromNotification = () => {
  if (notificationHandler) {
    pubsub.unsubscribe("notification", notificationHandler);
    notificationHandler = null;
  }
};

export function showNotification(
  type,
  message,
  description,
  pauseOnHover = false,
  showProgress = false,
  duration = 2
) {
  useNotApi()[type]({
    message,
    description,
    placement: "topRight",
    duration,
    pauseOnHover,
    showProgress,
  });
  return;
}

// EVOLUTION FUNCTIONS

import { startWorker as startEvolutionWorker } from "@/components/VAPUtils/features/evolution/startWorker";
export function computeEvolutionRankingDataOnWorker(
  selection,
  groupVar,
  timeVar,
  isNumeric,
  pValue
) {
  const data = cleanData(selection);
  const table = aq.from(data);
  const groupedTable = table.groupby(groupVar);

  const groups = groupedTable.objects({ grouped: "entries" });
  const tmp = groupedTable
    .groupby(groupVar, timeVar)
    .objects({ grouped: "entries" });

  /* const some_have_more_than_two = tmp.some((item) => item[1].length > 2);
  const all_have_two = tmp.every((item) => item[1].length > 2);
  const some_have_two = tmp.some((item) => item[1].length === 2); */

  let workerData = groups;
  let measure = "Z-Score";

  const g = tmp.filter((item) => item[1].length >= 2).map((item) => item[0]);
  workerData = groups.filter((item) => g.includes(item[0]));

  if (!isNumeric) {
    measure = "Chi-Square";
  } /* else if (some_have_more_than_two) {
    const g = tmp.filter((item) => item[1].length > 2).map((item) => item[0]);
    worker_data = groups.filter((item) => g.includes(item[0]));
  } else if (all_have_two) {
    measure = 'Z-Score';
  } else if (some_have_two) {
    const g = tmp.filter((item) => item[1].length > 1).map((item) => item[0]);
    worker_data = groups.filter((item) => g.includes(item[0]));
    measure = 'Z-Score';
  } else {
    worker_data = [];
  } */

  store.dispatch(startEvolutionWorker([workerData, timeVar, measure, pValue]));
}

/* export function computeEvolutionRankingDataOnWorker(selection) {
  const data = cleanData(selection);
  const table = aq.from(data);
  const group_var = store.getState().cantab.group_var;
  const time_var = store.getState().cantab.time_var;
  const is_numeric = store.getState().evolution.is_numeric;
  const p_value = store.getState().evolution.p_value;
  const grouped_table = table.groupby(group_var);

  const groups = grouped_table.objects({ grouped: 'entries' });
  const tmp = grouped_table.groupby(group_var, time_var).objects({ grouped: 'entries' });

  const some_have_more_than_two = tmp.some((item) => item[1].length > 2);
  const all_have_two = tmp.every((item) => item[1].length === 2);
  const some_have_two = tmp.some((item) => item[1].length === 2);

  let worker_data = groups;
  let measure = 'F-Value';

  if (!is_numeric) {
    measure = 'Chi-Square';
  } else if (some_have_more_than_two) {
    const g = tmp.filter((item) => item[1].length > 2).map((item) => item[0]);
    worker_data = groups.filter((item) => g.includes(item[0]));
  } else if (all_have_two) {
    measure = 'Z-Score';
  } else if (some_have_two) {
    const g = tmp.filter((item) => item[1].length > 1).map((item) => item[0]);
    worker_data = groups.filter((item) => g.includes(item[0]));
    measure = 'Z-Score';
  } else {
    worker_data = [];
  }

  store.dispatch(startEvolutionWorker([worker_data, time_var, measure, p_value]));
} */

export function computeCategoricEvolutionData(data, variable, group) {
  const group_var = store.getState().cantab.group_var;
  const table = aq.from(data.filter((d) => d[group_var] == group));
  const time_var = store.getState().cantab.time_var;
  const grouped_table = table
    .groupby(variable, time_var)
    .select(variable, time_var);
  const groups = grouped_table.objects({ grouped: "entries" });

  const evolution_data = groups.map((g) => {
    const group = g[0];
    const time = g[1];
    const obj = { population: group };
    time.forEach((time) => {
      const population = time[0];
      const arr = time[1].map((d) => d[variable]);
      const mean = arr.reduce((sum, value) => sum + 1, 0);

      obj[population] = { mean: mean, std: 0 };
    });

    return obj;
  });

  return evolution_data;
}

export function computeEvolutionData(data, variable) {
  const table = aq.from(data);
  const group_var = store.getState().cantab.group_var;
  const time_var = store.getState().cantab.time_var;
  const grouped_table = table
    .groupby(group_var, time_var)
    .select(group_var, variable, time_var);
  const groups = grouped_table.objects({ grouped: "entries" });

  const evolution_data = groups.map((g) => {
    const group = g[0];
    const time = g[1];
    const obj = { population: group };
    time.forEach((time) => {
      const population = time[0];
      const arr = time[1].map((d) => d[variable]);
      const mean = arr.reduce((sum, value) => sum + +value, 0) / arr.length;

      const std = Math.sqrt(
        arr.reduce((sum, value) => sum + Math.pow(+value - mean, 2), 0) /
          arr.length
      );
      obj[population] = { mean: mean, std: std };
    });

    return obj;
  });

  return evolution_data;
}

export function computeEvolutionSubjectData(data, variable) {
  const table = aq.from(data);
  const group_var = store.getState().cantab.group_var;
  const time_var = store.getState().cantab.time_var;

  const grouped_table = table
    .groupby("id")
    .select("id", group_var, variable, time_var, DEFAULT_ORDER_VARIABLE);
  const groups = grouped_table.objects({ grouped: "entries" });
  console.log("GROUPS", groups);

  return groups;

  /* const evolution_data = groups.map((g) => {
    const group = g[0];
    const time = g[1];
    const obj = { population: group };
    time.forEach((time) => {
      const population = time[0];
      const arr = time[1].map((d) => d[variable]);
      const mean = arr.reduce((sum, value) => sum + +value, 0) / arr.length;

      const std = Math.sqrt(
        arr.reduce((sum, value) => sum + Math.pow(+value - mean, 2), 0) / arr.length
      );
      obj[population] = { mean: mean, std: std };
    });

    return obj;
  });

  return evolution_data; */
}

// COMPARE FUNCTIONS

import { startWorker as startCompareWorker } from "@/components/VAPUtils/features/compare/startWorker";
export function computeCompareRankingDataOnWorker(selection) {
  const group_var = store.getState().cantab.group_var;
  const is_numeric = store.getState().compare.is_numeric;
  const p_value = store.getState().compare.p_value;
  const data = cleanData(selection);
  const table = aq.from(data);
  const grouped_table = table.groupby(group_var);
  const n_groups = grouped_table.objects({ grouped: "entries" }).length;
  const measure = is_numeric
    ? n_groups > 2
      ? "F-Value"
      : "Z-Score"
    : "Chi-Square";
  store.dispatch(startCompareWorker([data, group_var, measure, p_value]));
}

export function computeCompareRankingDataOnWorkerNEW(
  selection,
  groupVar,
  isNumeric,
  pValue
) {
  const data = cleanData(selection);
  const table = aq.from(data);
  const grouped_table = table.groupby(groupVar);
  const n_groups = grouped_table.objects({ grouped: "entries" }).length;
  const measure = isNumeric
    ? n_groups > 2
      ? "F-Value"
      : "Z-Score"
    : "Chi-Square";
  store.dispatch(startCompareWorker([data, groupVar, measure, pValue]));
}

export function computeCompareCategoriesData(data, column) {
  const table = aq.from(data);
  const group_var = store.getState().cantab.group_var;

  const result = table.groupby(column, group_var).count().objects();
  return result;
}

export function computeCompareDensitiesData(data, column) {
  const table = aq.from(data);
  const group_var = store.getState().cantab.group_var;
  const selectedColumns = table.select(group_var, column);
  const grouped = selectedColumns.groupby(group_var);

  const resultArray = [];

  grouped.objects({ grouped: "entries" }).forEach((group) => {
    const type = group[0];
    group[1].forEach((row) => {
      const obj = {
        type: type,
        value: row[column],
      };
      resultArray.push(obj);
    });
  });

  return resultArray;
}

// CORRELATION FUNCTIONS

import { startWorker as startCorrelationWorker } from "@/components/VAPUtils/features/correlation/correlationSlice";
export function computeCorrelationMatrixDataOnWorker(
  data,
  columns,
  selectedPopulations,
  groupVar
) {
  console.log("hererererere", data, columns, selectedPopulations, groupVar);
  store.dispatch(
    startCorrelationWorker([data, columns, selectedPopulations, groupVar])
  );
}

export function computeCorrelationMatrixData(data, columns, groups, groupVar) {
  const result = {};
  console.log(data, columns);

  columns.filter((d) => !HIDDEN_VARIABLES.includes(d));

  for (const item of data) {
    if (groups.includes(item[groupVar])) {
      for (const column of columns) {
        if (!result[column]) {
          result[column] = [];
        }
        result[column].push(+item[column]);
      }
    }
  }
  let dt = aq.table(result);
  const dataset = dt.select(columns).objects();
  const correlation_matrix = computeCorrelationMatrix(dataset);
  return correlation_matrix;
}

function computeCorrelationMatrix(dataset) {
  const keys = getKeys(dataset).reverse();
  const correlationMatrix = [];

  for (let i = 0; i < keys.length; i++) {
    const column1 = getColumnValues(dataset, keys[i]);

    for (let j = i; j < keys.length; j++) {
      const column2 = getColumnValues(dataset, keys[j]);
      // Returns NaN if an element of any array is NaN
      const correlation = ss.sampleCorrelation(column1, column2);

      correlationMatrix.push({
        x: keys[i],
        y: keys[j],
        value: correlation,
      });

      if (i !== j) {
        // For non-diagonal elements, also add the symmetric entry
        correlationMatrix.push({
          x: keys[j],
          y: keys[i],
          value: correlation,
        });
      }
    }
  }

  return correlationMatrix;
}

function getKeys(dataset) {
  return Object.keys(dataset[0]);
}

function getColumnValues(dataset, key) {
  return dataset.map((item) => item[key]);
}

// STATISTICAL FUNCTIONS

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
    const means = stats.array("mean");
    const std = stats.array("std").map((d) => (d ? d : 0));
    const count = stats.array("count");

    const z_score =
      (means[0] - means[1]) /
      Math.sqrt(std[0] ** 2 / count[0] + std[1] ** 2 / count[1]);

    const p_value = 2 * (1 - jStat.normal.cdf(Math.abs(z_score), 0, 1));

    const obj = {
      variable: variable,
      value: z_score,
      p_value: p_value,
      my_value: "lalalala",
      statistics: stats.objects(),
    };

    if (!Number.isNaN(z_score) && Number.isFinite(z_score) && p_value < p_limit)
      z_scores.push(obj);
  });

  return z_scores;
}

export function computeFvalues(table, grouping, p_limit) {
  const grouped_table = table.groupby(grouping);
  const n_groups = grouped_table.objects({ grouped: "entries" }).length;
  const n_rows = grouped_table.numRows();
  const numeric_columns = getNumericCols(table);
  const f_values = [];
  numeric_columns.forEach((variable) => {
    const stats = getStats(grouped_table, variable, grouping);

    const group_means = stats.array("mean");
    const overall_mean = mean(table.array(variable));
    const ssb = getSSB(group_means, overall_mean);
    const msb = ssb / (n_groups - 1);

    const grouped = grouped_table.objects({ grouped: "entries" });
    const ssw = getSSW(grouped, stats, variable);
    const msw = ssw / (n_rows - n_groups);
    const f_value = msb / msw;

    const df_between = n_groups - 1;
    const df_within = n_rows - n_groups;

    const p_value = jStat.ftest(f_value, df_between, df_within);

    if (
      !Number.isNaN(f_value) &&
      Number.isFinite(f_value) &&
      f_value > 0 &&
      p_value < p_limit
    ) {
      const obj = {
        variable: variable,
        value: f_value,
        p_value: p_value,
        statistics: stats.objects(),
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
      count: aq.op.count(),
    })
    .rename({
      [grouping_var]: "group",
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
    const group_mean = stats
      .filter(aq.escape((d) => d.group === group_name))
      .get("mean");

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
      std: aq.op.stdev(variable),
    })
    .rename({
      [grouping_var]: "group",
    });

  return means;
}

function getNumericCols(table) {
  const numeric_cols = table.columnNames().filter((col) => {
    if (col != "")
      return table
        .array(col)
        .every((value) => typeof +value === "number" && !isNaN(value));
  });

  return numeric_cols;
}

function getCategoricCols(table) {
  const numeric_cols = table.columnNames().filter((col) => {
    return table
      .array(col)
      .every((value) => typeof +value === "number" && !isNaN(value));
  });

  const categoric_cols = table
    .columnNames()
    .filter((d) => !numeric_cols.includes(d));

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
  const rowTotals = contingencyTable.map((row) =>
    row.reduce((sum, value) => sum + value, 0)
  );
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

  const degreesOfFreedom =
    (contingencyTable.length - 1) * (contingencyTable[0].length - 1);

  const pValue = 1 - jStat.chisquare.cdf(chiSquared, degreesOfFreedom);

  return { chiSquared, pValue };
}

// add functions to arquero :)
import { addFunction } from "arquero";

const tryParseDate = (date, format) => {
  try {
    return parse(date, format, new Date());
  } catch (err) {
    return null;
  }
};
const fromUnix = (date) => {
  try {
    return new Date(date * 1000);
  } catch (err) {
    return null;
  }
};

const String = (x) => {
  if (x == null) {
    return "";
  } else {
    return x.toString();
  }
};

// REVISAR :S (abajo)

addFunction("string", String, { override: true });
addFunction("parseDate", tryParseDate, { override: true });
addFunction("parseUnixDate", fromUnix, { override: true });
