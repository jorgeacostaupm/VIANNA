import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Menu } from '@/components/VAPUtils/Menu';

import { DEFAULT_ORDER_VARIABLE } from '@/components/VAPCANTAB/Utils/constants/Constants';

import { Button } from 'antd';
import { setDataframe } from '../../VAPUtils/features/data/dataSlice';
import { setQuarantineData } from '../../VAPUtils/features/cantab/cantabSlice';

const QuarantineButtons = () => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 5,
        top: 5,
        zIndex: 100,
        gap: 5,
        display: 'flex'
      }}
    >
      <QuarantineSelectionButtons></QuarantineSelectionButtons>
    </div>
  );
};

export default QuarantineButtons;

const QuarantineSelectionButtons = () => {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.cantab.quarantineSelection);
  const quarantineData = useSelector((state) => state.cantab.quarantineData);
  const dataframe = useSelector((state) => state.dataframe.dataframe);

  function onSetSelection() {
    const ids = selection.map((item) => item[DEFAULT_ORDER_VARIABLE]);
    const filteredData = quarantineData.filter((item) =>
      ids.includes(item[DEFAULT_ORDER_VARIABLE])
    );
    const filteredQuarantineData = quarantineData.filter(
      (item) => !ids.includes(item[DEFAULT_ORDER_VARIABLE])
    );

    dispatch(setDataframe([...filteredData, ...dataframe]));
    dispatch(setQuarantineData(filteredQuarantineData));
  }

  function onsetQuarantineData() {
    dispatch(setDataframe([...quarantineData, ...dataframe]));
    dispatch(setQuarantineData([]));
  }

  return (
    <>
      <Button onClick={onSetSelection} type="primary">
        Restore Selection
      </Button>
      <Button onClick={onsetQuarantineData} type="primary">
        Restore All Data
      </Button>
    </>
  );
};
