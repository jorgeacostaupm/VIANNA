import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  computeEvolutionData,
  computeCompareCategoriesData
} from '@/components/VAPUtils/functions';

import { D3EvolutionCategoric } from './D3EvolutionCategoric';
import { D3EvolutionPlot } from './D3EvolutionPlot';

import DownloadSVG from '@/components/VAPUtils/Download';
import useResizeObserver from '@/components/VAPCANTAB/Utils/hooks/useResizeObserver';

export const EvolutionPlots = () => {
  const [evo, setEvo] = useState(null);

  const selection = useSelector((state) => state.cantab.selection);

  const isNumeric = useSelector((state) => state.evolution.isNumeric);
  const result = useSelector((state) => state.evolution.result);
  const selectedVar = useSelector((state) => state.evolution.selectedVar);

  const showStds = useSelector((state) => state.evolution.showStds);
  const showMeans = useSelector((state) => state.evolution.showMeans);
  const meanPointSize = useSelector((state) => state.evolution.meanPointSize);
  const subjectPointSize = useSelector((state) => state.evolution.subjectPointSize);
  const meanStrokeWidth = useSelector((state) => state.evolution.meanStrokeWidth);
  const subjectStrokeWidth = useSelector((state) => state.evolution.subjectStrokeWidth);

  const refEvo = useRef(null);
  const refLegend = useRef(null);
  const evoDimensions = useResizeObserver(refEvo);

  console.log('EVOLUTION PLOTS', selectedVar);

  useEffect(() => {
    if (evo?.data && evoDimensions && selectedVar) {
      evo.onResize(evoDimensions);
    }
  }, [evoDimensions]);

  useEffect(() => {
    refEvo.current.innerHTML = '';
    refLegend.current.innerHTML = '';
    if (selectedVar) {
      console.log('COMPUTING EVOLUTION TIMES...(sync)');
      if (isNumeric) {
        const variable = selectedVar.split('^')[0];
        const data = computeEvolutionData(selection, variable);
        const evolution = new D3EvolutionPlot(refEvo.current, data);
        evolution.showStds = showStds;
        evolution.showMeans = showMeans;
        evolution.meanPointSize = meanPointSize;
        evolution.meanStrokeWidth = meanStrokeWidth;
        evolution.subjectPointSize = subjectPointSize;
        evolution.subjectStrokeWidth = subjectStrokeWidth;
        evolution.updateVis();
        setEvo(evolution);
      } else {
        const variable = selectedVar.split('^')[0];
        const group = selectedVar.split('^')[1];
        const data = computeCategoricEvolutionData(selection, variable, group);
        const evolution = new D3EvolutionCategoric(refEvo.current, data);
        evolution.updateVis();
        setEvo(evolution);
      }
    }
  }, [selectedVar, selection]);

  useEffect(() => {
    if (evo) {
      evo.showStds = showStds;
      evo.showMeans = showMeans;
      evo.meanPointSize = meanPointSize;
      evo.meanStrokeWidth = meanStrokeWidth;
      evo.subjectPointSize = subjectPointSize;
      evo.subjectStrokeWidth = subjectStrokeWidth;
      evo.updateSizes();
    }
  }, [showStds, showMeans, meanPointSize, meanStrokeWidth, subjectPointSize, subjectStrokeWidth]);

  return (
    <>
      <div className="viewContainer">
        <DownloadSVG id="compare-distr" />
        <div id="evolution-tooltip"></div>
        <div id="contextmenu-tooltip"></div>
        <div style={{ height: '100%', width: '85%', position: 'relative' }}>
          <svg id={'compare-distr'} ref={refEvo} className="fill" />
        </div>
        <div className="legendDiv">
          <svg ref={refLegend} id={'evolution-lines-legend'} />
        </div>
      </div>
    </>
  );
};

export default EvolutionPlots;
