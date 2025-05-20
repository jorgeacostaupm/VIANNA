import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from '@/components/VAPUtils/features/store';
import { Descriptions, Tabs, Checkbox } from 'antd';
import { setActiveBand } from '@/components/VAPUtils/features/main/mainSlice';
import NoData from '@/components/VAPConnectivity/components/NoData';

const BandInfo = ({ band }) => {
  const dispatch = useDispatch();

  const onChange = (e) => {
    const payload = {
      active: e.target.checked,
      acronim: band.acronim
    };
    dispatch(setActiveBand(payload));
  };

  const items = [
    {
      key: '1',
      label: 'Range',
      children: `[ ${band.range[0]}${band.unit} - ${band.range[1]}${band.unit} ]`
    },
    {
      key: '2',
      label: 'Description',
      children: <div style={{ width: '500px' }}>{band.description}</div>
    },
    {
      key: '3',
      label: 'Active',
      children: <Checkbox checked={band.active} onChange={onChange} />
    }
  ];

  return <Descriptions title={band.name} bordered items={items} />;
};

const BandsInfo = () => {
  const statistical_bands = ['max', 'min', 'mean'];
  const bands = useSelector((state) => state.main.bands).filter(
    (band) => !statistical_bands.includes(band.acronim)
  );

  useEffect(() => {}, []);

  return (
    <div className="infoDiv">
      {bands.length > 0 ? (
        bands.map((band) => {
          return <BandInfo key={band.acronim} band={band} />;
        })
      ) : (
        <NoData></NoData>
      )}
    </div>
  );
};

export default BandsInfo;
