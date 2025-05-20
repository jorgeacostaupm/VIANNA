import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  buildMetaFromVariableTypes,
  addAttribute,
  removeAttribute,
  updateAttribute,
  CreateToMeta,
} from "./metaCreatorReducer";

import { from as loadObjects, loadCSV } from "arquero";
import * as XLSX from "xlsx";
import { pubsub } from "../../../VAPUtils/pubsub";
import { setDescriptions } from "../cantab/cantabSlice";
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
  attributes: [
    {
      id: 0,
      name: "Raíz",
      desc: "nodo origen",
      type: "root",
      dtype: "none",
      isShown: true,
      related: [],
      info: {},
    },
  ],
  loadingStatus: "ready",
  recoverableOperations: [],
  version: -1,
};

export const addDescriptionsFromCSV = createAsyncThunk(
  "meta/load-desc-csv",
  async (payload, thunkAPI) => {
    const delimiter = payload.opts.delimiter || ",";
    const decimal = payload.opts.decimal || ".";
    const dt = await loadCSV(payload.fileURL, {
      delimiter: delimiter,
      decimal: decimal,
    });
    const attrCol = payload.opts.attributes;
    const descCol = payload.opts.descriptions;

    const desc_pairs = {};
    dt.objects().forEach((r) => {
      desc_pairs[r[attrCol]] = r[descCol];
    });

    return desc_pairs;
  }
);

export const addDescriptionsFromExcel = createAsyncThunk(
  "metadata/load-desc-excel",
  async (payload, thunkApi) => {
    try {
      const { fileURL, opts } = payload;
      const response = await fetch(fileURL);
      const data = await response.arrayBuffer();

      const workbook = XLSX.read(data, { type: "buffer" });
      const worksheet = workbook.Sheets[opts.sheetname];
      const dt = loadObjects(XLSX.utils.sheet_to_json(worksheet));

      const desc_pairs = {};
      dt.objects().forEach((r) => {
        desc_pairs[r[attrCol]] = r[descCol];
      });

      return desc_pairs;
    } catch (err) {
      return thunkApi.rejectWithValue("Invalid Excel File");
    }
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
      // Toggle the node.
      state.attributes[attributeIdx].isShown =
        !state.attributes[attributeIdx].isShown;
    }),

    // This reducer updates the node information. This method may be used by the editor form.
    changeRelationship: create.reducer((state, action) => {
      const { source, target, recover } = action.payload;
      const sourceIdx = state.attributes.findIndex((n) =>
        n.related.includes(source)
      );
      const targetIdx = state.attributes.findIndex((n) => n.id === target);

      // Add to Stack First
      if (recover == null || recover) {
        state.recoverableOperations.push({
          change: "relationshipNode",
          associatedId: source,
          associatedParent: state.attributes[sourceIdx].id,
          associatedData: {
            originalPos: state.attributes[sourceIdx].related.findIndex(
              (n) => n == source
            ),
          }, // Not required
        });
      }
      // Update Node
      state.attributes[sourceIdx].related = state.attributes[
        sourceIdx
      ].related.filter((n) => n !== source);

      state.attributes[targetIdx].related = [
        ...state.attributes[targetIdx].related.filter(
          // remove duplicates
          (n) => n !== source
        ),
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

      // remove from node
      state.attributes[modifiedIdx].related = state.attributes[
        modifiedIdx
      ].related.filter((i) => i != associatedId);
      if (state.attributes[modifiedIdx] === "aggregation") {
        state.attributes[modifiedIdx].info.usedAttributes = state.attributes[
          modifiedIdx
        ].info.usedAttributes.filter((u) => u.id != associatedId);
      }

      // re append to the node
      const targetIdx = state.attributes.findIndex(
        (n) => n.id === associatedParent
      );
      const related = state.attributes[targetIdx].related;
      related.splice(originalPos, 0, associatedId);
      state.attributes[targetIdx].related = related;
      state.version -= 0.5;
    }),

    setFullMeta: create.reducer((state, action) => {
      /* 
      const attributes =
        state.attributes.filter((n) => n.type === 'attribute').map((n) => n.name)?.length || 0;
      const contentAttributes =
        action.payload.filter((n) => n.type === 'attribute').map((n) => n.name)?.length || 0;

      
      if (contentAttributes < attributes) {
        publish('addAlertNotification', {
          type: 'warn',
          msg: `Se han borrado ${contentAttributes - attributes} atributos base al importar.`
        });
      } */
      state.attributes = action.payload;
      state.loadingStatus = "done";
      state.version = state.version === 0 ? 1 : 0; // if state is keep equal, the view may not be updated.
    }),
  }),
  extraReducers: (builder) => {
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
    builder.addCase(setDescriptions, (state, action) => {
      const desc = action.payload;
      state.attributes = state.attributes.map((n) => {
        const name = n.name;
        n.desc = desc.hasOwnProperty(name) ? desc[name] : "";
        return n;
      });
      state.loadingStatus = "done";
      state.version = 0;
    });

    // Add description from CSV
    builder.addCase(addDescriptionsFromCSV.fulfilled, (state, action) => {
      const desc = action.payload;
      state.attributes = state.attributes.map((n) => {
        const name = n.name;
        n.desc = desc.hasOwnProperty(name) ? desc[name] : "";
        return n;
      });
      state.loadingStatus = "done";
      state.version = 0;
    });
    builder.addCase(addDescriptionsFromCSV.pending, (state) => {
      state.loadingStatus = "loading";
    });
    builder.addCase(addDescriptionsFromCSV.rejected, (state, action) => {
      console.error("meta: fallo crear. error: ", action.payload);
      publish("addAlertNotification", {
        type: "error",
        msg: `Failure to Load Attribute Metadata:\n${action.payload}`,
      });
      state.loadingStatus = "error";
    });

    builder.addCase(addDescriptionsFromExcel.fulfilled, (state, action) => {
      const desc = action.payload;

      state.attributes = state.attributes.map((n) => {
        const name = n.name;
        n.desc = desc.hasOwnProperty(name) ? desc[name] : "";
        return n;
      });
      state.loadingStatus = "done";
      state.version = 0;
    });
    builder.addCase(addDescriptionsFromExcel.pending, (state) => {
      state.loadingStatus = "loading";
    });
    builder.addCase(addDescriptionsFromExcel.rejected, (state, action) => {
      publish("addAlertNotification", {
        type: "error",
        msg: `Failure to Load Attribute Metadata:\n${action.payload}`,
      });
      state.loadingStatus = "error";
    });

    // Add Attribute Async
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
          associatedData: null, // Not required
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

    // Remove Node
    builder.addCase(removeAttribute.fulfilled, (state, action) => {
      const { attributeID, recover } = action.payload;
      if (attributeID === 0) return; // avoid removing the root node.

      // Find Parent Node
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

      // move the children to the parent. this avoid removing nodes
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
          associatedParent: null, // Not of interest
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
      console.error("fallo actualización node:", action.payload);
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
  setNavioColumns,
  setFullMeta,
  changeRelationship,
  toggleAttribute,
  revertChangeRelationship,
} = metaSlice.actions;
export const nodeSelector = (state) => state.metadata.attributes;
export default metaSlice.reducer;
