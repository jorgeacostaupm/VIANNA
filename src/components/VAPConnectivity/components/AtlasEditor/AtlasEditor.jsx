import { useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { AtlasMenu } from './menu/AtlasMenu';
import { AtlasEditorContainer } from './3d/AtlasEditorContainer';
import { resetIds } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { placeholders, modal } from './configuration/config.json';
import { useSelector } from 'react-redux';

export const AtlasEditor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button style={{ width: '100%' }} type="primary" onClick={showModal}>
        Electrodes Editor
      </Button>

      {isModalOpen && <AtlasModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
    </>
  );
};

const AtlasModal = (props) => {
  const dispatch = useDispatch();
  const handleOk = () => {
    props.setIsModalOpen(false);
    dispatch(resetIds());
  };

  return (
    <>
      <Modal
        title={placeholders.title}
        open={props.isModalOpen}
        onCancel={handleOk}
        footer={null}
        width="80%"
        style={{ top: modal.margin_top, left: '50px' }}
        bodyStyle={{ height: modal.height }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: modal.row_height
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '80%',
              height: '70vh'
            }}
          >
            <AtlasMenu />
          </div>
          <AtlasEditorContainer />
        </div>
      </Modal>
    </>
  );
};

export const AtlasEditorTab = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        background: 'white',
        padding: '2vw',
        height: '70vh'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '80%'
        }}
      >
        <AtlasMenu />
      </div>
      <AtlasEditorContainer />
    </div>
  );
};

export default AtlasEditor;
