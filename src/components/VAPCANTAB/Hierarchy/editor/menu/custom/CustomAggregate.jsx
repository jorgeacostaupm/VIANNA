import { useState, useRef } from 'react';
import { get_parser } from '../logic/parser';
import { build_aggregation } from '../logic/formularGenerator';
import { Field, useFormikContext } from 'formik';
import { copyClipboard } from '../../../utils';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';

let parser = get_parser();

const AttributePaste = ({ name }) => {
  const copyAttribute = async () => {
    await copyClipboard(`$(${name})`);
  };

  return (
    <div
      style={{
        padding: '0.5rem', // p-2
        border: '1px solid #6b7280', // border-gray-500
        borderRadius: '0.375rem', // rounded-md
        display: 'flex', // Cambio de 'flex' a 'inline-flex' para ajustarse al contenido
        gap: '0.5rem', // gap-2
        alignItems: 'center',
        cursor: 'pointer',
        width: 'auto' // Esto permite que el ancho se ajuste al contenido
      }}
      onClick={copyAttribute}
    >
      <span style={{ fontSize: '1rem', fontWeight: '500', userSelect: 'none' }}>{name}</span>
      <CopyOutlined />
    </div>
  );
};

const CustomAggregate = ({ nodes, formula }) => {
  const { errors, setFieldError, setFieldValue, setTouched } = useFormikContext();
  const textRef = useRef();
  const [formulaText, setFormula] = useState(formula);
  let typingTimer;

  const validateFormula = (e) => {
    let parsed;
    try {
      parsed = parser.parse(e.target.value);
    } catch (error) {
      setFieldError('info.formula', 'Syntax error');
      return;
    }

    try {
      const executable_code = build_aggregation(parsed);
      if (!executable_code.nodes.every((n) => nodes.find((o) => o.name === n) !== null)) {
        throw {
          error: 'AttributeNotFound',
          msg:
            'One of the attributes used does not correspond with the children of this aggregation. Nodes: ' +
            nodes.map((n) => '"' + n.name + `"`).join(', ') +
            ' Obtained: ' +
            executable_code.nodes.map((n) => '"' + n + `"`).join(', ')
        };
      }
      setFieldValue('info.exec', executable_code.formula, false);
      setTouched('info.exec', false);

      let used = executable_code.nodes.map((o) => {
        const usedNode = { name: o, used: true, weight: 1 }; // corrected 'weigth' to 'weight'
        usedNode.id = nodes.find((n) => n.name == o)?.id; // it is expected that the node exists so there will be no check
        return usedNode;
      });
      setFieldValue('info.usedAttributes', used);
    } catch (error) {
      console.log('random', error);
      console.error('formula: error parsing: ', `${error.error}:${error.msg}`);
      setFieldError('info.formula', `${error.error} :  ${error.msg}`);
      return;
    }
    setFieldValue('info.formula', textRef.current.value, true);
  };

  const handleInputChange = (event) => {
    setFormula(event.target.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      validateFormula(event);
    }, 200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <h4
          style={{
            color: '#1677ff',
            fontSize: '1.125rem',
            marginBottom: '0.25rem' // Añadido para separar el título del área de texto
          }}
        >
          Aggregation Formula:
        </h4>
        <textarea
          ref={textRef}
          value={formulaText}
          style={{
            width: '100%',
            height: '100px',
            border: '1px solid #d1d5db', // border-gray-300
            borderRadius: '0.375rem', // rounded-md
            padding: '0.5rem',
            resize: 'none' // Para evitar que el usuario cambie el tamaño del área de texto
          }}
          onChange={handleInputChange}
          spellCheck={'false'}
          autoCorrect={'false'}
          placeholder="Add an aggregation equation or formula"
        />
        <div
          style={{
            color: '#f87171',
            textTransform: 'capitalize',
            maxHeight: '2rem', // Limita la altura máxima del mensaje de error
            overflow: 'hidden', // Evita que el error haga crecer el contenedor
            fontSize: '0.875rem' // Reducir el tamaño de fuente para el mensaje de error
          }}
        >
          {errors?.info?.formula || ''}
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <h4
          style={{
            color: '#1677ff',
            flexGrow: 1,

            fontSize: '1.125rem'
          }}
        >
          Available Nodes
        </h4>
        <div
          style={{
            borderColor: '#1677ff',
            borderWidth: '2px',
            borderStyle: 'dashed',
            borderRadius: '0.375rem',
            padding: '5px',
            display: 'grid',
            gap: '2px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            minHeight: '7vh'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#9ca3af')} // hover:border-gray-400
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')} // border-transparent
        >
          {nodes.map((n) => {
            return <AttributePaste key={n.name} name={n.name} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomAggregate;
