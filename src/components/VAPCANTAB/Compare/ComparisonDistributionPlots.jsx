import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  computeCompareDensitiesData,
  computeCompareCategoriesData
} from '@/components/VAPUtils/functions';
import { D3DistributionCategoriesPlots } from './D3DistributionCategoriesPlots';
import { D3ComparisonDistributionPlots } from './D3DistributionPlots';

import DownloadSVG from '@/components/VAPUtils/Download';
import useResizeObserver from '@/components/VAPCANTAB/Utils/hooks/useResizeObserver';

export const ComparisonDistributionPlots = () => {
  const [distr, setDistr] = useState(null);

  const selection = useSelector((state) => state.cantab.selection);

  const isNumeric = useSelector((state) => state.compare.isNumeric);
  const result = useSelector((state) => state.compare.result);
  const selectedVar = useSelector((state) => state.compare.selectedVar);

  const distributionView = useSelector((state) => state.compare.estimator);
  const nPoints = useSelector((state) => state.compare.nPoints);
  const range = useSelector((state) => state.compare.distrRange);
  const pointSize = useSelector((state) => state.compare.pointSize);

  const refDistr = useRef(null);
  const refLegend = useRef(null);
  const distrDimensions = useResizeObserver(refDistr);

  useEffect(() => {
    const distrPlot = new D3ComparisonDistributionPlots(refDistr.current);
    setDistr(distrPlot);
  }, []);

  useEffect(() => {
    if (distr?.data && distrDimensions && selectedVar) {
      distr.onResize(distrDimensions);
    }
  }, [distrDimensions]);

  // this is not very well done
  // maybe in the future it will need a worker and a more complex handling, for now, it works :)
  useEffect(() => {
    if (selectedVar && result && distr) {
      if (isNumeric) {
        const data = computeCompareDensitiesData(selection, selectedVar);
        distr.data = data;
        distr.nPoints = nPoints;
        distr.estimator = distributionView;
        distr.pointSize = pointSize;
        distr.range = range;
        distr.updateVis();
      } else {
        refDistr.current.innerHTML = '';
        const data = computeCompareCategoriesData(selection, selectedVar);
        const histograms = new D3DistributionCategoriesPlots(refDistr.current, data);
        histograms.updateVis();
        setDistr(histograms);
      }
    }
  }, [selection, distributionView, nPoints, pointSize, range, distr]);

  useEffect(() => {
    if (selectedVar && result && distr) {
      if (isNumeric) {
        const data = computeCompareDensitiesData(selection, selectedVar);
        distr.data = data;
        distr.nPoints = nPoints;
        distr.estimator = distributionView;
        distr.pointSize = pointSize;
        distr.range = range;
        distr.selectedPoints = [];
        distr.updateVis();
      } else {
        const data = computeCompareCategoriesData(selection, selectedVar);
        const histograms = new D3DistributionCategoriesPlots(refDistr.current, data);
        histograms.updateVis();
        setDistr(histograms);
      }
    }
  }, [selectedVar]);

  return (
    <>
      <div className="viewContainer">
        <DownloadSVG id="compare-distr" />
        <div id="lines-tooltip"></div>
        <div id="contextmenu-tooltip"></div>
        <div style={{ height: '100%', width: '85%', position: 'relative' }}>
          <svg
            id={'compare-distr'}
            style={{ visibility: selectedVar ? 'visible' : 'hidden' }}
            ref={refDistr}
            className="fill"
          />
        </div>
        <div className="legendDiv">
          <svg
            style={{ visibility: selectedVar ? 'visible' : 'hidden' }}
            ref={refLegend}
            id={'compare-lines-legend'}
          />
        </div>
      </div>
    </>
  );
};

export default ComparisonDistributionPlots;
