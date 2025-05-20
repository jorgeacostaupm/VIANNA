import React from 'react';
import { Checkbox, Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setIsReorder,
  setReorderAttr,
  setAlgorithm,
  setDistance,
  setIsVisReorder
} from '@/components/VAPUtils/features/matrix/matrixSlice';
import { DISTANCES } from '@/components/VAPUtils/Constants';
import AttributeSelector from '../../AttributeSelector';

const Reorder = (props) => {
  const dispatch = useDispatch();
  const is_reorder = useSelector((state) => state.matrix.is_reorder);
  const is_vis_reorder = useSelector((state) => state.matrix.is_vis_reorder);
  const distance = useSelector((state) => state.matrix.distance);
  const algorithm = useSelector((state) => state.matrix.algorithm);

  const onChangeCheckbox = (e) => {
    dispatch(setIsReorder(e.target.checked));
    if (e.target.checked && is_vis_reorder) dispatch(setIsVisReorder(!e.target.checked));
  };

  const onChangeVisCheckbox = (e) => {
    dispatch(setIsVisReorder(e.target.checked));
    if (e.target.checked && is_reorder) dispatch(setIsReorder(!e.target.checked));
  };

  const onChangeAlgorithm = (e) => {
    dispatch(setAlgorithm(e));
  };

  const onChangeDistance = (e) => {
    dispatch(setDistance(e));
  };

  return (
    <div>
      <Checkbox
        style={{ fontSize: '16px' }}
        checked={is_vis_reorder}
        onChange={onChangeVisCheckbox}
      >
        Reorder by Vis Attr
      </Checkbox>

      {!is_vis_reorder && (
        <>
          <Checkbox
            style={{ fontSize: '16px', marginBottom: '10px' }}
            checked={is_reorder}
            onChange={onChangeCheckbox}
          >
            Reorder by Attr
          </Checkbox>

          <AttributeSelector slice="matrix" attr="reorder_attr" setAttr={setReorderAttr} />
        </>
      )}

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
          marginTop: '10px'
        }}
      >
        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
          <div style={{ width: '40%' }}>Algorithm: </div>
          <Select
            defaultValue={algorithm}
            options={props.algorithms}
            onChange={onChangeAlgorithm}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
          <div style={{ width: '40%' }}>Distance: </div>

          <Select
            defaultValue={distance}
            options={DISTANCES}
            onChange={onChangeDistance}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Reorder;
