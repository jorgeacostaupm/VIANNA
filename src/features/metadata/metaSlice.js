import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  buildMetaFromVariableTypes,
  addAttribute,
  removeAttribute,
  updateAttribute,
  CreateToMeta,
} from "./metaCreatorReducer";
import { pubsub } from "@/utils/pubsub";
import { generateTree, getVisibleNodes } from "@/utils/functions";
import { generateAggregationBatch } from "../data/modifyReducers";
const { publish } = pubsub;

/*
Slice con una lista de metadatos para todas las columnas:
metadatos:
- id columna
- nombre columna
- tipo attributo | agregación
- relacionados ( hijos de jerarquía )
- isShown: boolean
- agregación:
    - tipo
    - formula (string)
    - atributos usados (orden) (suma, concatenación, media)
        - id
        - used (true)
        - weight 
        
*/

/*
{
    {
        change: nodeMove, removeAggregation, changeNode,
        associatedId: affected node id,
        associatedParent: affected node parent id,
        associatedData: node copy
    }
}
*/

const initialState = {
  init: false,
  filename: null,
  attributes: null,
  loadingStatus: "ready",
  recoverableOperations: [],
  version: -1,
};

export const addDescriptionsFromCSV = createAsyncThunk(
  "meta/load-desc-csv",
  async (payload, thunkAPI) => {
    return payload;
  }
);

export const undoOperation = createAsyncThunk(
  "meta/undo",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    const stack = getState().metadata.recoverableOperations;
    if (stack.length < 1) return rejectWithValue("No hay nada que deshacer");

    const last = stack[stack.length - 1];
    switch (last.change) {
      case "updateNode":
        dispatch(
          updateAttribute({
            ...last.associatedData,
            recover: false,
          })
        );
        break;
      case "addNode":
        dispatch(
          removeAttribute({
            attributeID: last.associatedId,
            recover: false,
          })
        );
      case "removeNode":
        dispatch(
          addAttribute({
            ...last.associatedData,
            parentID: last.associatedParent,
            recover: false,
          })
        );
        break;
      case "relationshipNode":
        dispatch(revertChangeRelationship(last));
        break;
      default:
        return rejectWithValue("Acción a Recuperar No Conocida");
    }
    return {};
  }
);

