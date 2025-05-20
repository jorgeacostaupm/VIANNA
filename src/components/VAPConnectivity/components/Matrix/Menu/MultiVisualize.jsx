import React from 'react';
import { Checkbox } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  setDiagonal,
  setDivided,
  addMultiAttr,
  removeMultiAttr
} from '@/components/VAPUtils/features/matrix/matrixSlice';
import MultiAttributeSelector from '../../MultiAttributeSelector';
import MultiAttributeList from '../../MultiAttributeList';

const Options = () => {
  const dispatch = useDispatch();
  const diagonal = useSelector((state) => state.matrix.diagonal);
  const divided = useSelector((state) => state.matrix.divided);

  return (
    <div>
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

const MultiVisualize = () => (
  <div>
    <MultiAttributeSelector slice="matrix" option={'vis'} addMultiAttr={addMultiAttr} />
    <div style={{ marginTop: '5px' }}>Matrices List:</div>
    <MultiAttributeList slice="matrix" removeMultiAttr={removeMultiAttr}></MultiAttributeList>
    <Options />
  </div>
);

export default MultiVisualize;
