import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, Checkbox, Collapse, Button } from 'antd';
import { hoveredRoiChanged, setSelectedIds } from '@/components/VAPUtils/features/atlas/atlasSlice';
import '../configuration/styles.css';
import store from '@/components/VAPUtils/features/store';
import DataManager from '../../../managers/DataManager';

const utils = DataManager.getInstance();

export const EditMenuELC127 = () => {
  const atlas = useSelector((state) => state.atlas.atlas_3d);
  const selected_ids = useSelector((state) => state.atlas.selected_ids);
  const order = useSelector((state) => state.atlas.matrix_order);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#1677ff', gap: '10px' }}> ROIs:</div>
      {atlas?.rois.map((roi) => {
        return (
          <div
            key={roi.label}
            style={{ textAlign: 'left', width: 'fit-content' }}
            onMouseEnter={() => handleOnMouseEnter(roi.label)}
            onMouseLeave={() => handleOnMouseLeave()}
          >
            <Checkbox
              checked={selected_ids.includes(roi.label)}
              onChange={(e) => handleCheckboxChange(roi.label, e.target.checked)}
              disabled={order ? (order.includes(roi.label) ? false : true) : false}
            >
              {roi.acronim}
            </Checkbox>
          </div>
        );
      })}
    </div>
  );
};

export default EditMenuELC127;

function handleCheckboxChange(roiLabel, checked) {
  const selected_ids = store.getState().atlas.selected_ids;

  if (checked) {
    store.dispatch(setSelectedIds([...selected_ids, roiLabel]));
  } else {
    store.dispatch(setSelectedIds(selected_ids.filter((id) => id !== roiLabel)));
  }
}

function handleOnMouseEnter(roi) {
  store.dispatch(hoveredRoiChanged(roi));
}

function handleOnMouseLeave() {
  store.dispatch(hoveredRoiChanged(null));
}

function getHemispheres() {
  const base_atlas = utils.getBaseAtlas();

  const hemispheres_names = Array.from(new Set(base_atlas.rois.map((roi) => roi.hemisphere)));
  const lobule_names = Array.from(new Set(base_atlas.rois.map((roi) => roi.lobule)));
  const lobules = lobule_names.map((item) => ({
    key: item,
    label: item
  }));

  const hemispheres = hemispheres_names.map((hemisphereKey) => ({
    key: hemisphereKey,
    label: hemisphereKey.charAt(0).toUpperCase() + hemisphereKey.slice(1) + ' Hemisphere',
    children: renderHemisphereCollapse(hemisphereKey, lobules)
  }));

  function renderHemisphereCollapse(hemisphere, lobules) {
    return (
      <Collapse style={{}} accordion>
        {lobules.map((lobule) => (
          <Collapse.Panel key={lobule.label} header={lobule.label}>
            {generateCheckboxes(hemisphere, lobule.label)}
          </Collapse.Panel>
        ))}
      </Collapse>
    );
  }

  function generateCheckboxes(hemisphere, lobule) {
    const selected_ids = store.getState().atlas.selected_ids;
    const allRois = base_atlas.rois.filter(
      (roi) => roi.hemisphere === hemisphere && roi.lobule === lobule
    );

    return allRois.map((roi) => (
      <div key={roi.key} style={{ textAlign: 'left' }}>
        <Checkbox
          defaultChecked={selected_ids.includes(roi.acronim)}
          onChange={(e) => handleCheckboxChange(roi.acronim, e.target.checked)}
          onMouseEnter={(e) => handleOnMouseEnter(roi.acronim)}
          onMouseLeave={(e) => handleOnMouseLeave(roi.acronim)}
        >
          {roi.title.replace(/\b(?:Left|Right)\b/g, '')}
        </Checkbox>
      </div>
    ));
  }

  return hemispheres;
}

function saveAtlas(atlas_name, is_public, messageApi) {
  const base_atlases = store.getState().atlas.base_atlases;
  const selected_atlas = store.getState().atlas.selected_atlas;
  const selected_ids = store.getState().atlas.selected_ids;

  const base_atlas = base_atlases.find((atlas) => atlas.base == selected_atlas.base);

  const custom_atlas = JSON.parse(JSON.stringify(base_atlas));
  custom_atlas.key = atlas_name.split(' ').join('');
  custom_atlas.base = selected_atlas.base;
  custom_atlas.creator = 'test';
  custom_atlas.name = atlas_name;
  custom_atlas.comments = 'TODO';
  custom_atlas.rois = custom_atlas.rois.filter((roi) => selected_ids.includes(roi.acronim));
  custom_atlas.public = true;

  const is_base = base_atlases.some((atlas) => atlas.name == custom_atlas.name);
  if (is_base) {
    messageApi.open({
      type: 'success',
      content: 'You cannot modify this Atlas'
    });
    return;
  }

  /* axios
    .post('http://127.0.0.1:8000/atlas/aal/', custom_atlas)
    .then((response) => {
      console.log('Response:', response.data);
      store.dispatch(addAtlas(custom_atlas));
    })
    .catch((error) => {
      console.error('Error:', error.response.data);
    }); */
}
