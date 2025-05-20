import React, { useState } from 'react';
import { Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setConfig } from '@/components/VAPUtils/features/matrix/matrixSlice';
import { MultiplesModal } from './Modal';
import store from '@/components/VAPUtils/features/store';

const checkbox_style = { fontSize: '16px' };

const Configuration = () => {
  const { tooltip, selectLinks, selectAreas, handleChange } = getConfig();

  return (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        flexDirection: 'column'
      }}
    >
      <Checkbox
        style={checkbox_style}
        onChange={(e) => handleChange('tooltip', e.target.checked)}
        checked={tooltip}
      >
        Show Info
      </Checkbox>
      <Checkbox
        style={checkbox_style}
        onChange={(e) => handleChange('select_links', e.target.checked)}
        checked={selectLinks}
      >
        Link Selection
      </Checkbox>
      <Checkbox
        style={checkbox_style}
        onChange={(e) => handleChange('select_areas', e.target.checked)}
        checked={selectAreas}
      >
        ROI Selection
      </Checkbox>
    </div>
  );
};

function getConfig() {
  const dispatch = useDispatch();
  const config = useSelector((state) => state.circular.config);

  const [tooltip, setTooltip] = useState(config.tooltip);
  const [selectLinks, setSelectLinks] = useState(config.select_links);
  const [selectAreas, setSelectAreas] = useState(config.select_areas);

  const updateConfig = (key, value) => {
    const updated_config = store.getState().circular.config;
    const newConfig = { ...updated_config };
    if (key.includes('brush')) {
      newConfig.brush = { ...newConfig.brush, [key.split('_')[1]]: value };
    } else {
      newConfig[key] = value;
    }
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
      default:
        break;
    }
    updateConfig(key, value);
  };

  return {
    tooltip,
    selectLinks,
    selectAreas,
    handleChange
  };
}

export default Configuration;
