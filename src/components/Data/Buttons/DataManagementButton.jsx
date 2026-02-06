import React, { useState } from "react";
import { Modal, Tabs } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

import TabData from "../Tabs/TabData";
import TabHierarchy from "../Tabs/TabHierarchy";
import styles from "../Data.module.css";
import PanelButton from "@/components/ui/PanelButton";
import TabDescriptions from "../Tabs/TabDescriptions";

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
        width={1200}
        style={{ top: 24 }}
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
