import React, { useEffect, useRef, useState } from 'react';
import { Matrix } from './Matrix';
import { ViewsManager } from '../../managers/ViewsManager';
import { useSelector } from 'react-redux';
import { SQUARE_LENGTH } from '../../../VAPUtils/Constants';
import DownloadSVG from '@/components/VAPUtils/Download';

const manager = ViewsManager.getInstance();

const useUpdateGraph = ({ attr, index }) => {
  const [instance, setInstance] = useState(null);
  const divRef = useRef(null);

  const diagonal = useSelector((state) => state.matrix.diagonal);
  const divided = useSelector((state) => state.matrix.divided);

  const is_filter = useSelector((state) => state.matrix.is_filter);
  const is_vis_filter = useSelector((state) => state.matrix.is_vis_filter);
  const filter_attr = useSelector((state) => state.matrix.filter_attr);
  const filter_value = useSelector((state) => state.matrix.filter_value);
  const specialFilterValues = useSelector((state) => state.matrix.specialFilterValues);

  const main_bool_matrix = useSelector((state) => state.main.bool_matrix);
  const matrix_bool_matrix = useSelector((state) => state.matrix.bool_matrix);

  const is_reorder = useSelector((state) => state.matrix.is_reorder);
  const is_vis_reorder = useSelector((state) => state.matrix.is_vis_reorder);
  const reorder_attr = useSelector((state) => state.matrix.reorder_attr);
  const algorithm = useSelector((state) => state.matrix.algorithm);
  const distance = useSelector((state) => state.matrix.distance);

  const multi_attrs = useSelector((state) => state.matrix.multi_attrs);

  const links = useSelector((state) => state.matrix.links);
  const selected_ids = useSelector((state) => state.atlas.selected_ids);

  const config = useSelector((state) => state.matrix.config);

  const base = useSelector((state) => state.main.base);
  const atlas = useSelector((state) => state.atlas.selected_atlas);

  useEffect(() => {
    if (instance == null) {
      console.log('INITIALIZAING MATRIX...', attr, base);
      divRef.current.innerHTML = '';
      const matrix = new Matrix(divRef.current);
      setInstance(matrix);
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (instance != null) {
      console.log('UPDATING MATRIX: ');
      manager.updateMatrix(instance, attr);
    }
    return () => {};
  }, [
    attr,
    selected_ids,
    diagonal,
    divided,
    main_bool_matrix,
    matrix_bool_matrix,
    atlas,
    instance
  ]);

  useEffect(() => {
    if (instance != null) {
      console.log('UPDATING MATRIX (filter) ');
      manager.updateMatrix(instance, attr);
    }
    return () => {};
  }, [is_filter, is_vis_filter, filter_attr, filter_value, specialFilterValues]);

  useEffect(() => {
    if (instance != null && (is_reorder || is_vis_reorder)) {
      console.log('UPDATING MATRIX (reorder) ');
      manager.updateMatrix(instance, attr);
    }
    return () => {};
  }, [is_reorder, reorder_attr, algorithm, distance, multi_attrs]);

  useEffect(() => {
    if (instance != null) {
      instance.updateIndex(index, multi_attrs);
    }
    return () => {};
  }, [index, instance]);

  useEffect(() => {
    if (instance != null) {
      instance.drawSelectedLinks();
    }
    return () => {};
  }, [links]);

  useEffect(() => {
    if (instance != null) {
      instance.config = config;
      instance.configInteraction();
    }
    return () => {};
  }, [config]);

  return divRef;
};

const Container = (props) => {
  const divRef = useUpdateGraph(props);

  return (
    <div
      style={{
        width: props.calculatedHeight ? props.calculatedHeight : '100%',
        height: props.calculatedWidth ? props.calculatedWidth : '100%',
        position: 'relative',
        background: 'white',
        padding: '5px'
      }}
    >
      <div id="matrix-tooltip"></div>
      <svg
        id="matrix-svg"
        ref={divRef}
        width="100%"
        height="100%"
        overflow={'visible'}
        viewBox={`0 0 ${SQUARE_LENGTH} ${SQUARE_LENGTH}`}
        preserveAspectRatio="xMidYMid meet"
      />

      <DownloadSVG id={'matrix-svg'} />
    </div>
  );
};

export default Container;
