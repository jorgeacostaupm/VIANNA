import React from 'react';
import { Button } from 'antd';
import { MultiplesModal } from './Modal';
import store from '@/components/VAPUtils/features/store';
import ViewsManager from '../../../managers/ViewsManager';
import { EVENTS } from '@/components/VAPUtils/Constants';
import { setLinks } from '@/components/VAPUtils/features/matrix/matrixSlice';
import { ZoomInOutlined, UndoOutlined } from '@ant-design/icons';

const manager = ViewsManager.getInstance();
const channel = manager.getMatrixChannel();
const buttons_style = { width: '100%' };

const Interaction = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        flexDirection: 'column'
      }}
    >
      {!props.modal && <MultiplesModal />}

      <Button type="primary" style={buttons_style} onClick={onZoomSelectedLinks}>
        <ZoomInOutlined /> Link Selection
      </Button>

      <Button type="primary" style={buttons_style} onClick={onZoomSelectedNodes}>
        <ZoomInOutlined /> ROI Selection
      </Button>

      {/*       <Button type="primary" style={buttons_style} onClick={onResetGeometricZoom}>
        <UndoOutlined /> Geometric Zoom
      </Button> */}

      <Button type="primary" style={buttons_style} onClick={onResetSelectedNodes}>
        <UndoOutlined /> ROI Selection
      </Button>

      <Button type="primary" style={buttons_style} onClick={onResetSelectedLinks}>
        <UndoOutlined /> Link Selection
      </Button>

      <Button type="primary" style={buttons_style} onClick={onResetBrushZoom}>
        <UndoOutlined /> Brush Zoom
      </Button>
    </div>
  );
};

function onResetSelectedLinks() {
  store.dispatch(setLinks([]));
}

function onZoomSelectedNodes() {
  channel.postMessage({ type: EVENTS.ZOOM_MATRIX_SELECTED_NODES });
}

function onZoomSelectedLinks() {
  channel.postMessage({ type: EVENTS.ZOOM_MATRIX_SELECTED_LINKS });
}

function onResetBrushZoom() {
  channel.postMessage({ type: EVENTS.RESET_ZOOM_MATRIX });
}

function onResetSelectedNodes() {
  channel.postMessage({ type: EVENTS.RESET_MATRIX_NODE_SELECTION });
}

function onResetGeometricZoom() {
  channel.postMessage({ type: EVENTS.RESET_MATRIX_GEOMETRIC_ZOOM });
}

export default Interaction;
