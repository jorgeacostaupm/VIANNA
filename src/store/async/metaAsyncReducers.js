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

let parser = get_parser();

function getAggregation(operation, params, node) {
  const colName = node.data.name;
  const id = node.data.id;
  let formula = "";
  let name = "";

  switch (operation) {
    case "zscore":
      formula = `${operation}($(${colName}))`;
      name = `Z-${colName}`;
      break;

    case "zscoreByGroup":
      if (!params.group || params.group.length === 0) {
        throw new Error("Group parameter is required for zscoreByGroup");
      }
      formula = `${operation}($(${colName}), $(${params.group}))`;
      name = `Z-${colName}-${params.group}`;
      break;

    case "zscoreByValues":
      if (!params[id]?.mean || !params[id]?.stdev) {
        throw new Error(
          `Mean and stdev are required for node ${colName} (${id})`
        );
      }
      const { mean, stdev } = params[id];
      formula = `${operation}($(${colName}), ${mean}, ${stdev})`;
      name = `Z-${colName} µ:${mean} σ:${stdev}`;
      break;

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

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
            dtype: "number",
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
        const key = row.measure_name?.trim();
        if (!key) return acc;

        acc[key] = {
          description: row.measure_description?.trim() ?? "",
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