export const updateHierarchy = createAsyncThunk(
  "metadata/updateHierarchy",
  async ({ hierarchy, filename }, { dispatch, rejectWithValue }) => {
    try {
      const tree = generateTree(hierarchy, 0);
      const navioColumns = getVisibleNodes(tree);
      dispatch(generateAggregationBatch({ cols: hierarchy }));
      return {
        filename,
        hierarchy,
        navioColumns,
      };
    } catch (error) {
      console.error("updateHierarchy failed:", error);
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

export const metaSlice = createSlice({
  name: "metadata",
  initialState: initialState,
  reducers: (create) => ({
    setInit: create.reducer((state, action) => {
      state.init = action.payload;
    }),

    toggleAttribute: create.reducer((state, action) => {
      const { attributeID } = action.payload;
      const attributeIdx = state.attributes.findIndex(
        (n) => n.id === attributeID
      );
      if (attributeIdx == -1) {
        console.error(`The node ${attributeID} does not exist`).return;
      }
      state.attributes[attributeIdx].isShown =
        !state.attributes[attributeIdx].isShown;
    }),

    changeRelationship: create.reducer((state, action) => {
      const { source, target, recover } = action.payload;
      const sourceIdx = state.attributes.findIndex((n) =>
        n.related.includes(source)
      );
      const targetIdx = state.attributes.findIndex((n) => n.id === target);

      if (recover == null || recover) {
        state.recoverableOperations.push({
          change: "relationshipNode",
          associatedId: source,
          associatedParent: state.attributes[sourceIdx].id,
          associatedData: {
            originalPos: state.attributes[sourceIdx].related.findIndex(
              (n) => n == source
            ),
          },
        });
      }

      state.attributes[sourceIdx].related = state.attributes[
        sourceIdx
      ].related.filter((n) => n !== source);

      state.attributes[targetIdx].related = [
        ...state.attributes[targetIdx].related.filter((n) => n !== source),
        source,
      ];

      if (state.attributes[sourceIdx].type == "aggregation") {
        const usedAttributes = state.attributes[
          sourceIdx
        ].info.usedAttributes.filter((n) => n.id !== source);
        state.attributes[sourceIdx].info.usedAttributes = usedAttributes;
      }

      state.version += 0.5;
    }),

    revertChangeRelationship: create.reducer((state, action) => {
      const {
        associatedId,
        associatedParent,
        associatedData: { originalPos },
      } = action.payload;
      const modifiedIdx = state.attributes.findIndex((n) =>
        n.related.includes(associatedId)
      );
      state.attributes[modifiedIdx].related = state.attributes[
        modifiedIdx
      ].related.filter((i) => i != associatedId);
      if (state.attributes[modifiedIdx] === "aggregation") {
        state.attributes[modifiedIdx].info.usedAttributes = state.attributes[
          modifiedIdx
        ].info.usedAttributes.filter((u) => u.id != associatedId);
      }

      const targetIdx = state.attributes.findIndex(
        (n) => n.id === associatedParent
      );
      const related = state.attributes[targetIdx].related;
      related.splice(originalPos, 0, associatedId);
      state.attributes[targetIdx].related = related;
      state.version -= 0.5;
    }),

    setFullMeta: create.reducer((state, action) => {
      const { hierarchy, filename } = action.payload;
      state.attributes = hierarchy;
      state.filename = filename;
      state.loadingStatus = "done";
      state.version = state.version === 0 ? 1 : 0;
    }),

    setDescriptions: create.reducer((state, action) => {
      const descriptions = action.payload;
      state.attributes = state.attributes.map((attr) => {
        const name = attr.name;
        let desc = descriptions.find(
          (item) => item.measure_name === name
        )?.measure_description;
        attr.desc = desc ? desc : "";
        return attr;
      });
      state.version = 0;

      const configuration = {
        message: "Descriptions Added",
        description: "",
        type: "success",
      };
      publish("notification", configuration);
    }),
  }),
  extraReducers: (builder) => {
    builder.addCase(updateHierarchy.fulfilled, (state, action) => {
      const { hierarchy, filename } = action.payload;
      state.attributes = hierarchy;
      state.filename = filename;
      state.loadingStatus = "done";
      state.version = state.version === 0 ? 1 : 0;
    });
    builder.addCase(updateHierarchy.rejected, (state, action) => {
      const configuration = {
        message: "Error in updateHierarchy",
        description: action.payload,
        type: "error",
        pauseOnHover: true,
      };
      publish("notification", configuration);
    });

    builder.addCase(buildMetaFromVariableTypes.fulfilled, (state, action) => {
      state.attributes = action.payload;
      state.version = state.version === 0 ? 1 : 0;
    });
    builder.addCase(buildMetaFromVariableTypes.rejected, (state, action) => {
      publish("addAlertNotification", {
        type: "error",
        msg: `Import Hierarchy Failure:\n${action.payload}`,
      });
    });

    builder.addCase(CreateToMeta.fulfilled, (state, action) => {
      state.attributes = action.payload;
      state.version = Math.min(state.version - 1, 0);
    });
    builder.addCase(CreateToMeta.rejected, (state, action) => {
      publish("addAlertNotification", {
        type: "error",
        msg: `Failure to Save Created Hierarchy:\n${action.payload}`,
      });
    });

    builder.addCase(addAttribute.fulfilled, (state, action) => {
      const { id, name, parentID, type, recover, info } = action.payload;
      const parentPosition = state.attributes.findIndex(
        (n) => n.id === parentID
      );
      if (parentPosition === -1) return;

      if (recover == null || recover) {
        state.recoverableOperations.push({
          change: "addNode",
          associatedId: id,
          associatedParent: null,
          associatedData: null,
        });
      }

      let newInfo;
      if (info == null) {
        newInfo =
          type === "aggregation"
            ? {
                operation: "concat",
                exec: "",
                formula: "",
                usedAttributes: [],
              }
            : {};
      } else {
        newInfo = info;
      }

      state.attributes.push({
        id: id,
        name: name,
        related: [],
        type: type,
        info: newInfo,
        isShown: true,
        desc: "",
        dtype: "determine",
      });

      state.attributes[parentPosition].related.push(id);
      state.loadingStatus = "done";
      state.version += recover != null || recover ? 0.5 : -0.5;
    });

    builder.addCase(removeAttribute.fulfilled, (state, action) => {
      const { attributeID, recover } = action.payload;
      if (attributeID === 0) return; // avoid removing the root node.

      const parentIdx = state.attributes.findIndex((n) =>
        n.related.includes(attributeID)
      );

      if (recover == null || recover) {
        const attrRelatedPos = state.attributes[parentIdx].related.findIndex(
          (n) => n == attributeID
        );
        const attribute = state.attributes.find((n) => n.id === attributeID);
        if (attribute == null) return;
        if (attribute.type === "attribute") {
          state.recoverableOperations = [];
        } else {
          state.recoverableOperations.push({
            change: "removeNode",
            associatedId: attributeID,
            associatedNodePosition: attrRelatedPos,
            associatedParent: state.attributes[parentIdx].id,
            associatedData: { ...attribute },
          });
        }
      }

      state.attributes[parentIdx].related = state.attributes[
        parentIdx
      ].related.filter((d) => d !== attributeID);

      const node = state.attributes.find((n) => n.id === attributeID);
      state.attributes[parentIdx].related = [
        ...state.attributes[parentIdx].related,
        ...node.related,
      ];

      if (state.attributes[parentIdx].info) {
        state.attributes[parentIdx].info.usedAttributes = state.attributes[
          parentIdx
        ].info.usedAttributes.filter((n) => n.id !== attributeID);
      }
      state.attributes = state.attributes.filter(
        (att) => att.id !== attributeID
      );
      state.loadingStatus = "done";
      state.version += recover != null || recover ? 0.5 : -0.5;
    });

    builder.addCase(updateAttribute.fulfilled, (state, action) => {
      const { node, recover } = action.payload;

      const idx = state.attributes.findIndex((n) => n.id === node.id);
      if (idx == null || idx === -1) return;

      if (recover == null || recover) {
        state.recoverableOperations.push({
          change: "updateNode",
          associatedId: node.id,
          associatedParent: null,
          associatedData: { ...state.attributes[idx] },
        });
      }

      state.attributes[idx] = {
        ...state.attributes[idx],
        ...node,
      };
      state.loadingStatus = "done";
      state.version += recover != null || recover ? 0.5 : -0.5;

      publish("modifyNodeInfo", { node: { id: node.id, name: node.name } });
    });
    builder.addCase(updateAttribute.rejected, (state, action) => {
      publish("addAlertNotification", {
        type: "error",
        msg: "Fallo Al Actualizar",
      });
    });

    builder.addCase(undoOperation.fulfilled, (state, action) => {
      state.recoverableOperations = state.recoverableOperations.slice(0, -1);
      publish("addAlertNotification", {
        type: "info",
        msg: "Acción Recuperada",
      });
    });
    builder.addCase(undoOperation.rejected, (state, action) => {
      publish("addAlertNotification", {
        type: "warning",
        msg: action.payload,
      });
    });
  },
});

export const {
  setInit,
  setFullMeta,
  changeRelationship,
  toggleAttribute,
  revertChangeRelationship,
  setDescriptions,
} = metaSlice.actions;
export const hierarchySelector = (state) => state.metadata.attributes;
export default metaSlice.reducer;

import { createSelector } from "reselect";
import { DataType } from "@/utils/Constants";

const selectHierarchy = (state) => state.metadata.attributes;

export const selectNumericNodes = createSelector(
  [selectHierarchy],
  (hierarchy) =>
    hierarchy
      .filter((n) => n.dtype === DataType.NUMERICAL.dtype)
      .map((n) => n.name)
);

export const selectTextNodes = createSelector([selectHierarchy], (hierarchy) =>
  hierarchy.filter((n) => n.dtype === DataType.TEXT.dtype).map((n) => n.name)
);
export const selectDetermineNodes = createSelector(
  [selectHierarchy],
  (hierarchy) =>
    hierarchy
      .filter((n) => n.dtype === DataType.UNKNOWN.dtype)
      .map((n) => n.name)
);

export const selectAggregationNodes = createSelector(
  [selectHierarchy],
  (hierarchy) =>
    hierarchy.filter((n) => n.type === "aggregation").map((n) => n.name)
);
