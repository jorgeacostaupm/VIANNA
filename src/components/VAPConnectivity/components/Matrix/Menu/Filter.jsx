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
  setSpecialFilterValues
} from '@/components/VAPUtils/features/matrix/matrixSlice';
import AttributeSelector from '../../AttributeSelector';
import LogicalFilterModal from '../../LogicalFilterModal';

const ranges = [
  { acronim: 'zscore', min: 0, max: 5, name: 'Z-Score' },
  { acronim: 'ciplv', min: 0, max: 1, name: 'ciPLV' },
  { acronim: 'plv', min: 0, max: 1, name: 'PLV' }
];

export const Filter = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <BandFilter />
      <LogicalFilterModal
        title={'Local Logical Filter'}
        setBoolMatrix={setBoolMatrix}
        setFilteringExpr={setFilteringExpr}
        width={'100%'}
        slice={'matrix'}
      />
    </div>
  );
};

function BandFilter() {
  const dispatch = useDispatch();
  const is_filter = useSelector((state) => state.matrix.is_filter);
  const is_vis_filter = useSelector((state) => state.matrix.is_vis_filter);
  const filter_attr = useSelector((state) => state.matrix.filter_attr);
  const filter_value = useSelector((state) => state.matrix.filter_value);

  const onSliderComplete = (value) => {
    dispatch(setFilterValue(value));
  };

  const onChangeCheckbox = (e) => {
    dispatch(setIsFilter(e.target.checked));
    if (e.target.checked && is_vis_filter) dispatch(setIsVisFilter(!e.target.checked));
  };

  const onChangeLocalCheckbox = (e) => {
    dispatch(setIsVisFilter(e.target.checked));
    if (e.target.checked && is_filter) dispatch(setIsFilter(!e.target.checked));
  };

  let attribute_max = 5;

  if (!(filter_attr?.type.acronim === 'zscore')) {
    let r = ranges.find((range) => range.acronim === filter_attr?.measure.acronim);
    attribute_max = r?.max;
  }

  const marks = {
    0: '0',
    [attribute_max]: attribute_max
  };

  return (
    <div style={{ width: '100%' }}>
      <Checkbox
        style={{ fontSize: '16px' }}
        checked={is_vis_filter}
        onChange={onChangeLocalCheckbox}
      >
        Vis Attr Filter
      </Checkbox>
      <Checkbox
        style={{ fontSize: '16px', marginBottom: '10px' }}
        checked={is_filter}
        onChange={onChangeCheckbox}
      >
        Attr Filter
      </Checkbox>
      {is_filter && (
        <>
          <AttributeSelector slice="matrix" attr="filter_attr" setAttr={setFilterAttr} />
          <Slider
            marks={marks}
            min={0}
            max={attribute_max}
            defaultValue={filter_value}
            onChangeComplete={onSliderComplete}
            step={0.01}
          ></Slider>
        </>
      )}

      {is_vis_filter && <MultiFilter></MultiFilter>}
    </div>
  );
}

export const MultiFilter = () => {
  const dispatch = useDispatch();
  const multi_attrs = useSelector((state) => state.matrix.multi_attrs);
  const specialFilterValues = useSelector((state) => state.matrix.specialFilterValues);
  let measures = [];

  const types = [...new Set(multi_attrs.map((attr) => attr.type.acronim))];
  if (types.includes('zscore')) {
    measures.push(ranges[0]);
  }
  const acronims = [
    ...new Set(
      multi_attrs
        .filter((attr) => attr.type.acronim != 'zscore')
        .map((attr) => attr.measure.acronim)
    )
  ];

  acronims.forEach((acronim) => {
    let r = ranges.find((range) => range.acronim === acronim);
    measures.push(r);
  });

  const onSliderComplete = (name) => (value) => {
    dispatch(setSpecialFilterValues({ acronim: name, value }));
  };

  return (
    <>
      {measures.map((measure) => (
        <>
          <div>{measure.name} Range:</div>
          <Slider
            marks={{
              [measure.min]: measure.min,
              [measure.max]: measure.max
            }}
            key={measure.acronim}
            min={measure.min}
            max={measure.max}
            defaultValue={
              specialFilterValues[measure.acronim] ? specialFilterValues[measure.acronim] : 0
            }
            onChangeComplete={onSliderComplete(measure.acronim)}
            step={0.01}
          ></Slider>
        </>
      ))}
    </>
  );
};

export default Filter;
