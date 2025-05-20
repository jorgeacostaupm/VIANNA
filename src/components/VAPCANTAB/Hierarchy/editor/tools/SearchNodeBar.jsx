import { useState, useRef, useEffect } from 'react';
import { pubsub } from '@/components/VAPUtils/pubsub';
import { SearchOutlined } from '@ant-design/icons';

const SearchNodeBar = ({}) => {
  const [nodeList, updateNodes] = useState([{ name: 'root', id: 1 }]);
  const [nodeResults, gatherMatches] = useState([]);
  const [showResults, closeResultList] = useState(nodeResults.length !== 0);

  const containerRef = useRef();
  const inputRef = useRef();
  const { subscribe, publish } = pubsub;

  subscribe('updateNodeListEvent', ({ nodes }) => {
    const allNodes = nodes.map((node) => {
      return { name: node.data.name, id: node.id };
    });
    updateNodes(allNodes);
  });

  const focusNode = (nodeId, openInspect = false) => {
    gatherMatches([]);
    closeResultList(false);
    inputRef.current.value = '';
    publish('focusNode', { nodeId: nodeId, inspect: openInspect });
  };

  useEffect(() => {
    const handler = (event) => {
      if (showResults && containerRef.current && !containerRef.current.contains(event.target)) {
        gatherMatches([]);
        inputRef.current.value = '';
        closeResultList(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [showResults]);

  /* subscribe('closeResultsEvent', () => {
    gatherMatches([]);
    inputRef.current.value = '';
    closeResultList(false);
  }); */

  const searchNode = (searchText) => {
    const search = searchText.toLowerCase();
    const results = nodeList.filter((node) => {
      const name = node.name.toLowerCase();
      return name.includes(search);
    });

    gatherMatches(results);
    closeResultList(results.length !== 0);
  };

  const onEnterFocus = (event, nodeId) => {
    if (event.key === 'Enter') {
      focusNode(nodeId);
    }
  };

  const focusInspect = (nodeId) => {
    focusNode(nodeId);
  };

  const onEnterSearchFocus = (event) => {
    if (event.key === 'Enter' && nodeResults.length > 0) {
      focusNode(nodeResults[0].id);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: '8rem',
        top: '0.75rem'
      }}
      ref={containerRef}
    >
      <div
        style={{
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem',
          backgroundColor: '#1677ff',
          height: '3rem',
          gap: '0.5rem'
        }}
      >
        <SearchOutlined style={{ color: 'white' }} />
        <input
          onChange={(e) => searchNode(e.target.value)}
          onKeyDown={(e) => onEnterSearchFocus(e)}
          type="text"
          id="search-node-bar"
          ref={inputRef}
          style={{
            width: '18rem',
            border: '1px solid #B0B0B0',
            borderRadius: '6px',
            fontSize: '1rem',
            padding: '0.25rem'
          }}
        />
      </div>

      <div
        tabIndex={-1}
        style={{
          display: showResults ? 'block' : 'none',
          backgroundColor: '#f3f3f3',
          maxHeight: '12rem',
          width: '100%',
          overflowY: 'scroll',
          borderRadius: '6px',
          border: '1px solid #B0B0B0'
        }}
      >
        <ul style={{ padding: '0.5rem 0', fontSize: '1rem', whiteSpace: 'nowrap' }}>
          {nodeResults.map((node) => {
            return (
              <li key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => focusNode(node.id, true)} style={{ fontSize: '1.125rem' }}>
                  <SearchOutlined />
                </button>
                <a
                  onClick={() => focusNode(node.id)}
                  tabIndex={0}
                  onKeyDown={(e) => onEnterFocus(e, node.id)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'normal',
                    textDecoration: 'none',
                    color: 'black'
                  }}
                  onMouseOver={(e) => (e.target.style.fontWeight = 'bold')}
                  onMouseOut={(e) => (e.target.style.fontWeight = 'normal')}
                >
                  {node.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SearchNodeBar;
