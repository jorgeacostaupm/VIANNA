import React, { useState } from "react";
import { Grid, Modal, Tabs } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

import TabData from "@/components/management/Tabs/TabData";
import TabHierarchy from "@/components/management/Tabs/TabHierarchy";
import styles from "@/components/management/Data.module.css";
import TabDescriptions from "@/components/management/Tabs/TabDescriptions";
import TabSettings from "@/components/management/Tabs/TabSettings";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";

const items = [
  {
    key: "data",
    label: "Data",
    children: <TabData />,
  },
  {
    key: "hierarchy",
    label: "Hierarchy",
    children: <TabHierarchy />,
  },
  {
    key: "descriptions",
    label: "Descriptions",
    children: <TabDescriptions />,
  },
  {
    key: "settings",
    label: "Settings",
    children: <TabSettings />,
  },
];

export default function DataManagementButton({
  trigger = "panel",
  buttonLabel = "Management",
  buttonType = "default",
  size = "middle",
  onOpen,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}) {
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(defaultOpen);
  const isControlled = typeof controlledOpen === "boolean";
  const isModalOpen = isControlled ? controlledOpen : internalIsModalOpen;
  const screens = Grid.useBreakpoint();
  const modalWidth = screens.xl ? 1200 : screens.lg ? "94vw" : "96vw";
  const modalTop = screens.md ? 24 : 12;

  const setModalOpen = (nextOpen) => {
    if (!isControlled) {
      setInternalIsModalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const showModal = () => {
    onOpen?.();
    setModalOpen(true);
  };

  const handleOk = () => {
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  return (
    <>
      {trigger === "panel" ? (
        <AppButton
          preset={APP_BUTTON_PRESETS.PANEL_ICON}
          tooltip="Management"
          ariaLabel="Management"
          onClick={showModal}
          icon={<DatabaseOutlined />}
        />
      ) : (
        <AppButton
          preset={APP_BUTTON_PRESETS.BRAND}
          type={buttonType}
          size={size}
          icon={<DatabaseOutlined />}
          onClick={showModal}
          aria-label={buttonLabel}
        >
          {buttonLabel}
        </AppButton>
      )}
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={modalWidth}
        style={{ top: modalTop }}
        footer={null}
        centered={!screens.md}
        destroyOnClose
      >
        <Tabs
          className={styles.customTabs}
          defaultActiveKey="data"
          items={items}
        />
      </Modal>
    </>
  );
}
