import React from 'react';
import { Checkbox } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setVisAttr, setDiagonal, setDivided } from '@/components/VAPUtils/features/matrix/matrixSlice';
import AttributeSelector from '../../AttributeSelector';

const Options = () => {
  const dispatch = useDispatch();
  const diagonal = useSelector((state) => state.matrix.diagonal);
  const divided = useSelector((state) => state.matrix.divided);

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexDirection: 'row',
        marginTop: '10px'
      }}
    >
      <div>Options:</div>
      <Checkbox
        style={{ fontSize: '16px' }}
        onChange={(e) => dispatch(setDiagonal(e.target.checked))}
        checked={diagonal}
      >
        Diagonal
      </Checkbox>
      <Checkbox
        style={{ fontSize: '16px' }}
        onChange={(e) => dispatch(setDivided(e.target.checked))}
        checked={divided}
      >
        Divided
      </Checkbox>
    </div>
  );
};

const Visualize = () => (
  <div>
    <AttributeSelector slice="matrix" attr="vis_attr" setAttr={setVisAttr} />
    <Options />
  </div>
);

export default Visualize;
