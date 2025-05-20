import React from 'react';
import { Checkbox, Slider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setVisAttr,
  setIsHipo,
  setIsHiper,
  setLinkOpacity,
  setCurveValue
} from '@/components/VAPUtils/features/circular/circularSlice';
import AttributeSelector from '../../AttributeSelector';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '10px'
      }}
    >
      <div style={{ display: 'flex', gap: '10px' }}>
        <div>Options: </div>
        <Checkbox style={{ fontSize: '16px' }} checked={is_hipo} onChange={onChangeHipoCheckbox}>
          Positive
        </Checkbox>
        <Checkbox style={{ fontSize: '16px' }} checked={is_hiper} onChange={onChangeHiperCheckbox}>
          Negative
        </Checkbox>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <div style={{ fontSize: '16px' }}>Opacity:</div>
        <Slider
          min={0}
          max={1}
          defaultValue={link_opacity}
          onChangeComplete={onSliderComplete}
          step={0.01}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <div style={{ fontSize: '16px' }}>Tension:</div>

        <Slider
          min={0}
          max={1}
          defaultValue={curve_value}
          onChangeComplete={onChangeCurveSliderComplete}
          step={0.01}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

const Visualize = () => (
  <div>
    <AttributeSelector slice="circular" attr="vis_attr" setAttr={setVisAttr} />
    <Options />
  </div>
);

export default Visualize;
