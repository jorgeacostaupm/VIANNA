import React from 'react';
import { Checkbox, Slider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setIsHipo,
  setIsHiper,
  setLinkOpacity,
  setCurveValue,
  addMultiAttr,
  removeMultiAttr
} from '@/components/VAPUtils/features/circular/circularSlice';
import MultiAttributeSelector from '../../MultiAttributeSelector';
import MultiAttributeList from '../../MultiAttributeList';

const Options = () => {
  const dispatch = useDispatch();
  const is_hipo = useSelector((state) => state.circular.is_hipo);
  const is_hiper = useSelector((state) => state.circular.is_hiper);
  const link_opacity = useSelector((state) => state.circular.link_opacity);
  const curve_value = useSelector((state) => state.circular.curve_value);

  const onSliderComplete = (value) => {
    dispatch(setLinkOpacity(value));
  };

  const onChangeHipoCheckbox = (e) => {
    dispatch(setIsHipo(e.target.checked));
  };

  const onChangeHiperCheckbox = (e) => {
    dispatch(setIsHiper(e.target.checked));
  };

  const onChangeCurveSliderComplete = (value) => {
    dispatch(setCurveValue(value));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <Checkbox style={{ fontSize: '16px' }} checked={is_hipo} onChange={onChangeHipoCheckbox}>
          Positive
        </Checkbox>
        <Checkbox style={{ fontSize: '16px' }} checked={is_hiper} onChange={onChangeHiperCheckbox}>
          Negative
        </Checkbox>
      </div>
      <div style={{ fontSize: '16px' }}>Opacity:</div>
      <Slider
        min={0}
        max={1}
        defaultValue={link_opacity}
        onChangeComplete={onSliderComplete}
        step={0.01}
        style={{ width: '100%' }}
      />
      <div style={{ fontSize: '16px' }}>Curve Tension:</div>

      <Slider
        min={0}
        max={1}
        defaultValue={curve_value}
        onChangeComplete={onChangeCurveSliderComplete}
        step={0.01}
        style={{ width: '100%' }}
      />
    </div>
  );
};

const MultiVisualize = () => (
  <div>
    <MultiAttributeSelector slice="circular" addMultiAttr={addMultiAttr} />
    Matrices:
    <MultiAttributeList slice="circular" removeMultiAttr={removeMultiAttr}></MultiAttributeList>
    <Options />
  </div>
);

export default MultiVisualize;
