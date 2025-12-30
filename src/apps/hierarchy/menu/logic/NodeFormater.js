import {
  OPERATOR_MAP,
  SIMPLE_VALUES,
  COLUMN_FUNCTIONS,
  ROW_FUNCTIONS,
  SPECIAL_FUNCTIONS,
} from "./formulaConstants";

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    // Propiedades para compatibilidad con código existente
    this.error = "ValidationError";
    this.msg = message;
  }
}

const validateArguments = (functionName, actualArgs, expectedArgs) => {
  if (expectedArgs >= 0 && actualArgs.length !== expectedArgs) {
    throw new FormulaError(
      `Function "${functionName}" expects ${expectedArgs} argument(s), got ${actualArgs.length}`
    );
  }
};

const extractColumnName = (argument, functionName) => {
  const match = argument.match(/r\["(.+?)"\]/);
  if (!match) {
    throw new FormulaError(
      `"${functionName}" expects a column reference like r["ColumnName"]`
    );
  }
  return match[1];
};

export default class NodeFormatter {
  constructor() {
    this.columnNames = [];
    this.columnOperations = [];
  }

  format(node) {
    const { data, children = [] } = node;

    switch (data) {
      // Operadores binarios
      case "suma":
      case "resta":
      case "producto":
      case "division":
      case "potencia":
      case "or":
      case "and":
      case "le":
      case "lt":
      case "ge":
      case "gt":
      case "equality":
      case "inequality":
        return this.formatBinaryOperator(data, children);

      // Valores simples
      case "true":
      case "false":
      case "natural":
        return SIMPLE_VALUES[data];

      // Estructuras de datos
      case "function":
        return this.formatFunction(children);

      case "attribute":
        return this.formatAttribute(children[0]);

      case "numero":
      case "texto":
        return children[0].value;

      case "parentesis":
        return `(${this.format(children[0])})`;

      case "negacion":
        return `!(${this.format(children[0])})`;

      case "indexing":
      case "indexing2":
        return `${this.format(children[0])}[${this.format(children[1])}]`;

      case "value":
        return this.format(children[0]);

      default:
        console.warn("Unknown node type:", data);
        return "";
    }
  }

  formatBinaryOperator(operator, children) {
    const left = this.format(children[0]);
    const right = this.format(children[1]);
    return `${left} ${OPERATOR_MAP[operator]} ${right}`;
  }

  formatAttribute(node) {
    const columnName = node.value;
    this.columnNames.push(columnName);
    return `r["${columnName}"]`;
  }

  formatFunction(nodes) {
    const functionName = nodes[0].value;
    const argumentsList = nodes.slice(1).map((node) => this.format(node));

    // Funciones especiales
    if (SPECIAL_FUNCTIONS[functionName]) {
      return this.handleSpecialFunction(functionName, argumentsList);
    }

    // Funciones de columna (agregaciones)
    if (COLUMN_FUNCTIONS[functionName]) {
      return this.handleColumnFunction(functionName, argumentsList);
    }

    // Funciones de fila
    if (ROW_FUNCTIONS[functionName]) {
      return this.handleRowFunction(functionName, argumentsList);
    }

    // Función no encontrada
    const availableFunctions = Object.keys(ROW_FUNCTIONS).sort().join(", ");
    throw new FormulaError(
      `Function "${functionName}" doesn't exist\n\nAvailable Functions: ${availableFunctions}`
    );
  }

  handleSpecialFunction(functionName, args) {
    const expectedArgs = SPECIAL_FUNCTIONS[functionName].args;
    validateArguments(functionName, args, expectedArgs);

    if (functionName === "zscore") {
      const columnName = extractColumnName(args[0], functionName);
      this.columnOperations.push({ functionName, columnName });
      return `__ZSCORE__("${columnName}")`;
    }

    if (functionName === "zscoreByGroup") {
      const columnName = extractColumnName(args[0], functionName);
      const groupColumn = extractColumnName(args[1], functionName);
      this.columnOperations.push({ functionName, columnName, groupColumn });
      return `__GROUPED_ZSCORE__("${columnName}","${groupColumn}")`;
    }

    if (functionName === "zscoreByValues") {
      const columnName = extractColumnName(args[0], functionName);
      const mean = args[1];
      const stdev = args[2];
      this.columnOperations.push({ functionName, columnName, mean, stdev });
      return `__ZSCORE_BY_VALUES__("${columnName}",${mean}, ${stdev})`;
    }
  }

  handleColumnFunction(functionName, args) {
    const expectedArgs = COLUMN_FUNCTIONS[functionName].args;
    validateArguments(functionName, args, expectedArgs);
    const columnName = extractColumnName(args[0], functionName);
    this.columnOperations.push({ functionName, columnName });
    return `__AGG__("${functionName}","${columnName}")`;
  }

  handleRowFunction(functionName, args) {
    const expectedArgs = ROW_FUNCTIONS[functionName].args;
    validateArguments(functionName, args, expectedArgs);
    return `${functionName}(${args.join(", ")})`;
  }
}
