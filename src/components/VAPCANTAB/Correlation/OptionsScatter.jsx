import React from 'react';
import { Checkbox, Slider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setPointsSize } from '@/components/VAPUtils/features/correlation/correlationSlice';

const OptionsScatter = () => {
  const points_size = useSelector((state) => state.correlation.points_size);
  console.log(points_size);

  const dispatch = useDispatch();

  const onPointsSizeComplete = (value) => {
    dispatch(setPointsSize(value));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ fontSize: '16px' }}>Points size:</div>

      <Slider
        min={1}
        max={10}
        defaultValue={points_size}
        onChangeComplete={onPointsSizeComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default OptionsScatter;
