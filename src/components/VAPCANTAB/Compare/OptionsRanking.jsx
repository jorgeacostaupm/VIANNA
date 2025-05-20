import React from 'react';
import { Checkbox, Slider, Radio } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setDesc,
  setNBars,
  setIsNumeric,
  setPValue
} from '@/components/VAPUtils/features/compare/compareSlice';
import FilteredVariables from './FilteredVariables';

const OptionsRanking = () => {
  const dispatch = useDispatch();

  const desc = useSelector((state) => state.compare.desc);
  const isNumeric = useSelector((state) => state.compare.isNumeric);
  const variableType = isNumeric ? 'numeric' : 'categoric';
  const sorting = desc ? 'desc' : 'asc';

  const handleOrderChange = (e) => {
    const newValue = e.target.value === 'desc';
    dispatch(setDesc(newValue));
  };

  const handleVariableChange = (e) => {
    const newValue = e.target.value === 'numeric';
    dispatch(setIsNumeric(newValue));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Radio.Group onChange={handleOrderChange} value={sorting}>
        <Radio value="asc">Ascending Order</Radio>
        <Radio value="desc">Descending Order</Radio>
      </Radio.Group>

      <Radio.Group onChange={handleVariableChange} value={variableType}>
        <Radio value="numeric">Numeric Variables</Radio>
        <Radio value="categoric">Categoric Variables</Radio>
      </Radio.Group>

      <PValueSlider />

      <NBarsSlider />

      <FilteredVariables />
    </div>
  );
};

export default OptionsRanking;

const PValueSlider = () => {
  const dispatch = useDispatch();

  const pValue = useSelector((state) => state.compare.pValue);

  const onSliderComplete = (value) => {
    dispatch(setPValue(value));
  };

  return (
    <div>
      <div>P-Value:</div>
      <Slider
        min={0}
        max={1}
        defaultValue={pValue}
        onChangeComplete={onSliderComplete}
        step={0.01}
        style={{ width: '100%' }}
      />
    </div>
  );
};

const NBarsSlider = () => {
  const dispatch = useDispatch();

  const nBars = useSelector((state) => state.compare.nBars);

  const onSliderComplete = (value) => {
    dispatch(setNBars(value));
  };

  return (
    <div>
      <div>Nº Bars:</div>
      <Slider
        min={1}
        max={50}
        defaultValue={nBars}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
    </div>
  );
};
