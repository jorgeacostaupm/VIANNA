import { useState } from "react";
import { Modal, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import CustomFormulaHelp from "./CustomFormulaHelp";
import styles from "./CustomFormulaHelpModalButton.module.css";
import { AppButton, APP_BUTTON_VARIANTS } from "@/components/ui/button";

export default function CustomFormulaHelpModalButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Custom Operations Help">
        <AppButton
          variant={APP_BUTTON_VARIANTS.TOOLBAR}
          size="small"
          icon={<QuestionCircleOutlined />}
          onClick={() => setOpen(true)}
          aria-label="Open custom operations help"
        />
      </Tooltip>
      <Modal
        title="Custom Operations Help"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width="fit-content"
        className={styles.helpModal}
      >
        <CustomFormulaHelp />
      </Modal>
    </>
  );
}
