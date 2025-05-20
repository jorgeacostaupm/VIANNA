import React from 'react';
import { Slider, Radio } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setEstimator,
  setDistrRange,
  setNPoints,
  setPointSize
} from '@/components/VAPUtils/features/compare/compareSlice';

const OptionsDensities = () => {
  const estimator = useSelector((state) => state.compare.estimator);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '16px' }}>
      <EstimatorOptions />
      {estimator === 'swarm' && <PointSizeSlider />}
      {estimator !== 'swarm' && <NPointsSlider />}
      {estimator !== 'swarm' && <DistrRangeSlider />}
    </div>
  );
};

export default OptionsDensities;

const EstimatorOptions = () => {
  const dispatch = useDispatch();

  const estimator = useSelector((state) => state.compare.estimator);

  const handleChange = (e) => {
    dispatch(setEstimator(e.target.value));
  };

  return (
    <Radio.Group
      style={{ display: 'flex', flexDirection: 'column' }}
      onChange={handleChange}
      value={estimator}
    >
      <Radio value="density">Density</Radio>
      <Radio value="distribution">Histogram</Radio>
      <Radio value="swarm">Swarm Plot</Radio>
    </Radio.Group>
  );
};

const PointSizeSlider = () => {
  const dispatch = useDispatch();

  const pointSize = useSelector((state) => state.compare.pointSize);

  const onSliderComplete = (value) => {
    dispatch(setPointSize(value));
  };

  return (
    <>
      <div>Points Size:</div>
      <Slider
        min={0}
        max={20}
        defaultValue={pointSize}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </>
  );
};

const NPointsSlider = () => {
  const dispatch = useDispatch();

  const nPoints = useSelector((state) => state.compare.nPoints);

  const onSliderComplete = (value) => {
    dispatch(setNPoints(value));
  };

  return (
    <>
      <div>Bins:</div>
      <Slider
        min={1}
        max={250}
        defaultValue={nPoints}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </>
  );
};

const DistrRangeSlider = () => {
  const dispatch = useDispatch();

  const distrRange = useSelector((state) => state.compare.distrRange);

  const onSliderComplete = (value) => {
    dispatch(setDistrRange(value));
  };

  return (
    <>
      <div>Margins Range:</div>
      <Slider
        min={0}
        max={1}
        defaultValue={distrRange}
        onChangeComplete={onSliderComplete}
        step={0.05}
        style={{ width: '100%' }}
      />
    </>
  );
};
