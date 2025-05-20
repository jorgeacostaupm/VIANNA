import React from 'react';
import {
  setColumns,
  setIsOnlyCorrelations,
  setNVariables
} from '@/components/VAPUtils/features/correlation/correlationSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, Button, Slider } from 'antd';
import { computeCorrelationMatrixData } from '@/components/VAPUtils/functions';

const OptionsMatrix = () => {
  const dispatch = useDispatch();
  const isOnlyCorrelations = useSelector((state) => state.correlation.isOnlyCorrelations);
  const nVariables = useSelector((state) => state.correlation.nVariables);
  const selection = useSelector((state) => state.cantab.selection);
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);

  const selectedPopulations = useSelector((state) => state.correlation.selectedPopulations);
  const groupVar = useSelector((state) => state.cantab.group_var);

  const onOnlyCorrelations = (e) => {
    dispatch(setIsOnlyCorrelations(e.target.checked));
  };

  const getTopColumns = () => {
    const d = computeCorrelationMatrixData(selection, navioColumns, selectedPopulations, groupVar);

    // Filtrar y ordenar los datos
    const filteredData = d
      .filter((item) => item.x !== item.y && !isNaN(item.value)) // Descarta donde x === y y valores NaN
      .sort((a, b) => b.value - a.value); // Ordena por value descendente

    // Seleccionar variables únicas asociadas a los valores máximos
    const uniqueVariables = [];
    const addedVariables = new Set();

    for (let i = 0; i < filteredData.length && uniqueVariables.length < nVariables; i++) {
      const { x, y } = filteredData[i];
      if (!addedVariables.has(x)) {
        uniqueVariables.push(x);
        addedVariables.add(x);
      }
      if (!addedVariables.has(y) && uniqueVariables.length < nVariables) {
        uniqueVariables.push(y);
        addedVariables.add(y);
      }
    }

    dispatch(setColumns(uniqueVariables));
    return uniqueVariables;
  };

  const onNVariablesComplete = (value) => {
    dispatch(setNVariables(value));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <Checkbox
        style={{ fontSize: '16px' }}
        checked={isOnlyCorrelations}
        onChange={onOnlyCorrelations}
      >
        Only Correlations
      </Checkbox>

      <div style={{ fontSize: '16px' }}>Nº Top Variables:</div>
      <Slider
        min={0}
        max={80}
        defaultValue={nVariables}
        onChangeComplete={onNVariablesComplete}
        step={1}
        style={{ width: '100%' }}
      />

      <Button type="primary" onClick={getTopColumns}>
        Get Top {nVariables} Variables
      </Button>
    </div>
  );
};

export default OptionsMatrix;
