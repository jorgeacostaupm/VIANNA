import '../configuration/styles.css';
import store from '@/components/VAPUtils/features/store';
import { Button } from 'antd';
import { SaveOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useApiServiceInfo } from '@/context/apiservice-context';
import axios from 'axios';
import {
  setSelectedIds,
  resetEditAtlas,
  setAtlases,
  setAtlas
} from '@/components/VAPUtils/features/atlas/atlasSlice';
import { useDispatch, useSelector } from 'react-redux';
import { pubsub } from '@/components/VAPUtils/pubsub';
const { publish } = pubsub;

export const ResetAtlas = () => {
  return (
    <Button onClick={resetAtlas} type="primary">
      <UndoOutlined></UndoOutlined> Reset
    </Button>
  );
};

export const SaveAtlas = () => {
  const context = useApiServiceInfo();
  const dispatch = useDispatch();

  function saveAtlas() {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(context?.apiServiceInfo && { Authorization: `Token ${context.apiServiceInfo.token}` })
      }
    };
    const atlas = getNewAtlas();
    console.log('ATLAS', atlas);

    axios
      .post('/server/api/vis/atlases/', atlas, options)
      .then((res) => {
        console.log(res);
        const data = res.data;
        const atlases = data.atlases;
        const atlas = data.atlas;
        const msg = data.message;
        dispatch(setAtlases(atlases));
        dispatch(setAtlas(atlas));

        const configuration = {
          message: msg,
          type: 'success'
        };
        publish('notification', configuration);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <Button onClick={saveAtlas} type="primary">
      <SaveOutlined></SaveOutlined> Save
    </Button>
  );
};

export const DeleteAtlas = () => {
  const context = useApiServiceInfo();
  const atlas = useSelector((s) => s.atlas.selected_atlas);
  const dispatch = useDispatch();

  function deleteAtlas() {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(context?.apiServiceInfo && { Authorization: `Token ${context.apiServiceInfo.token}` })
      }
    };

    const id = atlas.id;
    console.log(atlas);
    axios
      .delete(`/server/api/vis/atlases/${id}/`, options)
      .then((res) => {
        console.log(res);
        const data = res.data;
        const atlases = data.atlases;
        const msg = data.message;
        dispatch(setAtlases(atlases));
        dispatch(setAtlas(null));

        const configuration = {
          message: msg,
          type: 'success'
        };
        publish('notification', configuration);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <Button onClick={deleteAtlas} type="primary">
      <DeleteOutlined></DeleteOutlined> Delete
    </Button>
  );
};

export default SaveAtlas;

function getNewAtlas() {
  const base_rois = store.getState().atlas.atlas_3d.rois;
  const selected_ids = store.getState().atlas.selected_ids;
  const title = store.getState().atlas.edit_title;
  const base = store.getState().atlas.atlas_3d.base;
  const description = store.getState().atlas.edit_description;
  const view_policy = store.getState().atlas.edit_view_policy;
  console.log(base_rois);
  const rois = base_rois
    .filter((roi) => selected_ids.includes(roi.label))
    .map((roi) => {
      const { mesh_points, ...rest } = roi;
      return rest;
    });

  return { title, base, description, view_policy, rois };
}

export function resetAtlas() {
  const atlas = store.getState().atlas.selected_atlas;
  const ids = atlas.rois.map((roi) => roi.label);
  store.dispatch(setSelectedIds(ids));
  store.dispatch(resetEditAtlas());
}
