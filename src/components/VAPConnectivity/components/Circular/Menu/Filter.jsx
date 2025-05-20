import React from 'react';
import { Checkbox, Slider, Tabs } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setFilterValue,
  setIsFilter,
  setIsVisFilter,
  setFilterAttr,
  setBoolMatrix,
  setFilteringExpr,
  setIsFixed,
  setIsComplete
} from '@/components/VAPUtils/features/circular/circularSlice';
import AttributeSelector from '../../AttributeSelector';
import LogicalFilterModal from '../../LogicalFilterModal';

export const Filter = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // centra verticalmente
        alignItems: 'center', // centra horizontalmente
        gap: '10px'
      }}
    >
      <BandFilter />
      <LogicalFilterModal
        title={'Local Logical Filter'}
        setBoolMatrix={setBoolMatrix}
        setFilteringExpr={setFilteringExpr}
        width={'100%'}
        slice={'circular'}
      />
    </div>
  );
};

// Functional component for FilterOptions
function BandFilter() {
  const dispatch = useDispatch();
  const is_filter = useSelector((state) => state.circular.is_filter);
  const is_vis_filter = useSelector((state) => state.circular.is_vis_filter);
  const is_fixed = useSelector((state) => state.circular.is_fixed);
  const is_complete = useSelector((state) => state.circular.is_complete);
  const filter_attr = useSelector((state) => state.circular.filter_attr);
  const vis_attr = useSelector((state) => state.circular.vis_attr);

  const onSliderComplete = (value) => {
    dispatch(setFilterValue(value));
  };

  const onChangeCheckbox = (e) => {
    dispatch(setIsFilter(e.target.checked));
  };

  const onChangeFixedCheckbox = (e) => {
    dispatch(setIsFixed(e.target.checked));
  };

  const onChangeCompleteCheckbox = (e) => {
    dispatch(setIsComplete(e.target.checked));
  };

  const onChangeLocalCheckbox = (e) => {
    dispatch(setIsVisFilter(e.target.checked));
    if (e.target.checked && is_filter) dispatch(setIsFilter(!e.target.checked));
  };

  return (
    <div style={{ width: '100%' }}>
      <Checkbox
        style={{ fontSize: '16px' }}
        checked={is_vis_filter}
        onChange={onChangeLocalCheckbox}
      >
        Filter by Vis Attr
      </Checkbox>

      {!is_vis_filter && (
        <>
          <Checkbox style={{ fontSize: '16px' }} checked={is_filter} onChange={onChangeCheckbox}>
            Filter by Attr
          </Checkbox>
          <AttributeSelector slice="circular" attr="filter_attr" setAttr={setFilterAttr} />
        </>
      )}
      <Slider
        min={0}
        max={
          is_vis_filter
            ? vis_attr.type.acronim == 'zscore'
              ? 5
              : 1
            : filter_attr.type.acronim == 'zscore'
              ? 5
              : 1
        }
        defaultValue={0}
        onChangeComplete={onSliderComplete}
        step={0.01}
      />

      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <div>Options: </div>
        <Checkbox style={{ fontSize: '16px' }} checked={is_fixed} onChange={onChangeFixedCheckbox}>
          Fixed Layout
        </Checkbox>

        <Checkbox
          style={{ fontSize: '16px' }}
          checked={is_complete}
          onChange={onChangeCompleteCheckbox}
        >
          Complete
        </Checkbox>
      </div>
    </div>
  );
}

export default Filter;
