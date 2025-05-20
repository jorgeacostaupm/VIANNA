import { Collapse, Button } from 'antd';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import Interaction from './Interaction';
import { items } from '../AtlasEditor/menu/AtlasMenu';

export const AtlasMenu = () => {
  const [is_menu, setIsMenu] = useState(false);
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          marginTop: 0,
          marginRight: 0
        }}
      >
        <Button type="primary" onClick={() => setIsMenu(!is_menu)}>
          <SettingOutlined />
        </Button>
      </div>
      {is_menu && (
        <div style={{ overflowY: 'scroll', height: '90%', marginTop: '0.5vh' }}>
          <Collapse
            size="large"
            items={items}
            defaultActiveKey={['1']}
            style={{ background: 'white', textAlign: 'left' }}
          />
        </div>
      )}
    </>
  );
};
