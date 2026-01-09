import { createSelector } from "@reduxjs/toolkit";
import { DataType } from "@/utils/Constants";

export const hierarchySelector = (state) => state.metadata.attributes;
export const selectHierarchy = (state) => state.metadata.attributes;
export const selectMetadataAttributes = (state) =>
  state.metadata.attributes || [];

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

export const selectDescribedNodes = createSelector(
  [selectHierarchy],
  (hierarchy) => hierarchy.filter((n) => n.desc).map((n) => n.name)
);

/* export const selectNavioColumns = createSelector(
  [selectMetadataAttributes],
  (attrs) => {
    if (!attrs || attrs.length === 0) return [];

    const tmp = generateTree(attrs, 0);
    const root = hierarchy(tmp);

    root.descendants().forEach((d, i) => {
      d.id = d.data.id;
      if (d.children == null) {
        d.children = [];
      }
      d._children = null;
      if (d.height === 0) {
        d.children = null;
      }

      if (d.data.isShown) {
        d.children = d.children;
        d._children = null;
      } else {
        d._children = d.children;
        d.children = null;
      }
    });

    if (!root || !Array.isArray(root.children)) return [];

    const attributes = [];
    const addAttribute = (n) => {
      if (!n || !n.data) return;

      if (n.data.id !== 0 && n.children == null) attributes.push(n.data.name);

      if (Array.isArray(n.children)) n.children.forEach(addAttribute);
    };

    root.children?.forEach(addAttribute);

    const columns = attributes.filter((attr) => {
      const complete_attr = attrs.find((a) => a.name === attr);
      if (!complete_attr) return false;
      if (complete_attr.type !== "aggregation") return true;
      if (complete_attr.info?.exec) return true;
      return false;
    });

    return columns;
  }
); */
