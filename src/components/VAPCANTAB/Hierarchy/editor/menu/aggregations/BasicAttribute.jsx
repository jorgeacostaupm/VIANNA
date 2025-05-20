import { Field } from 'formik';
import { motion } from 'framer-motion';
import DropIndicator from './DropIndicator';

const BasicAttribute = ({ idx, node, onDragStart, isHidden = false }) => {
  return (
    <div
      style={{
        display: isHidden ? 'none' : 'flex',
        width: '100%',
        alignSelf: 'center',
        justifySelf: 'center'
      }}
    >
      <DropIndicator used={`${node.used}`} nodeID={node.id}></DropIndicator>
      <motion.div
        layout
        layoutId={node.id}
        id={`info.usedAttributes.${idx}`}
        draggable={true}
        onDragStart={(e) => onDragStart(e, { id: node.id, name: node.name })}
        style={{
          display: 'flex',
          cursor: 'grab',
          padding: '0.5rem',
          border: '1px solid #374151',
          borderRadius: '0.75rem',
          backgroundColor: '#f5f5f5',
          height: 'fit-content',
          gap: '0.75rem',
          flexGrow: 1
        }}
      >
        <Field
          as="div"
          id={`info.usedAttributes.${idx}.name`}
          name={`info.usedAttributes.${idx}.name`}
          title={node.name || ''}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '1.125rem'
          }}
        >
          {node.name}
        </Field>
      </motion.div>
    </div>
  );
};

export default BasicAttribute;
