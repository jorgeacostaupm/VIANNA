import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import GeneralInfo from '../GeneralInfo/GeneralInfo';

export const GeneralInfoModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button style={{ width: '100%' }} type="primary" onClick={showModal}>
        Metadata
      </Button>

      {isModalOpen && <InfoModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
    </>
  );
};

const InfoModal = (props) => {
  const handleOk = () => {
    props.setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title={'Metadata'}
        open={props.isModalOpen}
        onCancel={handleOk}
        footer={null}
        width="80%"
        style={{ left: '50px', top: '6vh' }}
        bodyStyle={{ height: '80%' }}
      >
        <GeneralInfo />
      </Modal>
    </>
  );
};

export default GeneralInfoModal;
