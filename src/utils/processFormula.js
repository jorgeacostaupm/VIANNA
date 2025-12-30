import * as aq from "arquero";
import { PROCESSORS } from "@/apps/hierarchy/menu/logic/formulaConstants";

// ==================== REGISTRO DE PROCESADORES ESPECIALES ====================

/**
 * Registro centralizado de procesadores de funciones especiales
 * Cada procesador debe tener:
 * - name: nombre de la función
 * - pattern: regex para identificar la función en la fórmula
 * - processor: función que recibe (match, table) y devuelve una función (row) => valor
 */
const SPECIAL_PROCESSORS = [
  {
    name: "zscoreByGroup",
    pattern: /__GROUPED_ZSCORE__\("(.+?)","(.+?)"\)/g,
    processor: (match, table) => {
      const colName = match[1];
      const groupCol = match[2];
      const groupedResult = PROCESSORS.zscoreByGroup(table, colName, groupCol);
      const { statsMap } = groupedResult;

      return (row) => {
        const groupValue = row[groupCol];
        const value = row[colName];
        const groupStats = statsMap[groupValue];

        if (!groupStats || groupStats.stdev === 0 || groupStats.count <= 1) {
          return 0;
        }

        return (value - groupStats.mean) / groupStats.stdev;
      };
    },
  },
  {
    name: "zscore",
    pattern: /__ZSCORE__\("(.+?)"\)/g,
    processor: (match, table) => {
      const colName = match[1];
      const result = PROCESSORS.zscore(table, colName);
      const { mean, stdev } = result;

      return (row) => {
        const value = row[colName];
        if (stdev === 0) return 0;
        return (value - mean) / stdev;
      };
    },
  },
  {
    name: "zscoreByValues",
    pattern: /__ZSCORE_BY_VALUES__\("(.+?)",\s*([\d.]+),\s*([\d.]+)\)/g,
    processor: (match) => {
      const colName = match[1];
      const mean = +match[2];
      const stdev = +match[3];

      return (row) => {
        const value = row[colName];
        if (stdev === 0) return 0;
        return (value - mean) / stdev;
      };
    },
  },
  // Para agregar nuevas funciones especiales en el futuro, añadir aquí:
  // {
  //   name: 'miNuevaFuncion',
  //   pattern: /__MI_NUEVA_FUNCION__\("(.+?)","(.+?)"\)/g,
  //   processor: (match, table) => { ... }
  // }
];

// ==================== MÓDULOS DE PROCESAMIENTO ====================

/**
 * Procesa todas las funciones especiales en una fórmula
 */
function processSpecialFunctions(formula, table) {
  let formulaProcessed = formula;
  const specialFunctions = [];

  SPECIAL_PROCESSORS.forEach((processor) => {
    const matches = [...formulaProcessed.matchAll(processor.pattern)];

    // Reiniciar el índice del regex (importante cuando se usa flag 'g')
    processor.pattern.lastIndex = 0;

    matches.forEach((match) => {
      const fullMatch = match[0];

      // Crear la función especializada usando el procesador
      const derivedFn = processor.processor(match, table);

      // Generar un ID único para esta función
      const functionId = `__SPECIAL_FN_${specialFunctions.length}__`;

      // Guardar la función y reemplazar en la fórmula
      specialFunctions.push({
        id: functionId,
        fn: derivedFn,
        type: processor.name,
      });

      formulaProcessed = formulaProcessed.replace(fullMatch, functionId);
    });
  });

  return { formulaProcessed, specialFunctions };
}

/**
 * Procesa funciones de agregación estándar (__AGG__)
 */
function processAggregationFunctions(formula, table) {
  let formulaProcessed = formula;
  const aggMatches = [
    ...formulaProcessed.matchAll(/__AGG__\("(.+?)","(.+?)"\)/g),
  ];

  aggMatches.forEach((match) => {
    const fullMatch = match[0];
    const funcName = match[1];
    const col = match[2];

    if (!PROCESSORS[funcName]) {
      throw {
        error: "UnknownFunction",
        msg: `Function "${funcName}" is not defined in SPECIAL_FUNCTIONS`,
      };
    }

    const value = PROCESSORS[funcName](table, col);
    formulaProcessed = formulaProcessed.replace(fullMatch, value);
  });

  return formulaProcessed;
}

/**
 * Crea una función combinada que evalúa múltiples funciones especiales
 */
function createCombinedFunction(formula, specialFunctions) {
  return (row) => {
    let evalFormula = formula;

    // Reemplazar cada marcador de función con su valor calculado
    specialFunctions.forEach(({ id, fn }) => {
      const functionValue = fn(row);

      // Convertir valores a formato seguro para evaluación
      const safeValue =
        typeof functionValue === "number"
          ? functionValue
          : JSON.stringify(functionValue);

      evalFormula = evalFormula.replace(id, safeValue);
    });

    // Extraer la expresión (remover "(r) => " si existe)
    const expression = evalFormula.startsWith("(r) => ")
      ? evalFormula.substring(7)
      : evalFormula;

    try {
      // Crear y ejecutar una función temporal
      const tempFn = eval(`(r) => ${expression}`);
      return tempFn(row);
    } catch (error) {
      console.error("Error evaluating combined function:", error);
      console.error("Expression:", expression);
      throw error;
    }
  };
}

// ==================== FUNCIÓN PRINCIPAL MODULAR ====================

/**
 * Procesa una fórmula, manejando funciones especiales y de agregación
 */
export default function processFormula(table, formula) {
  console.log("Processing formula:", formula);

  // Paso 1: Procesar funciones especiales (zscore, zscoreByGroup, etc.)
  const { formulaProcessed: formulaAfterSpecial, specialFunctions } =
    processSpecialFunctions(formula, table);

  // Paso 2: Procesar funciones de agregación estándar (__AGG__)
  const finalFormula = processAggregationFunctions(formulaAfterSpecial, table);

  console.log("Formula after processing:", finalFormula);
  console.log("Number of special functions:", specialFunctions.length);
  console.log(
    "Special function types:",
    specialFunctions.map((f) => f.type)
  );

  // Paso 3: Construir función final según lo que se encontró
  if (specialFunctions.length > 0) {
    // Si hay funciones especiales, crear una función combinada
    const combinedFn = createCombinedFunction(finalFormula, specialFunctions);
    return aq.escape(combinedFn);
  } else {
    // Si no hay funciones especiales, evaluar normalmente
    console.log("No special functions, evaluating normally");
    return eval(finalFormula);
  }
}

// ==================== EJEMPLOS DE USO PARA FUTURAS EXTENSIONES ====================

/**
 * Ejemplo: Cómo agregar una nueva función especial "normalizeByGroup"
 */
// export function setupNormalizeByGroup() {
//   // Primero, agregar la función a SPECIAL_FUNCTIONS en formulaGenerator.js
//   // Luego registrar el procesador:
//   registerSpecialProcessor(
//     'normalizeByGroup',
//     '__NORMALIZE_BY_GROUP__\\("(.+?)","(.+?)"\\)',
//     (match, table) => {
//       const colName = match[1];
//       const groupCol = match[2];
//
//       // Lógica para calcular min/max por grupo
//       const groupStats = SPECIAL_FUNCTIONS.normalizeByGroup(table, colName, groupCol);
//
//       return (row) => {
//         const groupValue = row[groupCol];
//         const value = row[colName];
//         const stats = groupStats[groupValue];
//
//         if (!stats || stats.max === stats.min) return 0;
//         return (value - stats.min) / (stats.max - stats.min);
//       };
//     }
//   );
// }
