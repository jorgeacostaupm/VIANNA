import React, { useEffect, useRef, useState } from 'react';
import { Circular } from './Circular';
import ViewsManager from '../../managers/ViewsManager';
import { useSelector } from 'react-redux';
import { SQUARE_LENGTH } from '@/components/VAPUtils/Constants';
import DownloadSVG from '@/components/VAPUtils/Download';

const manager = ViewsManager.getInstance();

const useUpdateGraph = ({ attr }) => {
  const [instance, setInstance] = useState(null);
  const divRef = useRef(null);

  const is_filter = useSelector((state) => state.circular.is_filter);
  const is_vis_filter = useSelector((state) => state.circular.is_vis_filter);
  const is_hipo = useSelector((state) => state.circular.is_hipo);
  const is_hiper = useSelector((state) => state.circular.is_hiper);
  const link_opacity = useSelector((state) => state.circular.link_opacity);
  const curve_value = useSelector((state) => state.circular.curve_value);

  const main_bool_matrix = useSelector((state) => state.main.bool_matrix);
  const matrix_bool_matrix = useSelector((state) => state.circular.bool_matrix);

  const is_fixed = useSelector((state) => state.circular.is_fixed);
  const is_complete = useSelector((state) => state.circular.is_complete);
  const filter_attr = useSelector((state) => state.circular.filter_attr);
  const filter_value = useSelector((state) => state.circular.filter_value);

  const links = useSelector((state) => state.circular.links);
  const selected_ids = useSelector((state) => state.atlas.selected_ids);

  const config = useSelector((state) => state.circular.config);

  useEffect(() => {
    if (instance == null && attr) {
      console.log('INITIALIZAING CIRCULAR...');
      divRef.current.innerHTML = '';
      const circular = new Circular(divRef.current);
      setInstance(circular);
      manager.updateCircular(circular, attr);
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (instance != null) {
      console.log('UPDATING CIRCULAR: ', attr);
      manager.updateCircular(instance, attr);
    }
    return () => {};
  }, [
    is_fixed,
    selected_ids,
    is_complete,
    curve_value,
    attr,
    main_bool_matrix,
    matrix_bool_matrix
  ]);

  useEffect(() => {
    if (instance != null) {
      instance.updateLinkOpacity();
    }
    return () => {};
  }, [link_opacity]);

  useEffect(() => {
    if (instance != null && (is_filter || is_vis_filter)) {
      console.log('UPDATING CIRCULAR (filter) ');
      manager.updateCircular(instance, attr);
    }
    return () => {};
  }, [is_filter, filter_attr, filter_value]);

  useEffect(() => {
    if (instance != null) {
      instance.updateLinks();
    }
    return () => {};
  }, [links]);

  useEffect(() => {
    if (instance != null) {
      instance.updateLinks();
    }
    return () => {};
  }, [links, is_hipo, is_hiper]);

  useEffect(() => {
    if (instance != null) {
      instance.config = config;
      instance.configInteraction();
    }
    return () => {};
  }, [config]);

  return divRef;
};

export const Container = (props) => {
  const svg_ref = useUpdateGraph(props);

  return (
    <div
      style={{
        width: props.calculatedHeight ? props.calculatedHeight : '100%',
        height: props.calculatedWidth ? props.calculatedWidth : '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'white',
        borderRadius: '5px'
      }}
    >
      <div style={{ position: 'absolute', margin: '5px' }}>
        <div id="circular-tooltip-1"></div>
        <div id="circular-tooltip-2"></div>
      </div>
      <svg
        id="circular-svg"
        ref={svg_ref}
        width="100%"
        height="100%"
        overflow={'visible'}
        viewBox={`0 0 ${SQUARE_LENGTH} ${SQUARE_LENGTH}`}
        preserveAspectRatio="xMidYMid meet"
      />

      <DownloadSVG id="circular-svg" />
    </div>
  );
};

export default Container;
