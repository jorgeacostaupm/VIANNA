import { createAsyncThunk } from "@reduxjs/toolkit";
import * as aq from "arquero";
import {
  generateEmpty,
  generateColumn,
  removeColumn,
  removeBatch,
  generateColumnBatch,
} from "./dataAsyncReducers";
import {
  generateTree,
  getFileName,
  getRandomInt,
  getVisibleNodes,
} from "@/utils/functions";
import { convertColumnType } from "./dataAsyncReducers";

import { get_parser } from "@/apps/hierarchy/menu/logic/parser";
import buildAggregation from "@/apps/hierarchy/menu/logic/formulaGenerator";
import { ALL_FUNCTIONS } from "@/apps/hierarchy/menu/logic/formulaConstants";

let parser = get_parser();

const TEXT_OPERATIONS = new Set([
  "string",
  "lower",
  "upper",
  "trim",
  "substring",
]);

const sanitizeNamePart = (value) => {
  return String(value)
    .replace(/\$\(|\)/g, "")
    .replace(/["']/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
};

const buildOperationName = (operation, colName, extraArgs) => {
  const cleanedArgs = extraArgs
    .map(sanitizeNamePart)
    .filter((part) => part && part.length > 0);
  const suffix = cleanedArgs.length > 0 ? `-${cleanedArgs.join("_")}` : "";
  return `${operation}-${colName}${suffix}`;
};

const getOperationDtype = (operation) =>
  TEXT_OPERATIONS.has(operation) ? "text" : "number";

function getAggregation(operation, params, node) {
  const colName = node.data.name;
  const id = node.data.id;
  const opConfig = ALL_FUNCTIONS[operation];

  if (!opConfig) {
    throw new Error(`Unsupported operation: ${operation}`);
  }

  const opArgs = opConfig.args;
  const extraArgs = (params?.args || [])
    .map((arg) => String(arg).trim())
    .filter((arg) => arg.length > 0);

  const args = [];
  if (opArgs === 0) {
    args.push("0");
  } else {
    args.push(`$(${colName})`);
  }

  let name = "";

  if (operation === "zscore") {
    name = `Z-${colName}`;
  } else if (operation === "zscoreByGroup") {
    const group = Array.isArray(params?.group)
      ? params.group[0]
      : params?.group;
    if (!group) {
      throw new Error("Group parameter is required for zscoreByGroup");
    }
    args.push(`$(${group})`);
    name = `Z-${colName}-${group}`;
  } else if (operation === "zscoreByValues") {
    const values = params?.values || params;
    const valueParams = values?.[id];
    if (!valueParams || valueParams.mean == null || valueParams.stdev == null) {
      throw new Error(
        `Mean and stdev are required for node ${colName} (${id})`
      );
    }
    args.push(valueParams.mean, valueParams.stdev);
    name = `Z-${colName} µ:${valueParams.mean} σ:${valueParams.stdev}`;
  } else {
    if (opArgs > 1 && extraArgs.length < opArgs - 1) {
      throw new Error(`Operation ${operation} requires more arguments.`);
    }

    if (opArgs === -1) {
      args.push(...extraArgs);
    } else if (opArgs > 1) {
      args.push(...extraArgs.slice(0, opArgs - 1));
    }

    name = buildOperationName(operation, colName, extraArgs);
  }

  const formula = `${operation}(${args.join(", ")})`;
  const parsed = parser.parse(formula);
  const tmp = buildAggregation(parsed);

  const info = {
    exec: tmp.formula,
    formula,
    operation: "custom",
  };

  return {
    ...tmp,
    info,
    name,
    dtype: getOperationDtype(operation),
  };
}

export const applyOperation = createAsyncThunk(
  "metadata/applyOperation",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { operation, params, node, selectedNodes } = payload;

      if (!selectedNodes || selectedNodes.length === 0) {
        throw new Error("No nodes selected");
      }

      const cols = [];

      for (const n of selectedNodes) {
        const agg = getAggregation(operation, params, n);

        // Añadir atributo a la metadata
        await dispatch(
          addAttribute({
            id: getRandomInt(),
            name: agg.name,
            type: "aggregation",
            parentID: n.data.id,
            info: agg.info,
            dtype: agg.dtype || "number",
          })
        ).unwrap();

        cols.push({ name: agg.name, info: agg.info });
      }

      // Generar todas las columnas en batch
      if (cols.length > 0) {
        await dispatch(generateColumnBatch({ cols })).unwrap();
      }

      return payload;
    } catch (err) {
      console.error("applyOperation error:", err.message);
      return rejectWithValue(err.message || "Error adding attribute.");
    }
  }
);

function createNodeInfo(objectTypes) {
  let id = 1;
  const fieldInfo = [];
  for (const key in objectTypes) {
    if (objectTypes.hasOwnProperty(key)) {
      fieldInfo.push({
        id: id++,
        name: key,
        dtype: objectTypes[key],
        related: [],
        isShown: true,
        type: "attribute",
        desc: "",
      });
    }
  }
  return fieldInfo;
}

export const createToMeta = createAsyncThunk(
  "metadata/createToMeta",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const allNodes = getState().metadata.attributes || [];
      const attributes = allNodes
        .filter((n) => n.type === "attribute")
        .map((n) => n.name);

      const newAggregations = payload.filter(
        (m) => m.type === "aggregation" && !attributes.includes(m.name)
      );

      const oldAggregations = allNodes
        .filter((m) => m.type === "aggregation")
        .map((n) => n.name);

      await dispatch(removeBatch({ cols: oldAggregations }));
      await dispatch(generateColumnBatch({ cols: newAggregations }));

      return payload;
    } catch (err) {
      return rejectWithValue(
        err.message || "Error building meta automatically."
      );
    }
  }
);

