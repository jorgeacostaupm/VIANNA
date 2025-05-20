import { Field } from 'formik';
import { motion } from 'framer-motion';
import { HorizontalDropIndicator as DropIndicator } from './DropIndicator';
import { InputNumber } from 'antd';
import { useFormikContext } from 'formik';

const InputAttribute = ({ idx, node, onDragStart, isHidden = false }) => {
  const { setFieldValue } = useFormikContext();
  const handleChange = (value) => {
    setFieldValue(`info.usedAttributes.${idx}.weight`, value);
  };
  return (
    <>
      <div
        style={{
          display: isHidden ? 'none' : 'block',
          width: '95%',
          alignSelf: 'center',
          justifySelf: 'center'
        }}
      >
        <DropIndicator used={`${node.used}`} nodeID={node.id} />
        <motion.div
          layout
          layoutId={node.id}
          id={`info.usedAttributes.${idx}`}
          draggable={true}
          onDragStart={(e) => onDragStart(e, { id: node.id, name: node.name })}
          style={{
            display: 'flex',
            cursor: 'grab',
            flexDirection: 'row',
            padding: '8px 0',
            border: '1px solid #374151',
            borderRadius: '12px',
            backgroundColor: '#f5f5f5',
            alignItems: 'center',
            height: 'fit-content',
            justifyContent: 'space-evenly',
            flexGrow: 1
          }}
        >
          <span>W:</span>
          <InputNumber
            id={`info.usedAttributes.${idx}.weight`}
            name={`info.usedAttributes.${idx}.weight`}
            style={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              fontSize: '1.125rem',
              maxWidth: '8rem',
              textAlign: 'center',
              padding: '2px 8px',
              borderRadius: '8px'
            }}
            min={-Infinity} // Permite valores negativos infinitos
            max={Infinity} // Permite valores positivos infinitos
            defaultValue={0} // Valor por defecto si es necesario
            step={1} // Ajusta el paso de incremento/decremento
            onChange={handleChange}
          />
          <Field
            as="div"
            id={`info.usedAttributes.${idx}.name`}
            name={`info.usedAttributes.${idx}.name`}
            title={node.name}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '1.125rem',
              width: '4vw',
              textAlign: 'center'
            }}
          >
            {node.name}
          </Field>
        </motion.div>
      </div>
    </>
  );
};

export default InputAttribute;
