import React, { useState } from "react";
import { Modal, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { selectShowInformativeTooltips } from "@/store/features/main";
import { AppButton, APP_BUTTON_VARIANTS } from "@/components/ui/button";

export default function AppModal({
  icon,
  title,
  tooltipTitle,
  children,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showInformativeTooltips = useSelector(selectShowInformativeTooltips);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Tooltip title={showInformativeTooltips ? tooltipTitle : null}>
        <AppButton
          variant={APP_BUTTON_VARIANTS.TOOLBAR}
          shape="circle"
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
