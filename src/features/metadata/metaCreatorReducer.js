import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  generateEmpty,
  generateAggregation,
  removeColumn,
  removeBatch,
  generateAggregationBatch,
} from "../data/modifyReducers";

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

export const CreateToMeta = createAsyncThunk(
  "meta/build-auto-create",
  async (payload, thunkAPI) => {
    return new Promise(async (resolve, reject) => {
      const allNodes = thunkAPI
        .getState()
        .metadata.attributes.filter((n) => n.type == "root");
      const attributes = allNodes
        .filter((n) => n.type === "attribute")
        .map((n) => n.name);

      const newAggregations = payload.filter(
        (m) =>
          (m.type == "aggregation") &
          (attributes.find((n) => n == m.name) == null)
      );

      const oldAggregations = allNodes
        .filter((m) => m.type == "aggregation")
        .map((n) => n.name);

      await thunkAPI
        .dispatch(removeBatch({ cols: oldAggregations }))
        .then((res) => {
          thunkAPI.dispatch(
            generateAggregationBatch({ cols: newAggregations })
          );
        });

      return resolve(payload);
    });
  }
);

export const buildMetaFromVariableTypes = createAsyncThunk(
  "meta/build-from-data",
  async (payload, thunkAPI) => {
    return new Promise((resolve, reject) => {
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

        const all = [root, ...nodeInfo];
        resolve(all);
      } catch (error) {
        reject(error);
      }
    });
  }
);

export const addAttribute = createAsyncThunk(
  "meta/add-attribute",
  async (payload, { dispatch }) => {
    return new Promise((resolve, reject) => {
      const { name, type } = payload;

      if (type == "aggregation") dispatch(generateEmpty({ colName: name }));
      return resolve(payload);
    });
  }
);

export const updateAttribute = createAsyncThunk(
  "meta/update-attribute",
  async (payload, { dispatch }) => {
    return new Promise((resolve, reject) => {
      const { name, type, info, recover } = payload;
      if (type == "aggregation") {
        if (info.exec === "") {
          dispatch(generateEmpty({ colName: name }));
        } else {
          dispatch(
            generateAggregation({
              colName: name,
              formula: info.exec,
            })
          );
        }
      }

      if ((recover == null) | recover) {
        return resolve({ node: { ...payload }, recover: null });
      } else {
        const { recover, ...newNode } = payload;
        return resolve({ node: { ...newNode }, recover: false });
      }
    });
  }
);

export const removeAttribute = createAsyncThunk(
  "meta/remove-attribute",
  async (payload, { dispatch, getState }) => {
    return new Promise((resolve, reject) => {
      const { attributeID } = payload;
      const meta = getState().metadata.attributes;
      const node = meta.find((n) => n.id === attributeID);

      if (node.type == "aggregation") {
        dispatch(removeColumn({ colName: node.name }));
      }
      return resolve(payload);
    });
  }
);
