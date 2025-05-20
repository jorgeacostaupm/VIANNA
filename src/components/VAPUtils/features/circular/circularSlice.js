import { createSlice } from "@reduxjs/toolkit";
import { addItems2List } from "../slicesFunctions";

const initialState = {
  data: null,
  init: false,
  processing: false,
  processingError: null,

  vis_attr: null,
  link_opacity: 0.1,
  is_hipo: false,
  is_hiper: false,
  curve_value: 0.85,

  is_filter: false,
  is_vis_filter: true,
  is_complete: false,
  is_fixed: false,
  filter_attr: null,
  range: [],
  filter_value: null,
  filtering_expr: "",
  bool_matrix: [],

  multi_attrs: [],

  nodes: [],
  links: [],
  link_attrs: [],

  config: {
    tooltip: true,
    select_links: true,
    select_areas: true,
  },
};

const circularSlice = createSlice({
  name: "circular",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },

    setLinks: (state, action) => {
      state.links = action.payload;
    },
    addLink: (state, action) => {
      const link = action.payload;
      state.links = [...state.links, link];
    },
    addLinks: (state, action) => {
      const links = action.payload;
      const existingLinks = state.links;
      const new_links = addItems2List(links, existingLinks, true);
      state.links = [...state.links, ...new_links];
    },
    removeLink: (state, action) => {
      state.links = [
        ...state.links.slice(0, action.payload),
        ...state.links.slice(action.payload + 1),
      ];
    },
    removeLinks: (state, action) => {
      const links = action.payload;
      const existingLinks = state.links;
      const new_links = addItems2List(links, existingLinks, false);
      state.links = state.links.filter((stateLink) => {
        return !new_links.some(
          (link) =>
            link.x_node === stateLink.x_node && link.y_node === stateLink.y_node
        );
      });
    },

    setData: (state, action) => {
      state.data = action.payload;
    },

    setVisAttr: (state, action) => {
      state.vis_attr = action.payload;
    },
    setLinkOpacity: (state, action) => {
      state.link_opacity = action.payload;
    },
    setCurveValue: (state, action) => {
      state.curve_value = action.payload;
    },
    setIsFixed: (state, action) => {
      state.is_fixed = action.payload;
    },
    setIsHipo: (state, action) => {
      state.is_hipo = action.payload;
    },
    setIsHiper: (state, action) => {
      state.is_hiper = action.payload;
    },

    setIsComplete: (state, action) => {
      state.is_complete = action.payload;
    },
    setIsFilter: (state, action) => {
      state.is_filter = action.payload;
    },
    setIsVisFilter: (state, action) => {
      state.is_vis_filter = action.payload;
    },
    setFilterRange: (state, action) => {
      state.range = action.payload;
      state.filter_value = 0.7;
    },
    setFilterAttr: (state, action) => {
      state.filter_attr = action.payload;
    },
    setFilterValue: (state, action) => {
      state.filter_value = action.payload;
    },

    setConfig: (state, action) => {
      state.config = action.payload;
    },

    setFilteringExpr: (state, action) => {
      state.filtering_expr = action.payload;
    },
    setBoolMatrix: (state, action) => {
      state.bool_matrix = action.payload;
    },
    addMultiAttr: (state, action) => {
      state.multi_attrs = [...state.multi_attrs, action.payload];
    },
    removeMultiAttr: (state, action) => {
      state.multi_attrs = [
        ...state.multi_attrs.slice(0, action.payload),
        ...state.multi_attrs.slice(action.payload + 1),
      ];
    },
  },
});

export default circularSlice.reducer;
export const {
  setInit,
  setData,
  setConfig,

  setVisAttr,
  setLinkOpacity,
  setIsHipo,
  setIsHiper,
  setCurveValue,

  setIsFilter,
  setIsComplete,
  setIsFixed,
  setFilterRange,
  setFilterAttr,
  setFilterValue,
  setFilteringExpr,
  setBoolMatrix,
  setIsVisFilter,

  addMultiAttr,
  removeMultiAttr,

  setLinks,
  addLink,
  addLinks,
  removeLink,
  removeLinks,
} = circularSlice.actions;
