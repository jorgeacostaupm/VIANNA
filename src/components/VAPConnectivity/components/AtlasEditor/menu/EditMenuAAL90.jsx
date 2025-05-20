import React, { useEffect, useState } from 'react';
import { Checkbox, Collapse, Row, Col, Button } from 'antd';
import {
  hoveredRoiChanged,
  setSelectedIds,
  resetEditAtlas
} from '@/components/VAPUtils/features/atlas/atlasSlice';
import '../configuration/styles.css';
import store from '@/components/VAPUtils/features/store';
import { SaveOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { SaveAtlas, DeleteAtlas, ResetAtlas } from './EditAtlasButtons';

export const EditMenuAAL90 = (props) => {
  const [hemispheres, setHemispheres] = useState(null);
  const selected_ids = useSelector((state) => state.atlas.selected_ids);

  useEffect(() => {
    const tmp = getHemispheres();
    setHemispheres(tmp);
  }, [selected_ids]);

  return (
    <div className="edit-div">
      <div style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 800 }}> ROIs:</div>
      {hemispheres && (
        <>
          {props.edit ? (
            <Row gutter={[16, 24]}>
              <Col span={12}>
                <div style={{ marginBottom: '10px' }}> Left Hemisphere: </div>
                {hemispheres[1].children}
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '10px' }}> Right Hemisphere: </div>{' '}
                {hemispheres[0].children}
              </Col>
            </Row>
          ) : (
            <div>
              <div> Left: </div>
              {hemispheres[1].children}

              <div> Right: </div>
              {hemispheres[0].children}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditMenuAAL90;

function getHemispheres() {
  const base_atlas = store.getState().atlas.atlas_3d;
  const hemispheres_names = Array.from(new Set(base_atlas.rois.map((roi) => roi.hemisphere)));
  const lobule_names = Array.from(new Set(base_atlas.rois.map((roi) => roi.lobule)));
  const selected_ids = store.getState().atlas.selected_ids;
  const available_ids = store.getState().atlas.matrix_order;

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
      <Collapse accordion>
        {lobules.map((lobule) => (
          <Collapse.Panel key={lobule.label} header={lobule.label}>
            {generateCheckboxes(hemisphere, lobule.label)}
          </Collapse.Panel>
        ))}
      </Collapse>
    );
  }

  const handleCheckboxChange = (roiId, checked) => {
    const selected_ids = store.getState().atlas.selected_ids;

    if (checked) {
      store.dispatch(setSelectedIds([...selected_ids, roiId]));
    } else {
      store.dispatch(setSelectedIds(selected_ids.filter((id) => id !== roiId)));
    }
  };

  const handleOnMouseEnter = (roi) => {
    store.dispatch(hoveredRoiChanged(roi));
  };

  const handleOnMouseLeave = (roi) => {
    store.dispatch(hoveredRoiChanged(null));
  };

  function generateCheckboxes(hemisphere, lobule) {
    const allRois = base_atlas.rois.filter(
      (roi) => roi.hemisphere === hemisphere && roi.lobule === lobule
    );

    return allRois.map((roi) => {
      return (
        <div key={roi.acronim} style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
          <Checkbox
            checked={selected_ids.includes(roi.acronim)}
            onChange={(e) => handleCheckboxChange(roi.acronim, e.target.checked)}
            onMouseEnter={(e) => handleOnMouseEnter(roi.acronim)}
            onMouseLeave={(e) => handleOnMouseLeave(roi.acronim)}
            disabled={available_ids ? !available_ids.includes(roi.acronim) : false}
          ></Checkbox>
          <div
            title={roi.title}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {roi.title}
          </div>
        </div>
      );
    });
  }

  return hemispheres;
}
