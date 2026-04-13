import React, { useState } from "react";
import { Modal } from "antd";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";

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
      <AppButton
        preset={APP_BUTTON_PRESETS.TOOLBAR_ICON}
        shape="circle"
        onClick={openModal}
        icon={icon}
        tooltip={tooltipTitle}
        ariaLabel={tooltipTitle || title}
      />
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
