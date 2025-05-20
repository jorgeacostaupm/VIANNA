import { createSlice } from '@reduxjs/toolkit';
import { DISTANCES, ALGORITHMS } from '@/components/VAPUtils/Constants';
import { addItems2List } from '../slicesFunctions';
import { updateData } from '../main/mainSlice';

const initialState = {
  data: null,
  init: false,
  processing: false,
  processingError: null,

  vis_attr: null,
  diagonal: true,
  divided: false,

  is_filter: false,
  is_vis_filter: true,
  filter_attr: null,
  range: [],
  filter_value: 0,
  filtering_expr: '',
  bool_matrix: [],
  specialFilterValues: {},

  reorder_attr: null,
  is_reorder: false,
  is_vis_reorder: true,
  algorithm: ALGORITHMS[0].value,
  distance: DISTANCES[0].value,

  multi_attrs: [],

  nodes: [],
  links: [],
  link_attrs: [],

  config: {
    tooltip: true,
    select_links: true,
    select_areas: true,
    filter_zoom: true,
    sync_select_nodes: true,
    sync_select_links: false,
    brush: true
  }
};

const matrixSlice = createSlice({
  name: 'matrix',
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
        ...state.links.slice(action.payload + 1)
      ];
    },
    removeLinks: (state, action) => {
      const links = action.payload;
      const existingLinks = state.links;
      const new_links = addItems2List(links, existingLinks, false);
      state.links = state.links.filter((stateLink) => {
        return !new_links.some(
          (link) => link.x_node === stateLink.x_node && link.y_node === stateLink.y_node
        );
      });
    },

    setData: (state, action) => {
      state.data = action.payload;
    },

    setVisAttr: (state, action) => {
      state.vis_attr = action.payload;
    },
    setDivided: (state, action) => {
      state.divided = action.payload;
    },
    setDiagonal: (state, action) => {
      state.diagonal = action.payload;
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
    setSpecialFilterValues: (state, action) => {
      const measure = action.payload.acronim;
      const value = action.payload.value;
      state.specialFilterValues[measure] = value;
    },
    setFilteringExpr: (state, action) => {
      state.filtering_expr = action.payload;
    },
    setBoolMatrix: (state, action) => {
      state.bool_matrix = action.payload;
    },

    setIsReorder: (state, action) => {
      state.is_reorder = action.payload;
    },
    setIsVisReorder: (state, action) => {
      state.is_vis_reorder = action.payload;
    },
    setReorderAttr: (state, action) => {
      state.reorder_attr = action.payload;
    },
    setAlgorithm: (state, action) => {
      state.algorithm = action.payload;
    },
    setDistance: (state, action) => {
      state.distance = action.payload;
    },

    setConfig: (state, action) => {
      state.config = action.payload;
    },

    addMultiAttr: (state, action) => {
      state.multi_attrs = [...state.multi_attrs, action.payload];
    },
    removeMultiAttr: (state, action) => {
      state.multi_attrs = [
        ...state.multi_attrs.slice(0, action.payload),
        ...state.multi_attrs.slice(action.payload + 1)
      ];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateData.fulfilled, (state, action) => {
      state.multi_attrs = [];
    });
  }
});

export default matrixSlice.reducer;
export const {
  setInit,
  setIsFilter,
  setData,
  setIsReorder,
  setBands,
  setFilterRange,
  setAttributes,
  setVisAttr,
  setDivided,
  setDiagonal,
  setFilterAttr,
  setReorderAttr,
  setBand,
  setFilterValue,
  setAlgorithms,
  setAlgorithm,
  setConfig,
  setSmallBands,
  setDistance,
  addMultiAttr,
  removeMultiAttr,
  setFilteringExpr,
  setBoolMatrix,
  setIsVisFilter,
  setLinks,
  addLink,
  addLinks,
  removeLink,
  removeLinks,
  setIsVisReorder,
  setSpecialFilterValues
} = matrixSlice.actions;
