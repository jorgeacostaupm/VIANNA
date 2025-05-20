import { useSelector, useDispatch } from 'react-redux';
import { Tag } from 'antd';
import DataManager from '../../managers/DataManager';

const utils = DataManager.getInstance();

export const MultiAttributeList = ({ removeMultiAttr, slice }) => {
  const dispatch = useDispatch();
  const multi_attrs = useSelector((state) => state[slice].multi_attrs);

  const onClose = (attr) => (e) => {
    e.preventDefault();
    const index = multi_attrs.findIndex((item) => utils.compareAttrs(attr, item));
    dispatch(removeMultiAttr(index));
  };

  function deleteAttr(attr) {
    console.log('CLOSE', attr);
    const index = multi_attrs.findIndex((item) => utils.compareAttrs(attr, item));
    dispatch(removeMultiAttr(index));
  }

  return (
    <>
      <div
        style={{
          padding: '5px',
          gap: '2px',
          minHeight: '20px',
          borderRadius: '5px',
          border: '1px solid lightgray',
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {multi_attrs.map((attr, index) => {
          const fullText = `${attr.type.name} ${attr.measure.name} ${attr.band.name}`;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                paddingRight: '25px',
                padding: '0 8px',
                borderRadius: '5px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#f1f1f1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '14px',
                width: '100%'
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={fullText}
              >
                {attr.type.name} <br />
                {attr.measure.name} <br />
                {attr.band.name} <br />
              </div>

              {/* Ícono de cierre */}
              <button
                onClick={() => deleteAttr(attr)}
                style={{
                  position: 'absolute',
                  right: '5px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#8c8c8c' // Color del ícono de cierre
                }}
              >
                ✖
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MultiAttributeList;
