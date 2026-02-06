import React, { useState } from "react";
import { Button, Modal, Tooltip } from "antd";
import styles from "@/styles/Buttons.module.css";

export default function AppModal({
  icon,
  title,
  tooltipTitle,
  children,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <Button
          shape="circle"
          className={styles.barButton}
          onClick={openModal}
          icon={icon}
        />
      </Tooltip>
      <Modal
        title={title}
        open={isModalOpen}
        onOk={closeModal}
        onCancel={closeModal}
        width={800}
        footer={null}
      >
        {children}
      </Modal>
    </>
  );
}
