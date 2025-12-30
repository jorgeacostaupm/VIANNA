import * as aq from "arquero";

export const ALL_FUNCTIONS = [
  ["length", 1],
  ["slice", 3],
  ["now", 0],
  ["timestamp", 1],
  ["datetime", 7],
  ["year", 1],
  ["quarter", 1],
  ["month", 1],
  ["week", 1],
  ["date", 1],
  ["dayofyear", 1],
  ["dayofweek", 1],
  ["hours", 1],
  ["minutes", 1],
  ["seconds", 1],
  ["milliseconds", 1],
  ["utcdatetime", 1],
  ["utcyear", 1],
  ["utcquarter", 1],
  ["utcmonth", 1],
  ["utcweek", 1],
  ["utcdate", 1],
  ["utcdayofyear", 1],
  ["utcdayofweek", 1],
  ["utchours", 1],
  ["utcminutes", 1],
  ["utcseconds", 1],
  ["utcmilliseconds", 1],
  ["format_date", 2],
  ["format_utcdate", 2],
  ["bin", 4],
  ["random", 0],
  ["sqrt", 1],
  ["abs", 1],
  ["cbrt", 1],
  ["ceil", 1],
  ["clz32", 1],
  ["exp", 1],
  ["expm1", 1],
  ["floor", 1],
  ["fround", 1],
  ["greatest", -1],
  ["least", -1],
  ["log", 1],
  ["log10", 1],
  ["log1p", 1],
  ["log2", 1],
  ["pow", 2],
  ["round", 1],
  ["sign", 1],
  ["sqrt", 1],
  ["trunc", 1],
  ["degrees", 1],
  ["radians", 1],
  ["acos", 1],
  ["acosh", 1],
  ["asin", 1],
  ["asinh", 1],
  ["atan", 1],
  ["atan2", 1],
  ["atanh", 1],
  ["cos", 1],
  ["cosh", 1],
  ["sin", 1],
  ["sinh", 1],
  ["tan", 1],
  ["tanh", 1],
  ["equal", 2],
  ["string", 1],
  ["parse_date", 1],
  ["parse_float", 1],
  ["parse_int", 1],
  ["endswith", 2],
  ["normalize", 1],
  ["padend", 2],
  ["padstart", 2],
  ["lower", 1],
  ["upper", 1],
  ["repeat", 2],
  ["replace", 3],
  ["split", 2],
  ["startswith", 2],
  ["substring", 3],
  ["trim", 1],
  ["zscore", 1],
  ["zscoreByGroup", 1],
];

export const SPECIAL_FUNCTIONS = {
  mean: (table, col) =>
    table.rollup({ value: aq.op.mean(col) }).get("value", 0),
  sum: (table, col) => table.rollup({ value: aq.op.sum(col) }).get("value", 0),
  min: (table, col) => table.rollup({ value: aq.op.min(col) }).get("value", 0),
  max: (table, col) => table.rollup({ value: aq.op.max(col) }).get("value", 0),
  count: (table, col) =>
    table.rollup({ value: aq.op.count(col) }).get("value", 0),
  median: (table, col) =>
    table.rollup({ value: aq.op.median(col) }).get("value", 0),
  variance: (table, col) =>
    table.rollup({ value: aq.op.variance(col) }).get("value", 0),
  stdev: (table, col) =>
    table.rollup({ value: aq.op.stdev(col) }).get("value", 0),
  zscore: (table, colName) => {
    const mean = table.rollup({ value: aq.op.mean(colName) }).get("value", 0);
    const stdev = table.rollup({ value: aq.op.stdev(colName) }).get("value", 0);
    return { mean, stdev, colName };
  },
  zscoreByGroup: (table, colName, groupCol) => {
    const groupedStats = table
      .groupby(groupCol)
      .rollup({
        group_mean: aq.op.mean(colName),
        group_stdev: aq.op.stdev(colName),
        group_count: aq.op.count(),
      })
      .objects();

    const statsMap = {};
    groupedStats.forEach((stat) => {
      const groupValue = stat[groupCol];
      statsMap[groupValue] = {
        mean: stat.group_mean,
        stdev: stat.group_stdev || 0,
        count: stat.group_count,
      };
    });

    return { statsMap, colName, groupCol };
  },
};

