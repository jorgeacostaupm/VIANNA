import React, { useState } from 'react';
import { Button, Collapse } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import PopulationGenerator from './PopulationGenerator';
import OverviewConfiguration from './OverviewConfiguration';

const menuItems = [
  {
    key: 0,
    label: 'Create Population',
    children: <PopulationGenerator />
  },
  {
    key: 1,
    label: 'Configuration',
    children: <OverviewConfiguration />
  }
];

const style = {
  position: 'absolute',
  right: 0,
  width: '20%',
  minWidth: '300px',
  maxHeight: '70vh',
  overflowY: 'auto',
  marginTop: '8px',
  background: 'white'
};

export const Menu = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <div>
        <Button type="primary" onClick={() => setIsVisible(!isVisible)}>
          <SettingOutlined />
        </Button>

        {isVisible && (
          <div style={{ ...style }}>
            <Collapse bordered={true} size="large" items={menuItems} defaultActiveKey={['0']} />
          </div>
        )}
      </div>
    </>
  );
};
