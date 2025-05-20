import { useEffect, useState } from 'react';
import DropArea from './DropArea';
import ChildHolder from './ChildHolder';
import { FieldArray, useFormikContext } from 'formik';
import { generateFormulaSimplified } from '../logic/simplifiedFormulas';

const AggregateComponent = ({ nodes, aggOp }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.5rem' }}>
      <FieldArray name="info.usedAttributes">
        {({ insert, remove, push, move, pop }) => (
          <DropWrapper
            nodes={nodes}
            aggOp={aggOp}
            insert={insert}
            remove={remove}
            push={push}
            move={move}
            pop={pop}
          />
        )}
      </FieldArray>
    </div>
  );
};

const DropWrapper = ({ nodes, aggOp, insert, remove, push, move, pop }) => {
  const {
    setFieldValue,
    values: { info }
  } = useFormikContext();
  const [usedNodes, setUsedNodes] = useState([]);
  const [unusedNodes, setUnusedNodes] = useState([]);

  useEffect(() => {
    const initialUsed = nodes.filter((n) => n.used === true);
    const initialUnused = nodes.filter((n) => n.used === false);

    setUsedNodes(initialUsed);
    setUnusedNodes(initialUnused);
    setFieldValue('info.usedAttributes', initialUsed); // Actualiza inicialmente
  }, [nodes]);

  useEffect(() => {
    const formula = generateFormulaSimplified(info.operation, info.usedAttributes);
    if (formula.valid) {
      setFieldValue('info.formula', formula.formula);
      setFieldValue('info.exec', formula.exec);
    }
  }, [info.operation, JSON.stringify(info.usedAttributes)]);

  useEffect(() => {
    setFieldValue('info.usedAttributes', usedNodes);
  }, [usedNodes]);

  const removeNode = (nodeId, wasUsed) => {
    if (wasUsed) {
      setUsedNodes((prev) => prev.filter((n) => n.id !== nodeId));
    } else {
      setUnusedNodes((prev) => prev.filter((n) => n.id !== nodeId));
    }
  };

  const moveNode = (node, willBeUsed, position) => {
    if (willBeUsed) {
      setUsedNodes((prev) => {
        const updatedUsed = [...prev.filter((n) => n.id !== node.id)];
        return position === -1
          ? [...updatedUsed, node]
          : [...updatedUsed.slice(0, position), node, ...updatedUsed.slice(position)];
      });
      removeNode(node.id, false);
    } else {
      setUnusedNodes((prev) => {
        const updatedUnused = [...prev.filter((n) => n.id !== node.id)];
        return position === -1
          ? [...updatedUnused, node]
          : [...updatedUnused.slice(0, position), node, ...updatedUnused.slice(position)];
      });
      removeNode(node.id, true);
    }
  };

  const modeAllNodes = (willBeUsed) => {
    if (willBeUsed) {
      const allUnusedAsUsed = unusedNodes.map((n) => ({ ...n, used: true }));
      setUsedNodes((prev) => [...prev, ...allUnusedAsUsed]);
      setUnusedNodes([]);
      setFieldValue('info.usedAttributes', [...usedNodes, ...allUnusedAsUsed]);
    } else {
      const allUsedAsUnused = usedNodes.map((n) => ({ ...n, used: false }));
      setUnusedNodes((prev) => [...prev, ...allUsedAsUnused]);
      setUsedNodes([]);
      setFieldValue('info.usedAttributes', []);
    }
  };

  return (
    <>
      <DropArea
        allNodes={nodes}
        aggOp={aggOp}
        nodes={usedNodes}
        moveNode={moveNode}
        modeAllNodes={modeAllNodes}
        insertNodeField={insert}
        pushNodeField={push}
        moveNodeField={move}
      />
      <ChildHolder
        allNodes={nodes}
        nodes={unusedNodes}
        moveNode={moveNode}
        removeNodeField={(node) => {
          const idx = usedNodes.findIndex((n) => n.id === node.id);
          if (idx === -1) return;
          remove(idx);
        }}
      />
    </>
  );
};

export default AggregateComponent;
