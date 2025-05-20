import * as aq from 'arquero';
import React, { useState } from 'react';
import { Button, Input,} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setDataframe } from '@/components/VAPUtils/features/data/dataSlice';
import { DEFAULT_ORDER_VARIABLE } from '@/components/VAPUtils/Constants';

const PopulationGenerator = () => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
  const selection = useSelector((state) => state.cantab.selection);
  const data = useSelector((state) => state.dataframe.dataframe);
  const group_var = useSelector((state) => state.cantab.group_var);

  const onInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const onSelectionToPopulationClick = () => {
    const updatedData = data.map((item) => {
      const selectedItem = selection.find((sel) => {
        return sel[DEFAULT_ORDER_VARIABLE] === item[DEFAULT_ORDER_VARIABLE];
      });
      if (selectedItem) {
        return { ...item, [group_var]: inputValue };
      }
      return item;
    });

    console.log(updatedData);
    const dt = aq.from(updatedData);
    dt.print();
    dispatch(setDataframe(updatedData));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Input value={inputValue} onChange={onInputChange} placeholder="Population Name"></Input>
      <Button onClick={onSelectionToPopulationClick} type="primary">
        Selection to Population
      </Button>
    </div>
  );
};

export default PopulationGenerator;
