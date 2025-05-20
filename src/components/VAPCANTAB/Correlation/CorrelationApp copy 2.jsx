import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScatterPlotMatrix } from './ScatterPlotMatrix';
import { computeCorrelationMatrixDataOnWorker } from '@/components/VAPUtils/functions';
import VarTable from './VarTable';
import DownloadSVG from '@/components/VAPUtils/Download';
import { AppMenu } from '@/components/VAPUtils/Menu';
import OptionsMatrix from './OptionsMatrix';
import OptionsScatter from './OptionsScatter';
import { setColumns } from '@/components/VAPUtils/features/correlation/correlationSlice';
import NoData from '@/components/VAPConnectivity/components/NoData';
import { Spin } from 'antd';
import { pubsub } from '@/components/VAPUtils/pubsub';
import {
  setSelectedPopulations,
  setInit
} from '@/components/VAPUtils/features/correlation/correlationSlice';
import useRootStyles from '@/components/VAPUtils/useRootStyles';
const { publish } = pubsub;
import useResizeObserver from '@/components/VAPCANTAB/Utils/hooks/useResizeObserver';

const menu = [
  {
    key: 0,
    label: 'Matrix',
    children: <OptionsMatrix />
  },

  {
    key: 1,
    label: 'ScatterPlots',
    children: <OptionsScatter />
  }
];

export const CorrelationApp = () => {
  const selection = useSelector((state) => state.cantab.selection);
  const populations = useSelector((state) => state.cantab.populations);
  const selectionPopulations = useSelector((state) => state.cantab.selection_populations);
  const selectedPopulations = useSelector((state) => state.correlation.selectedPopulations);
  const columns = useSelector((state) => state.correlation.columns);
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);
  const pointsSize = useSelector((state) => state.correlation.points_size);
  const isOnlyCorrelations = useSelector((state) => state.correlation.isOnlyCorrelations);
  const refMatrix = useRef(null);
  const ref1 = useRef(null);
  const dispatch = useDispatch();
  const [matrix, setMatrix] = useState(null);
  const dimensions = useResizeObserver(refMatrix);

  const result = useSelector((state) => state.correlation.result);
  const processing = useSelector((state) => state.correlation.loading);

  const group_var = useSelector((state) => state.cantab.group_var);
  const cols = useSelector((state) => state.dataframe.navioColumns);

  useEffect(() => {
    if (dimensions) {
      matrix.onResize(dimensions);
    }
  }, [dimensions]);

  useRootStyles({ padding: '0px 0px', maxWidth: '100vw' }, setInit, 'Correlation App');
  useEffect(() => {
    setMatrix(new ScatterPlotMatrix(refMatrix.current));
  }, []);

  useEffect(() => {
    dispatch(setSelectedPopulations(selectionPopulations));
  }, [selectionPopulations]);

  useEffect(() => {
    if (!cols.includes(group_var)) {
      const configuration = {
        message: 'Population variable not found.',
        description: 'Population variable not among the available ones in the dataset.',
        type: 'error'
      };
      publish('notification', configuration);
    }
  }, [group_var]);

  useEffect(() => {
    if (selection.length < 2) {
      const configuration = {
        message: 'Not enough data points.',
        type: 'error'
      };
      publish('notification', configuration);
    }
  }, [selection]);

  useEffect(() => {
    if (!cols.includes(group_var) || selection.length < 2 || columns.length < 2) {
      if (matrix) {
        ref1.current.innerHTML = '';
        matrix.data = [];
        matrix.updateVis();
      }
      return;
    }
    if (columns.length > 1 && selection.length > 2) {
      console.log('COMPUTING CORRELATION DATA... (async)');
      computeCorrelationMatrixDataOnWorker(selection, columns, selectedPopulations, group_var);
    }
  }, [selection, group_var, columns, selectedPopulations, group_var]);

  useEffect(() => {
    if (
      matrix &&
      result?.length > 1 &&
      navioColumns.includes(group_var) &&
      result.length === Math.pow(columns.length, 2)
    ) {
      matrix.columns = columns;
      matrix.data = selection;
      matrix.correlations = result;
      matrix.points_size = pointsSize;
      matrix.forceCorrelations = isOnlyCorrelations;
      matrix.updateVis();
    }
  }, [result, pointsSize, populations, isOnlyCorrelations]);

  useEffect(() => {
    if (
      matrix &&
      result?.length > 1 &&
      navioColumns.includes(group_var) &&
      result.length === Math.pow(columns.length, 2)
    ) {
      matrix.points_size = pointsSize;
      matrix.updatePoints();
    }
  }, [pointsSize]);

  useEffect(() => {
    const new_columns = columns.filter((d) => navioColumns.includes(d));
    dispatch(setColumns(new_columns));
  }, [navioColumns]);

  console.log('RENDERING CORRELATION APP');
  return (
    <>
      {' '}
      <div className="appLayout correlationAppLayout">
        <AppMenu items={menu} />
        <div style={{ height: '100%', width: '20%' }}>
          <VarTable></VarTable>
        </div>

        <div
          style={{
            height: '100%',
            width: '80%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'visible'
          }}
        >
          <div id="correlation-tooltip"></div>
          <div id="contextmenu-tooltip"></div>
          <div
            style={{
              width: '25%',
              maxHeight: '100%',
              overflow: 'scroll'
            }}
          >
            <svg id="correlation-legend" ref={ref1} />
          </div>
          <div
            style={{
              width: '75%',
              height: '100%'
            }}
          >
            <svg className="fill" id="correlation-app" ref={refMatrix} />
          </div>
        </div>

        <DownloadSVG id="correlation-app" />
        {processing && (
          <Spin style={{ position: 'absolute', top: '50%', left: '55%' }} size={'large'} />
        )}
      </div>
    </>
  );
};

export default CorrelationApp;