export const buildMetaFromVariableTypes = createAsyncThunk(
  "metadata/buildMetaFromVariableTypes",
  async (payload, { rejectWithValue }) => {
    try {
      const nodeInfo = createNodeInfo(payload);

      const root = {
        id: 0,
        name: "Root",
        desc: "Just the root of the hierarchy",
        type: "root",
        dtype: "root",
        isShown: true,
        related: nodeInfo.map((n) => n.id),
      };

      return [root, ...nodeInfo];
    } catch (err) {
      return rejectWithValue(
        err.message || "Error building meta from variable types."
      );
    }
  }
);

export const toggleAttribute = createAsyncThunk(
  "metadata/toggleAttribute",
  async ({ attributeID, fromFocus }, { getState, rejectWithValue }) => {
    try {
      const state = getState().metadata;
      const attributes = state.attributes;

      const attributeIdx = attributes.findIndex((n) => n.id === attributeID);
      if (attributeIdx === -1) {
        return rejectWithValue(`The node ${attributeID} does not exist.`);
      }
      return { attributeIdx, fromFocus };
    } catch (err) {
      return rejectWithValue(err.message || "Error toggling attribute.");
    }
  }
);

export const addAttribute = createAsyncThunk(
  "metadata/addAttribute",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { name, type } = payload;

      if (!name || !type) {
        return rejectWithValue("Attribute name or type is missing.");
      }

      if (type === "aggregation") {
        dispatch(generateEmpty({ colName: name }));
      }

      return payload;
    } catch (err) {
      return rejectWithValue(err.message || "Error adding attribute.");
    }
  }
);

export const updateAttribute = createAsyncThunk(
  "metadata/updateAttribute",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { name, type, info, recover, dtype } = payload;

      if (type === "aggregation") {
        if (!info?.exec) {
          await dispatch(generateEmpty({ colName: name }));
        } else {
          await dispatch(
            generateColumn({
              colName: name,
              formula: info.exec,
            })
          );
        }
      }

      if (dtype !== "determine") {
        dispatch(convertColumnType({ column: name, dtype }));
      }

      if (recover == null || recover) {
        return { node: { ...payload }, recover: null };
      } else {
        const { recover: _, ...newNode } = payload;
        return { node: { ...newNode }, recover: false };
      }
    } catch (error) {
      console.error("Error en updateAttribute:", error);
      return rejectWithValue({ node: { ...payload }, error: error?.message });
    }
  }
);

function isPartOfAggregation(attributeID, attributes) {
  const parent = attributes.find((attr) => attr.related.includes(attributeID));

  if (parent) {
    const isUsed = parent.info?.usedAttributes?.find(
      (used) => used.id === attributeID
    );
    return isUsed;
  }

  throw new Error(`Parent not found for attributeID: ${attributeID}`);
}

export const removeAttribute = createAsyncThunk(
  "metadata/removeAttribute",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const { attributeID } = payload;
      const attributes = getState().metadata.attributes;

      if (!Array.isArray(attributes))
        return rejectWithValue("Metadata attributes are not available.");

      const node = attributes.find((n) => {
        return n.id === attributeID;
      });
      if (!node)
        return rejectWithValue(`Attribute with ID ${attributeID} not found.`);

      const isUsed = isPartOfAggregation(attributeID, attributes);
      if (isUsed)
        return rejectWithValue("Node is part of an existing aggregation");

      if (node.type === "aggregation") {
        dispatch(removeColumn({ colName: node.name }));
      }

      return payload;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const changeRelationship = createAsyncThunk(
  "attributes/changeRelationship",
  async ({ sourceID, targetID, recover }, { getState, rejectWithValue }) => {
    const attributes = getState().metadata.attributes;

    const sourceIdx = attributes.findIndex((n) => n.related.includes(sourceID));
    const targetIdx = attributes.findIndex((n) => n.id === targetID);

    if (sourceIdx === -1 || targetIdx === -1) {
      return rejectWithValue("Source or target not found");
    }

    const isUsed = isPartOfAggregation(sourceID, attributes);
    if (isUsed)
      return rejectWithValue("Node is part of an existing aggregation");

    return {
      sourceID,
      recover,
      sourceIdx,
      targetIdx,
    };
  }
);

export const updateHierarchy = createAsyncThunk(
  "metadata/updateHierarchy",
  async ({ hierarchy, filename }, { dispatch, rejectWithValue }) => {
    try {
      const tree = generateTree(hierarchy, 0);
      const navioColumns = getVisibleNodes(tree);
      dispatch(generateColumnBatch({ cols: hierarchy }));
      return {
        filename: getFileName(filename),
        hierarchy,
        navioColumns,
      };
    } catch (error) {
      console.error("updateHierarchy failed:", error);
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

export const updateDescriptions = createAsyncThunk(
  "metadata/updateDescriptions",
  async ({ descriptions, filename }, { getState, rejectWithValue }) => {
    try {
      const table = aq.fromCSV(descriptions);

      const descMap = table.objects().reduce((acc, row) => {
        const key = row.name?.trim();
        if (!key) return acc;

        acc[key] = {
          description: row.description?.trim() ?? "",
          decimalPlaces:
            row["Decimal Places"] != null
              ? Number(row["Decimal Places"])
              : null,
          task: row.Task?.trim() ?? null,
          variant: row.Variant?.trim() ?? null,
        };

        return acc;
      }, {});

      const attributes = getState().metadata.attributes.map((attr) => {
        const entry = descMap[attr.name];

        return entry
          ? {
              ...attr,
              desc: entry.description,
            }
          : attr;
      });

      return {
        attributes,
        filename: getFileName(filename),
      };
    } catch (error) {
      return rejectWithValue(error?.message ?? "Failed to update descriptions");
    }
  }
);
