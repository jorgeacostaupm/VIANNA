import { useState, useRef, useEffect } from 'react';
import { pubsub } from '@/components/VAPUtils/pubsub';
import { Formik, Form } from 'formik';
import { Collapse } from 'antd';
import NodeInfo from './NodeInfo';
import NodeTitleField from './NodeTitleField';
import NodeDescriptionField from './NodeDescriptionField';
import NodeAggregationConfig from './NodeAggregationConfig';
import NodeMeasureConfig from './NodeMeasureConfig';
import { updateAttribute } from '@/components/VAPUtils/features/metadata/metaCreatorReducer';
import { renameColumn } from '@/components/VAPUtils/features/data/dataSlice';
import { useDispatch } from 'react-redux';
import { NodeSchema } from './NodeValidation';

function areObjectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key) => obj1[key] === obj2[key]);
}

function wasTouched(initial, newOb) {
  if (initial.id !== newOb.id) {
    throw 'They are different nodes';
  }

  let ret = {};
  ret['name'] = initial['name'] === newOb['name'];
  ret['desc'] = initial['desc'] === newOb['desc'];
  ret['type'] = initial['type'] === newOb['type'];
  ret['dtype'] = initial['dtype'] === newOb['dtype'];
  ret['related'] = initial['related'].length === newOb['related'].length;

  ret['info'] = true;
  if (initial['type'] === 'aggregation') {
    ret['info'] = areObjectsEqual(initial['info'], newOb['info']);
  }

  return ret;
}

const NodeMenu = ({ nodeInfo }) => {
  const [node, setNode] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [openMenu, toggleMenu] = useState(false);

  const { publish, subscribe } = pubsub;
  const dispatch = useDispatch();

  const formRef = useRef(null);
  const resizeRef = useRef();

  useEffect(() => {
    setNode(() => nodeInfo.find((n) => n.id === nodeId));
  }, [nodeInfo]);

  subscribe('nodeInspectionNode', ({ nodeId }) => {
    setNode(() => nodeInfo.find((n) => n.id === nodeId));
    setNodeId(nodeId);
    toggleMenu(nodeId != null);
  });

  subscribe('toggleInspectMenu', () => {
    toggleMenu((prev) => !prev);
  });

  subscribe('untoggleEvent', () => {
    toggleMenu(false);
  });

  useEffect(() => {
    const handleUnload = () => {
      formRef.current?.handleSubmit();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  if (node == null) {
    return;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onSubmit = async (values) => {
    const touchFields = wasTouched(node, values);
    if (!touchFields['name']) {
      publish('modifyNodeInfo', { node: values });
      if (node.id !== 0) {
        dispatch(renameColumn({ prevName: node['name'], newName: values['name'] }));
      }
      await sleep(250); // para evitar condición de carrera con el renombre si lo hubo
    }
    dispatch(updateAttribute({ ...values, recover: true }));
  };

  const availableNodes = node.related
    .map((i) => {
      const n = nodeInfo.find((n) => n.id === i);
      if (n == null) return null;
      const isUsed = node.info && node.info.usedAttributes.some((u) => u.id === n.id);
      return { id: n.id, name: n.name, weight: 1, used: isUsed };
    })
    .filter((n) => n != null);

  const closeTab = () => toggleMenu((prev) => !prev);

  const style = {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 'auto',
    overflow: 'scroll',
    maxHeight: '100%',
    minWidth: '450px',
    backgroundColor: '#FAFAFA', // equivalent to bg-zinc-50
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
  };

  const getItems = (values) => {
    const items = [
      {
        key: 0,
        label: 'Description',
        children: <NodeDescriptionField desc={node.desc} />
      },
      {
        key: 1,
        label: 'Info',
        children: (
          <NodeInfo
            nChildren={availableNodes.length}
            nodeType={node.type == null ? 'root' : node.type}
            nodeId={node.id}
            DType={node.dtype}
            height={node.height}
          />
        )
      },
      values.type === 'aggregation' && {
        key: 2,
        label: 'Aggregation',
        children:
          availableNodes.length === 0 ? (
            <NodeMeasureConfig children={nodeInfo.filter((n) => n.id !== 0)} vals={values} />
          ) : (
            <NodeAggregationConfig
              aggOp={values.info.operation || 'sum'}
              children={availableNodes}
              vals={values}
            />
          )
      }
    ];

    return items.filter(Boolean);
  };

  return (
    openMenu && (
      <div style={style}>
        <Formik
          innerRef={formRef}
          initialValues={node}
          onSubmit={onSubmit}
          validationSchema={NodeSchema}
          enableReinitialize={true}
        >
          {({ values }) => (
            <Form
              ref={resizeRef}
              style={{
                width: `100%`,
                padding: '0.5rem'
              }}
            >
              <NodeTitleField closeTab={closeTab} />
              <Collapse bordered={true} size="large" items={getItems(values)} />
            </Form>
          )}
        </Formik>
      </div>
    )
  );
};

export default NodeMenu;
