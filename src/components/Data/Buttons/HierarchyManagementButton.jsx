import React, { useState } from "react";
import { Modal } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

import TabHierarchy from "../Tabs/TabHierarchy";
import styles from "../Data.module.css";
import BarButton from "@/utils/BarButton";

export default function HierarchyManagementButton() {
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
      <BarButton
        title={"Open Hierarchy Management"}
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
        <div className={styles.customTabs}>
          <TabHierarchy />
        </div>
      </Modal>
    </>
  );
}
