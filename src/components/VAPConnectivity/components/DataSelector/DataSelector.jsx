import { Provider, useDispatch } from 'react-redux';
import store from '@/components/VAPUtils/features/store';
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { placeholders, modal } from './configuration/config.json';
import DataMenu from './items/DataMenu';

export const DataSelector = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const hideModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button style={{ width: '100%' }} type="primary" onClick={showModal}>
        {placeholders.title}
      </Button>

      {isModalOpen && (
        <Modal
          title={placeholders.title}
          open={isModalOpen}
          onCancel={hideModal}
          footer={null}
          width={modal.width}
          style={{ top: modal.margin_top }}
          bodyStyle={{ height: modal.height }}
        >
          <DataMenu />
        </Modal>
      )}
    </>
  );
};

export default DataSelector;
