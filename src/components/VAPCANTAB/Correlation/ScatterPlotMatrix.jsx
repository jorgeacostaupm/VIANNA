import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { D3ScatterPlotMatrix } from "./D3ScatterPlotMatrix";
import { computeCorrelationMatrixDataOnWorker } from "@/components/VAPUtils/functions";
import DownloadSVG from "@/components/VAPUtils/Download";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";
import { setSelectedPopulations } from "@/components/VAPUtils/features/correlation/correlationSlice";

export const ScatterPlotMatrix = () => {
  const dispatch = useDispatch();

  const [matrix, setMatrix] = useState(null);
  const refMatrix = useRef(null);

  const selection = useSelector((state) => state.cantab.selection);
  const populations = useSelector((state) => state.cantab.populations);
  const selectionPopulations = useSelector(
    (state) => state.cantab.selection_populations
  );
  const group_var = useSelector((state) => state.cantab.group_var);

  const selectedPopulations = useSelector(
    (state) => state.correlation.selectedPopulations
  );
  const columns = useSelector((state) => state.correlation.columns);
  const pointsSize = useSelector((state) => state.correlation.points_size);
  const isOnlyCorrelations = useSelector(
    (state) => state.correlation.isOnlyCorrelations
  );
  const result = useSelector((state) => state.correlation.result);

  const dimensions = useResizeObserver(refMatrix);

  useEffect(() => {
    setMatrix(new D3ScatterPlotMatrix(refMatrix.current));
  }, []);

  useEffect(() => {
    dispatch(setSelectedPopulations(selectionPopulations));
  }, [selectionPopulations]);

  useEffect(() => {
    if (matrix && columns.length > 1)
      computeCorrelationMatrixDataOnWorker(
        selection,
        columns,
        selectedPopulations,
        group_var
      );
  }, [selection, columns, group_var, selectedPopulations, group_var, matrix]);

  useEffect(() => {
    if (
      matrix &&
      result?.length > 1 &&
      result.length === Math.pow(columns.length, 2) &&
      dimensions
    ) {
      matrix.columns = columns;
      matrix.data = selection;
      matrix.correlations = result;
      matrix.points_size = pointsSize;
      matrix.forceCorrelations = isOnlyCorrelations;
      matrix.onResize(dimensions);
    }
  }, [result, pointsSize, populations, isOnlyCorrelations, dimensions]);

  useEffect(() => {
    if (matrix) {
      matrix.points_size = pointsSize;
      matrix.updatePoints();
    }
  }, [pointsSize]);

  return (
    <>
      <div id="correlation-tooltip"></div>
      <div id="contextmenu-tooltip"></div>
      <div
        style={{
          width: "100%",
          height: "100%",
          visibility: result?.length > 1 ? "visible" : "hidden",
        }}
      >
        <svg className="fill" id="correlation-app" ref={refMatrix} />
      </div>

      <DownloadSVG id="correlation-app" />
    </>
  );
};

export default ScatterPlotMatrix;
