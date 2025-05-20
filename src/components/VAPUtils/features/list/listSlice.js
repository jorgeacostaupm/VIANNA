import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  init: false,
  links: [],
  link_attrs: [],
};

const listSlice = createSlice({
  name: "list",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },
    setLinks: (state, action) => {
      state.links = action.payload;
    },
    addLink: (state, action) => {
      state.links.push(action.payload);
    },
    addLinks: (state, action) => {
      state.links.push(...action.payload);
    },
    removeLink: (state, action) => {
      state.links.splice(action.payload, 1);
    },
    removeLinks: (state, action) => {
      const links_to_remove = action.payload;
      state.links = state.links.filter(
        (state_link) =>
          !links_to_remove.some(
            (link) =>
              link.x_node === state_link.x_node &&
              link.y_node === state_link.y_node
          )
      );
    },
    addLinkAttr: (state, action) => {
      state.link_attrs.push(action.payload);
    },
    removeLinkAttr: (state, action) => {
      state.link_attrs.splice(action.payload, 1);
    },
  },
});

export default listSlice.reducer;
export const {
  setInit,
  setLinks,
  addLink,
  addLinks,
  removeLink,
  removeLinks,
  addLinkAttr,
  removeLinkAttr,
} = listSlice.actions;
