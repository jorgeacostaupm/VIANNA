import React, { useState } from 'react';
import { Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setConfig } from '@/components/VAPUtils/features/matrix/matrixSlice';
import store from '@/components/VAPUtils/features/store';

const checkbox_style = { fontSize: '16px' };

const Configuration = () => {
  const {
    tooltip,
    selectLinks,
    selectAreas,
    brush,
    filterZoom,
    sync_select_nodes,
    sync_select_links,
    handleChange
  } = getConfig();

  return (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        flexDirection: 'column'
      }}
    >
      <Checkbox
        checked={tooltip}
        style={checkbox_style}
        onChange={(e) => handleChange('tooltip', e.target.checked)}
      >
        Tooltip
      </Checkbox>
      <Checkbox
        checked={selectLinks}
        style={checkbox_style}
        onChange={(e) => handleChange('select_links', e.target.checked)}
      >
        Select Links
      </Checkbox>
      <Checkbox
        checked={sync_select_links}
        style={checkbox_style}
        onChange={(e) => handleChange('sync_select_links', e.target.checked)}
      >
        Symmetric Link Selection
      </Checkbox>

      <Checkbox
        checked={selectAreas}
        style={checkbox_style}
        onChange={(e) => handleChange('select_areas', e.target.checked)}
      >
        Select ROIs
      </Checkbox>
      <Checkbox
        checked={sync_select_nodes}
        style={checkbox_style}
        onChange={(e) => handleChange('sync_select_nodes', e.target.checked)}
      >
        Symmetric ROI Selection
      </Checkbox>
      <Checkbox
        checked={brush}
        style={checkbox_style}
        onChange={(e) => handleChange('brush', e.target.checked)}
      >
        Brush
      </Checkbox>
      <Checkbox
        checked={filterZoom}
        style={checkbox_style}
        onChange={(e) => handleChange('filter_zoom', e.target.checked)}
      >
        Filter+Zoom
      </Checkbox>
    </div>
  );
};

function getConfig() {
  const dispatch = useDispatch();
  const config = useSelector((state) => state.matrix.config);

  const [tooltip, setTooltip] = useState(config.tooltip);
  const [selectLinks, setSelectLinks] = useState(config.select_links);
  const [selectAreas, setSelectAreas] = useState(config.select_areas);
  const [brush, setBrush] = useState(config.brush);
  const [filterZoom, setFilterZoom] = useState(config.filter_zoom);
  const [sync_select_nodes, setSyncNodes] = useState(config.sync_select_nodes);
  const [sync_select_links, setSyncLinks] = useState(config.sync_select_links);

  const updateConfig = (key, value) => {
    const updated_config = store.getState().matrix.config;
    const newConfig = { ...updated_config };
    newConfig[key] = value;
    dispatch(setConfig(newConfig));
  };

  const handleChange = (key, value) => {
    switch (key) {
      case 'tooltip':
        setTooltip(value);
        break;
      case 'select_links':
        setSelectLinks(value);
        break;
      case 'select_areas':
        setSelectAreas(value);
        break;
      case 'filter_zoom':
        setFilterZoom(value);
        break;
      case 'brush':
        setBrush(value);
        break;
      case 'sync_select_nodes':
        setSyncNodes(value);
        break;
      case 'sync_select_links':
        setSyncLinks(value);
        break;
      default:
        break;
    }
    updateConfig(key, value);
  };

  return {
    tooltip,
    selectLinks,
    selectAreas,
    brush,
    filterZoom,
    sync_select_nodes,
    sync_select_links,
    handleChange
  };
}

export default Configuration;
