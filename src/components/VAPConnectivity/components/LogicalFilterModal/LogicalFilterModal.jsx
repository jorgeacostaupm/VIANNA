import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import LogicalFilter from '../LogicalFilter/LogicalFilter';

export const LogicalFilterModal = ({ setBoolMatrix, setFilteringExpr, title, width, slice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {title}
      </Button>

      {isModalOpen && (
        <ModalContainer
          title={title}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setBoolMatrix={setBoolMatrix}
          setFilteringExpr={setFilteringExpr}
          slice={slice}
        />
      )}
    </>
  );
};

const ModalContainer = (props) => {
  const dispatch = useDispatch();
  const handleOk = () => {
    props.setIsModalOpen(false);
    dispatch(resetIds());
  };

  return (
    <>
      <Modal
        title={props.title}
        open={props.isModalOpen}
        onCancel={handleOk}
        footer={null}
        width="50%"
        style={{ left: '50px', top: '25vh', fontSize: '50px' }}
        bodyStyle={{ height: '80%' }}
      >
        <LogicalFilter
          setBoolMatrix={props.setBoolMatrix}
          setFilteringExpr={props.setFilteringExpr}
          slice={props.slice}
        />
      </Modal>
    </>
  );
};

export default LogicalFilterModal;
