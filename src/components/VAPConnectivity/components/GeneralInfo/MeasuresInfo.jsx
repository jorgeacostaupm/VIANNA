import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from '@/components/VAPUtils/features/store';
import { Descriptions, Tabs, Checkbox } from 'antd';
import { setActiveMeasure } from '@/components/VAPUtils/features/main/mainSlice';
import NoData from '@/components/VAPConnectivity/components/NoData';

const MeasureInfo = ({ measure }) => {
  const dispatch = useDispatch();

  const onChange = (e) => {
    const payload = {
      active: e.target.checked,
      acronim: measure.acronim
    };
    dispatch(setActiveMeasure(payload));
  };

  const items = [
    {
      key: '1',
      label: 'Name',
      children: measure.name
    },

    {
      key: '3',
      label: 'Range',
      children: `[ ${measure.range[0]} - ${measure.range[1]} ]`
    },
    {
      key: '4',
      label: 'Active',
      children: <Checkbox checked={measure.active} onChange={onChange} />
    },
    {
      key: '2',
      label: 'Description',
      children: <div style={{ width: '800px' }}>{measure.description}</div>
    }
  ];

  return <Descriptions title={measure.name} bordered items={items} />;
};

const MeasuresInfo = () => {
  const measures = useSelector((state) => state.main.measures);

  useEffect(() => {}, []);

  return (
    <div className="infoDiv">
      {measures.length > 0 ? (
        measures.map((measure) => {
          return <MeasureInfo key={measure.acronim} measure={measure} />;
        })
      ) : (
        <NoData></NoData>
      )}
    </div>
  );
};

export default MeasuresInfo;
