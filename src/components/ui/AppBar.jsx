import React from "react";
import { Row, Space, Popover, Col } from "antd";
import styles from "@/styles/App.module.css";

export default function AppBar({ description = null, children }) {
  const logo = (
    <img src="/app_name.svg" alt="VANA" className={styles.appBarLogo} />
  );

  return (
    <Row align="middle" wrap={false} className={styles.appBar}>
      <Col flex="none">
        {description ? (
          <Popover
            content={
              <div className={styles.appBarPopoverContent}>{description}</div>
            }
            trigger="hover"
            placement="bottomRight"
          >
            {logo}
          </Popover>
        ) : (
          logo
        )}
      </Col>

      <Col flex="auto" />

      <Col flex="none" className={styles.appBarControls}>
        <Space size="large" align="center">
          {children}
        </Space>
      </Col>
    </Row>
  );
}
