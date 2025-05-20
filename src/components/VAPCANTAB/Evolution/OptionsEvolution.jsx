import React from 'react';
import { Checkbox, Slider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setShowStd,
  setShowMeans,
  setMeanPointSize,
  setSubjectPointSize,
  setMeanStrokeWidth,
  setSubjectStrokeWidth
} from '@/components/VAPUtils/features/evolution/evolutionSlice';

const OptionsEvolution = () => {
  const showStds = useSelector((state) => state.evolution.showStds);
  const showMeans = useSelector((state) => state.evolution.showMeans);

  const dispatch = useDispatch();

  const onChangeShowStdCheckbox = (e) => {
    dispatch(setShowStd(e.target.checked));
  };

  const onChangeShowMeansCheckbox = (e) => {
    dispatch(setShowMeans(e.target.checked));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <Checkbox checked={showStds} onChange={onChangeShowStdCheckbox}>
        Show std
      </Checkbox>
      <Checkbox checked={showMeans} onChange={onChangeShowMeansCheckbox}>
        Show means
      </Checkbox>
      <MeanPointSizeSlider />
      <SubjectPointSizeSlider />
      <MeanStrokeWidthSlider />
      <SubjectStrokeWidthSlider />
    </div>
  );
};

export default OptionsEvolution;

const MeanPointSizeSlider = () => {
  const dispatch = useDispatch();
  const meanPointSize = useSelector((state) => state.evolution.meanPointSize);

  const onSliderComplete = (value) => {
    dispatch(setMeanPointSize(value));
  };

  return (
    <div>
      <div>Mean Point Size:</div>
      <Slider
        min={1}
        max={40}
        defaultValue={meanPointSize}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </div>
  );
};

const SubjectPointSizeSlider = () => {
  const dispatch = useDispatch();
  const subjectPointSize = useSelector((state) => state.evolution.subjectPointSize);

  const onSliderComplete = (value) => {
    dispatch(setSubjectPointSize(value));
  };

  return (
    <div>
      <div>Subject Point Size:</div>
      <Slider
        min={1}
        max={20}
        defaultValue={subjectPointSize}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </div>
  );
};

const MeanStrokeWidthSlider = () => {
  const dispatch = useDispatch();
  const meanStrokeWidth = useSelector((state) => state.evolution.meanStrokeWidth);

  const onSliderComplete = (value) => {
    dispatch(setMeanStrokeWidth(value));
  };

  return (
    <div>
      <div>Mean Stroke Width:</div>
      <Slider
        min={1}
        max={30}
        defaultValue={meanStrokeWidth}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </div>
  );
};

const SubjectStrokeWidthSlider = () => {
  const dispatch = useDispatch();
  const subjectStrokeWidth = useSelector((state) => state.evolution.subjectStrokeWidth);

  const onSliderComplete = (value) => {
    dispatch(setSubjectStrokeWidth(value));
  };

  return (
    <div>
      <div>Subject Stroke Width:</div>
      <Slider
        min={1}
        max={10}
        defaultValue={subjectStrokeWidth}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </div>
  );
};
