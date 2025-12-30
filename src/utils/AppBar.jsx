import React, { useRef } from "react";
import { Row, Space, Popover, Col } from "antd";
import styles from "./App.module.css";

export default function AppBar({ description = null, children }) {
  return (
    <Row
      align="middle"
      wrap={false}
      style={{
        background: "var(--primary-color)",
        padding: "0 16px",
        height: 65,
      }}
    >
      {/* Logo fijo */}
      <Col flex="none">
        <Popover
          content={
            <div
              style={{
                maxWidth: 700,
                whiteSpace: "normal",
                wordBreak: "break-word",
                textAlign: "justify",
              }}
            >
              {description}
            </div>
          }
          trigger="hover"
          placement="bottomRight"
        >
          <img src="./app_name.svg" alt="VANA" />
        </Popover>
      </Col>

      <Col flex="auto" />

      <Col
        flex="none"
        style={{
          maxWidth: "70vw",
          height: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          padding: "0px 10px",
        }}
      >
        <Space size="large" align="center">
          {children}
        </Space>
      </Col>
    </Row>
  );
}
