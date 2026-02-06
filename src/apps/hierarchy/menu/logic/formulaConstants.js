import * as aq from "arquero";

export const ROW_FUNCTIONS = {
  // Funciones de texto
  string: { args: 1 },
  lower: { args: 1 },
  upper: { args: 1 },
  trim: { args: 1 },
  substring: { args: 3 },

  // Funciones matemáticas
  sqrt: { args: 1 },
  abs: { args: 1 },
  cbrt: { args: 1 },
  ceil: { args: 1 },
  clz32: { args: 1 },
  exp: { args: 1 },
  expm1: { args: 1 },
  floor: { args: 1 },
  fround: { args: 1 },
  log: { args: 1 },
  log10: { args: 1 },
  log1p: { args: 1 },
  log2: { args: 1 },
  pow: { args: 2 },
  round: { args: 1 },
  sign: { args: 1 },
  trunc: { args: 1 },

  // Fechas/horas
  now: { args: 0 },
  timestamp: { args: 1 },
  datetime: { args: 7 },
  year: { args: 1 },
  quarter: { args: 1 },
  month: { args: 1 },
  week: { args: 1 },
  date: { args: 1 },
  dayofyear: { args: 1 },
  dayofweek: { args: 1 },
  hours: { args: 1 },
  minutes: { args: 1 },
  seconds: { args: 1 },
  milliseconds: { args: 1 },
};

export const COLUMN_FUNCTIONS = {
  // Estadísticas básicas
  mean: { args: 1 },
  sum: { args: 1 },
  min: { args: 1 },
  max: { args: 1 },
  count: { args: 1 },
  median: { args: 1 },
  variance: { args: 1 },
  stdev: { args: 1 },
};

export const SPECIAL_FUNCTIONS = {
  // Funciones especiales
  zscore: { args: 1 },
  zscoreByValues: { args: 3 },
  zscoreByGroup: { args: 2 },
};

export const ALL_FUNCTIONS = {
  ...ROW_FUNCTIONS,
  ...COLUMN_FUNCTIONS,
  ...SPECIAL_FUNCTIONS,
};

export const OPERATOR_MAP = {
  suma: "+",
  resta: "-",
  producto: "*",
  division: "/",
  potencia: "**",
  or: "||",
  and: "&&",
  le: "<=",
  lt: "<",
  ge: ">=",
  gt: ">",
  equality: "==",
  inequality: "!=",
};

export const SIMPLE_VALUES = {
  true: "true",
  false: "false",
  natural: "Math.E",
};

const createAggregator = (operation) => (table, columnName) =>
  table.rollup({ value: aq.op[operation](columnName) }).get("value", 0);

export const PROCESSORS = {
  // Funciones básicas
  mean: createAggregator("mean"),
  sum: createAggregator("sum"),
  min: createAggregator("min"),
  max: createAggregator("max"),
  count: createAggregator("count"),
  median: createAggregator("median"),
  variance: createAggregator("variance"),
  stdev: createAggregator("stdev"),

  // Funciones especiales
  zscore: (table, columnName) => ({
    mean: table.rollup({ value: aq.op.mean(columnName) }).get("value", 0),
    stdev: table.rollup({ value: aq.op.stdev(columnName) }).get("value", 0),
    columnName,
  }),

  zscoreByValues: (columnName, mean, stdev) => ({
    mean,
    stdev,
    columnName,
  }),

  zscoreByGroup: (table, columnName, groupColumn) => {
    const statsMap = table
      .groupby(groupColumn)
      .rollup({
        mean: aq.op.mean(columnName),
        stdev: aq.op.stdev(columnName),
        count: aq.op.count(),
      })
      .objects()
      .reduce(
        (accumulator, stat) => ({
          ...accumulator,
          [stat[groupColumn]]: {
            mean: stat.mean,
            stdev: stat.stdev || 0,
            count: stat.count,
          },
        }),
        {},
      );

    return { statsMap, columnName, groupColumn };
  },
};
