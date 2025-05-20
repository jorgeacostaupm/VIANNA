import React from 'react';
import { Checkbox, Slider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setDesc,
  setNBars,
  setIsNumeric,
  setPValue,
  setFilteringList
} from '@/components/VAPUtils/features/evolution/evolutionSlice';
import FilteredVariables from './FilteredVariables';

const OptionsRanking = () => {
  const n_bars = useSelector((state) => state.evolution.nBars);
  const p_value = useSelector((state) => state.evolution.pValue);
  const asc = useSelector((state) => state.evolution.desc);
  const is_numeric = useSelector((state) => state.evolution.isNumeric);

  const dispatch = useDispatch();

  const onChangeIsNumericCheckbox = (e) => {
    dispatch(setIsNumeric(e.target.checked));
    dispatch(setFilteringList([]));
  };

  const onChangeIsNumericCheckbox1 = (e) => {
    dispatch(setIsNumeric(!e.target.checked));
    dispatch(setFilteringList([]));
  };

  const onChangeAscCheckbox = (e) => {
    dispatch(setDesc(e.target.checked));
  };

  const onChangeNBarsSliderComplete = (value) => {
    dispatch(setNBars(value));
  };

  const onChangePValue = (value) => {
    dispatch(setPValue(value));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly'
        }}
      >
        <Checkbox style={{ fontSize: '16px' }} checked={asc} onChange={onChangeAscCheckbox}>
          Asc. Order
        </Checkbox>
        <Checkbox
          style={{ fontSize: '16px' }}
          checked={is_numeric}
          onChange={onChangeIsNumericCheckbox}
        >
          Numeric Variables
        </Checkbox>
        <Checkbox
          style={{ fontSize: '16px' }}
          checked={!is_numeric}
          onChange={onChangeIsNumericCheckbox1}
        >
          Categorical Variables
        </Checkbox>
      </div>
      <div style={{ fontSize: '16px' }}>Nº Bars:</div>

      <Slider
        min={0}
        max={100}
        defaultValue={n_bars}
        onChangeComplete={onChangeNBarsSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />

      <div style={{ margin: '5px', fontSize: '16px' }}>P-Value:</div>
      <Slider
        min={0.01}
        max={1}
        defaultValue={p_value}
        onChangeComplete={onChangePValue}
        step={0.01}
        style={{ width: '100%' }}
      />

      <FilteredVariables></FilteredVariables>
    </div>
  );
};

export default OptionsRanking;
