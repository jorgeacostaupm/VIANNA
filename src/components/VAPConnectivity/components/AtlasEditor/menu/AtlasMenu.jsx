import { useSelector, useDispatch } from 'react-redux';
import { Collapse, Select } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import { AtlasDescription } from './AtlasDescription';

import { placeholders } from '../configuration/config.json';
import { updateAtlas } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { useApiServiceInfo } from '@/context/apiservice-context';
import { AtlasEditMenu } from './AtlasEditMenu';

export const items = [
  {
    key: placeholders.description,
    label: placeholders.description,
    children: <AtlasDescription />
  },
  {
    key: placeholders.edit_title,
    label: placeholders.edit_title,
    children: <AtlasEditMenu />
  }
];

export const AtlasMenu = () => {
  const dispatch = useDispatch();
  const selected_atlas = useSelector((state) => state.atlas.selected_atlas);
  const atlases = useSelector((state) => state.atlas.atlases);
  const context = useApiServiceInfo();

  const options = useMemo(() => {
    return atlases.map((atlas) => ({ label: atlas.title, value: atlas.id }));
  }, [atlases]);

  const onChangeAtlas = (id) => {
    const atlas = atlases.find((atlas) => atlas.id === id);
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(context?.apiServiceInfo && { Authorization: `Token ${context.apiServiceInfo.token}` })
      }
    };
    dispatch(updateAtlas({ atlas, options }));
  };

  console.log('OIPTIONES', options);
  return (
    <>
      <div className="menu-div">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center'
          }}
        >
          <div>Select Atlas: </div>
          <Select
            value={{ label: selected_atlas?.title, value: selected_atlas?.id }}
            onChange={onChangeAtlas}
            style={{ width: '70%' }}
            options={options}
          />
        </div>
        <Collapse
          accordion
          items={items}
          defaultActiveKey={['1']}
          style={{ background: 'white', textAlign: 'left' }}
        />
      </div>
    </>
  );
};
