import React, { useState } from "react";
import { Button, Modal, Tooltip } from "antd";
import styles from "./Buttons.module.css";

export default function AppModal({
  icon,
  title,
  tooltipTitle,
  children,
  padding = "20px",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <Button
          shape="circle"
          className={styles.barButton}
          onClick={showModal}
          icon={icon}
        ></Button>
      </Tooltip>
      <Modal
        title={title}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        {children}
      </Modal>
    </>
  );
}
