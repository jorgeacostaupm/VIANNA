import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateData } from '../main/mainSlice';

const initialState = {
  init: false,
  atlases: [],
  selected_atlas: null,
  loading: false,
  original_atlas: null,
  atlas_3d: null,
  loading_3d: false,
  matrix_order: null,
  selected_ids: [],
  hovered_roi: null,
  links: [],

  edit_title: null,
  edit_view_policy: null,
  edit_description: null
};

const fetch3DAtlas = async (base) => {
  const res = await fetch(`/server/api/vis/atlases/atlas_3d/${base}/`);
  if (!res.ok) throw new Error(`Error fetching scenario run data: ${res.statusText}`);
  const atlas_3d = await res.json();
  return atlas_3d;
};

const fetchAtlas = async (id, options) => {
  const res = await fetch(`/server/api/vis/atlases/${id}/`, options);
  if (!res.ok) throw new Error(`Error fetching scenario run data: ${res.statusText}`);
  const atlas = await res.json();
  return atlas;
};

export const update3DAtlas = createAsyncThunk(
  'atlas/update3DAtlas',
  async (data, { rejectWithValue }) => {
    try {
      const atlas_3d = await fetch3DAtlas(data);
      console.log('3D ATLAS TO UPDATE', atlas_3d);
      return atlas_3d;
    } catch (error) {
      return rejectWithValue(error.message || 'Error...');
    }
  }
);

export const updateAtlas = createAsyncThunk(
  'atlas/updateAtlas',
  async (data, { rejectWithValue, getState, dispatch }) => {
    try {
      const actual_atlas = getState().atlas.atlas_3d;
      if (actual_atlas?.base != data.atlas.base) {
        dispatch(update3DAtlas(data.atlas.base));
      }

      const atlas = await fetchAtlas(data.atlas.id, data.options);
      console.log('CUSTOM ATLAS UPDATEx', atlas);
      return atlas;
    } catch (error) {
      return rejectWithValue(error.message || 'Error...');
    }
  }
);

const atlasSlice = createSlice({
  name: 'atlas',
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },

    setLinks: (state, action) => {
      state.links = action.payload;
    },
    hoveredRoiChanged: (state, action) => {
      state.hovered_roi = action.payload;
    },
    setSelectedIds: (state, action) => {
      state.selected_ids = action.payload;
    },
    resetIds: (state, action) => {
      state.selected_ids = state.matrix_order;
    },
    setAtlas: (state, action) => {
      state.selected_atlas = action.payload;
    },
    setAtlases: (state, action) => {
      state.atlases = action.payload;
    },
    updateAtlasOrder: (state, action) => {
      state.matrix_order = action.payload;
    },
    setAtlasEditTitle: (state, action) => {
      state.edit_title = action.payload;
    },
    setAtlasEditViewPolicy: (state, action) => {
      state.edit_view_policy = action.payload;
    },
    setAtlasEditDescription: (state, action) => {
      state.edit_description = action.payload;
    },
    resetEditAtlas: (state, action) => {
      state.edit_title = state.selected_atlas.title;
      state.edit_view_policy = state.selected_atlas.view_policy;
      state.edit_description = state.selected_atlas.description;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(update3DAtlas.pending, (state, action) => {
      state.loading_3d = true;
      state.atlas_3d = null;
    }),
      builder.addCase(update3DAtlas.fulfilled, (state, action) => {
        state.atlas_3d = action.payload;
        state.loading_3d = false;
      }),
      builder.addCase(update3DAtlas.rejected, (state, action) => {
        state.loading_3d = false;
        console.error(action.payload);
      });

    builder.addCase(updateAtlas.pending, (state, action) => {
      state.loading = true;
    }),
      builder.addCase(updateAtlas.fulfilled, (state, action) => {
        state.selected_atlas = action.payload;
        state.selected_ids = action.payload.rois.map((roi) => roi.acronim);
        state.edit_title = action.payload.title;
        state.edit_view_policy = action.payload.view_policy;
        state.edit_description = action.payload.description;
        state.loading = false;
      }),
      builder.addCase(updateAtlas.rejected, (state, action) => {
        state.loading = false;
        console.error(action.payload);
      });
  }
});

export default atlasSlice.reducer;
export const {
  setLinks,
  hoveredRoiChanged,
  setSelectedIds,
  resetIds,
  setAtlases,
  setInit,
  setAtlas,
  updateAtlasOrder,
  setAtlasEditTitle,
  setAtlasEditDescription,
  setAtlasEditViewPolicy,
  resetEditAtlas
} = atlasSlice.actions;
