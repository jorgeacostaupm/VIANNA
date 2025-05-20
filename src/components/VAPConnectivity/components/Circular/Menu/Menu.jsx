import React, { useState } from 'react';
import { Button, Collapse } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import Visualize from './Visualize';
import Filter from './Filter';
import Interaction from './Interaction';
import Configuration from './Configuration';
import MultiVisualize from './MultiVisualize';

const alone = {
  position: 'absolute',
  top: '4.5vh',
  right: 5,
  width: '25%',
  height: '90vh',
  overflowY: 'scroll'
};

const combined = {
  marginTop: 38,
  width: '30%',
  height: '60vh',
  overflowY: 'scroll'
};

const modal = {
  marginTop: 38,
  width: '100%',
  height: '90vh',
  overflowY: 'scroll'
};

const single_menu = [
  {
    key: 0,
    label: 'Visualize',
    children: <Visualize />
  },
  {
    key: 2,
    label: 'Filters',
    children: <Filter />
  },
  {
    key: 3,
    label: 'Interaction',
    children: <Interaction />
  },
  {
    key: 4,
    label: 'Configuration',
    children: <Configuration />
  }
];

const yux_menu = [
  {
    key: 0,
    label: 'Visualize',
    children: <MultiVisualize />
  },
  {
    key: 2,
    label: 'Filter',
    children: <Filter />
  },
  {
    key: 3,
    label: 'Interaction',
    children: <Interaction modal={true} />
  }
  /*   {
    key: 4,
    label: "Configuration",
    children: <Configuration />,
  }, */
];

export const Menu = (props) => {
  const [is_menu, setIsMenu] = useState(false);

  let menu_style = props.combined ? combined : props.modal ? modal : alone;
  let items = props.modal ? yux_menu : single_menu;

  console.log('RENDERING CIRCULAR MENU...');

  return (
    <>
      <div
        style={{
          position: 'absolute',
          right: 5,
          top: '1vh'
        }}
      >
        {!props.modal && (
          <Button type="primary" onClick={() => setIsMenu(!is_menu)}>
            <SettingOutlined />
          </Button>
        )}
      </div>
      {(is_menu || props.modal) && (
        <div style={menu_style}>
          <Collapse
            bordered={true}
            size="large"
            items={items}
            defaultActiveKey={['0']}
            style={{ background: 'white', textAlign: 'left' }}
          />
        </div>
      )}
    </>
  );
};