export function buildAggregation(tokens) {
  let nodes = [];
  let columnOperations = [];
  function format_op(attr) {
    let output = "";
    switch (attr["data"]) {
      case "suma":
        output = `${format_op(attr["children"][0])} + ${format_op(
          attr["children"][1]
        )}`;
        break;
      case "resta":
        output = `${format_op(attr["children"][0])} - ${format_op(
          attr["children"][1]
        )}`;
        break;
      case "producto":
        output = `${format_op(attr["children"][0])} * ${format_op(
          attr["children"][1]
        )}`;
        break;
      case "division":
        output = `${format_op(attr["children"][0])} / ${format_op(
          attr["children"][1]
        )}`;
        break;
      case "potencia":
        output = `${format_op(attr["children"][0])} ** ${format_op(
          attr["children"][1]
        )}`;
        break;

      case "or":
        output = `${format_op(attr["children"][0])} || ${format_op(
          attr["children"][1]
        )}`;
        break;
      case "and":
        output = `${format_op(attr["children"][0])} && ${format_op(
          attr["children"][1]
        )}`;
        break;

      case "le":
        output = `${format_op(attr["children"][0])} <= ${format_op(
          attr["children"][1]
        )}`;
        break;

      case "lt":
        output = `${format_op(attr["children"][0])} < ${format_op(
          attr["children"][1]
        )}`;
        break;

      case "ge":
        output = `${format_op(attr["children"][0])} >= ${format_op(
          attr["children"][1]
        )}`;
        break;

      case "gt":
        output = `${format_op(attr["children"][0])} > ${format_op(
          attr["children"][1]
        )}`;
        break;

      case "equality":
        output = `${format_op(attr["children"][0])} == ${format_op(
          attr["children"][1]
        )}`;
        break;
      case "inequality":
        output = `${format_op(attr["children"][0])} != ${format_op(
          attr["children"][1]
        )}`;
        break;
      case "negacion":
        output = `!(${format_op(attr["children"][0])})`;
        break;

      case "parentesis":
        output = `(${format_op(attr["children"][0])})`;
        break;

      case "function":
        output = format_func(attr);
        break;

      case "true":
        output = "true";
        break;
      case "false":
        output = "false";
        break;
      case "texto":
        output = `${attr["children"][0].value}`;
        break;
      case "numero":
        output = attr["children"][0].value;
        break;

      case "natural":
        output = "Math.E ";
        break;

      case "attribute":
        output = format_attr(attr);
        break;

      case "value":
        output = format_op(attr["children"][0]);
        break;

      case "indexing":
        output = `${format_op(attr["children"][0])}[${format_op(
          attr["children"][1]
        )}]`;
        break;
      case "indexing2":
        output = `${format_op(attr["children"][0])}[${format_op(
          attr["children"][1]
        )}]`;
        break;

      default:
        output = "";
        console.error("unknown", attr["data"]);
        break;
    }
    return output;
  }

  function format_func(attr) {
    const funcName = attr.children[0].value;
    const args = attr.children.slice(1).map(format_op);

    if (funcName === "zscore") {
      if (args.length !== 1) {
        throw {
          error: "InvalidArguments",
          msg: `zscore() expects exactly 1 argument, but got ${args.length}.`,
        };
      }

      const match = args[0].match(/r\["(.+?)"\]/);
      if (!match)
        throw {
          error: "InvalidFormat",
          msg: `zscore() expects a column reference like r["ColName"].`,
        };

      const colName = match[1];
      columnOperations.push({ funcName: "zscore", colName });
      return `__ZSCORE__("${colName}")`;
    }

    if (funcName === "zscoreByGroup") {
      if (args.length !== 2) {
        throw {
          error: "InvalidArguments",
          msg: `zscoreByGroup() expects exactly 2 arguments, but got ${args.length}.`,
        };
      }

      const matchCol = args[0].match(/r\["(.+?)"\]/);
      const matchGroup = args[1].match(/r\["(.+?)"\]/);

      if (!matchCol || !matchGroup)
        throw {
          error: "InvalidFormat",
          msg: `zscoreByGroup() expects column references like r["ValueCol"] and r["GroupCol"].`,
        };

      const colName = matchCol[1];
      const groupCol = matchGroup[1];

      columnOperations.push({
        funcName: "zscoreByGroup",
        colName,
        groupCol,
        type: "grouped",
      });

      return `__GROUPED_ZSCORE__("${colName}","${groupCol}")`;
    }

    if (SPECIAL_FUNCTIONS[funcName]) {
      if (args.length !== 1) {
        throw {
          error: "InvalidArguments",
          msg: `${funcName}() expects exactly 1 argument, but got ${args.length}.`,
        };
      }

      const match = args[0].match(/r\["(.+?)"\]/);
      if (!match)
        throw {
          error: "InvalidFormat",
          msg: `${funcName}() expects a column reference like r["ColName"].`,
        };

      const colName = match[1];
      columnOperations.push({ funcName, colName });
      return `__AGG__("${funcName}","${colName}")`;
    }

    const funcIndex = ALL_FUNCTIONS.findIndex((f) => f[0] === funcName);
    if (funcIndex === -1) {
      const availableRowFuncs = ALL_FUNCTIONS.map((f) => f[0]);
      const availableColFuncs = Object.keys(SPECIAL_FUNCTIONS);
      throw {
        error: "InvalidFunction",
        msg:
          `The function "${funcName}" doesn't exist.\n\n` +
          `Available column functions: ${availableColFuncs.join(", ")} \n\n` +
          `Available row functions: ${availableRowFuncs.join(", ")} \n\n`,
      };
    }

    const expectedArgs = ALL_FUNCTIONS[funcIndex][1];
    if (expectedArgs >= 0 && args.length !== expectedArgs) {
      throw {
        error: "InvalidArguments",
        msg: `Function "${funcName}" expects ${expectedArgs} argument(s), but got ${args.length}.`,
      };
    }

    return `${funcName}(${args.join(",")})`;
  }

  function format_attr(attr) {
    nodes.push(attr["children"][0]["value"]);
    return `r["${attr["children"][0]["value"]}"]`;
  }

  const formula = `(r) => ${format_op(tokens)} `;

  return {
    formula,
    nodes,
    columnOperations,
  };
}
