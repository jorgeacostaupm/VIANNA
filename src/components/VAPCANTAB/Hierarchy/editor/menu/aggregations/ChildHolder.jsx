import BasicAttribute from './BasicAttribute';
import { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';

import DropIndicator, {
  clearHightlight,
  getIndicators,
  getNearestIndicator,
  highlightIndicators
} from './DropIndicator';

const ChildHolder = ({ aggOp, allNodes, nodes, moveNode, removeNodeField }) => {
  const [active, setActive] = useState(false);
  const [searchText, updateSearch] = useState('');

  const handleDragStart = (e, attribute) => {
    e.dataTransfer.setData('attributeId', attribute.id);
  };

  const onDragOver = (event) => {
    setActive(true);
    highlightIndicators(event, 'false');
    event.preventDefault();
  };
  const onDragLeave = () => {
    setActive(false);
    clearHightlight(null, false);
  };
  const onDragEnd = (event) => {
    const attrId = event.dataTransfer.getData('attributeId');
    const nodeId = parseInt(attrId);

    setActive(false);
    clearHightlight(null, false);

    // Calculate the final position of the moved element
    const indicators = getIndicators(false);
    const { element } = getNearestIndicator(event, indicators);

    const before = element.dataset.before || '-1';
    if (before === attrId) return;

    let transfered = allNodes.find((n) => n.id === nodeId);
    if (transfered == null) return;

    let unusedNodes = nodes.filter((n) => !n.used && n.id !== nodeId);

    transfered = { ...transfered, used: false };
    const position =
      before === '-1' ? -1 : unusedNodes.findIndex((el) => el.id === parseInt(before));
    removeNodeField(transfered);
    moveNode(transfered, false, position);
  };

  return (
    <>
      <h4
        style={{
          color: '#1677ff',
          flexGrow: 1,
          width: '100%',
          fontSize: '1.125rem',
          marginTop: '0.5rem'
        }}
      >
        Available Attributes
      </h4>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '0.25rem',
            marginBottom: '0.25rem',
            gap: '0.5rem'
          }}
        >
          <span
            style={{
              fontSize: '1.25rem',
              color: 'black',
              fontWeight: 'bold',
              zIndex: 13
            }}
            className="material-symbols-outlined"
          >
            <SearchOutlined />
          </span>
          <input
            onChange={(e) => updateSearch(e.target.value.toLowerCase())}
            type="text"
            style={{
              width: '16rem',
              borderColor: '#525252',
              borderStyle: 'solid',
              borderWidth: '1px',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              paddingLeft: '28px',
              zIndex: 12,
              transform: 'translateX(-32px)'
            }}
          />
        </div>
      </div>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDragEnd}
        id="placeholder"
        style={{
          borderColor: '#1677ff',
          borderWidth: '2px',
          borderStyle: 'dashed',
          borderRadius: '0.375rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          minHeight: '7vh'
        }}
      >
        {nodes.map((n) => {
          return (
            <BasicAttribute
              key={n.id}
              node={n}
              onDragStart={handleDragStart}
              isHidden={!n.name.toLowerCase().includes(searchText)}
            ></BasicAttribute>
          );
        })}
        <DropIndicator used={false}></DropIndicator>
      </div>
    </>
  );
};

export default ChildHolder;
