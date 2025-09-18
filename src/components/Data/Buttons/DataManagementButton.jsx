import React, { useState } from "react";
import { Modal, Tabs } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

import TabData from "../Tabs/TabData";
import TabHierarchy from "../Tabs/TabHierarchy";
import styles from "../Data.module.css";
import PanelButton from "@/utils/PanelButton";

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
  /*   {
    key: "test",
    label: "Custom Tests",
    children: <TabTest />,
  }, */
];

export default function DataManagementButton() {
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
      <PanelButton
        title={"Open Data Management"}
        onClick={showModal}
        icon={<DatabaseOutlined />}
      />
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
        footer={null}
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
