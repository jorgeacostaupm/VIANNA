import { useState } from 'react';
import { Tag } from 'antd';

const NodeInfo = ({ nChildren, nodeType, DType, nodeId, height }) => {
  const [isCollapse, collapseSection] = useState(false);

  const dtypeMap = {
    number: 'Number',
    date: 'Date',
    string: 'Text',
    determine: 'To determine',
    none: 'None'
  };
  const dtypeColor = {
    number: 'blue',
    date: 'purple',
    string: 'magenta',
    determine: 'red',
    none: 'grey'
  };

  let nodeName = '';
  let nodeColor = '';
  switch (nodeType) {
    case 'attribute':
      nodeName = 'Atributte';
      nodeColor = 'blue';
      break;
    case 'root':
      nodeName = '';
      nodeColor = 'geekblue';
      break;
    case 'aggregation':
      nodeName = nChildren === 0 ? 'Measure' : 'Agreggation';
      nodeColor = 'volcano';
      break;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-evenly',
        verticalAlign: 'middle'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '5px', fontWeight: 600 }}>Type:</div>
        <Tag
          color={nodeColor}
          style={{ padding: '5px', fontSize: '20px', lineHeight: '20px', height: 'fit-content' }}
        >
          {nodeName}
        </Tag>
      </div>

      {/* <div className="flex gap-2 p-2 items-center">
        <h4 className="grow text-lg whitespace-nowrap">Data Type: </h4>

        <Tag color={dtypeColor[DType]} style={{ padding: '5px', fontSize: '20px' }}>
          {' '}
          {dtypeMap[DType]}
        </Tag>
      </div> */}

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '5px', fontWeight: 600 }}>Nº Children:</div>
        <Tag
          color={'green'}
          style={{ padding: '5px', fontSize: '20px', lineHeight: '20px', height: 'fit-content' }}
        >
          {' '}
          {nChildren}
        </Tag>
      </div>
    </div>
  );
};

export default NodeInfo;
