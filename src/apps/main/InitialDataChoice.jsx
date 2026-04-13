import React from "react";
import { Card, Typography } from "antd";
import {
  DatabaseOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

import styles from "./InitialDataChoice.module.css";
import { AppButton } from "@/components/buttons/core";

const { Text } = Typography;

export default function InitialDataChoice({
  isLoadingDemo,
  onLoadDemo,
  onLoadMyData,
  onContinueWithoutData,
}) {
  return (
    <div className={styles.mainLoadDemoData}>
      <Card>
        <div
          direction="vertical"
          size="middle"
          className={styles.initialDataChoiceContent}
        >
          <img
            src="./favicon.svg"
            alt="VIANNA"
            className={styles.initialChoiceLogo}
          />
          <Text strong className={styles.initialChoiceTitle}>
            Welcome to VIANNA
          </Text>
          <Text type="secondary" className={styles.initialChoiceText}>
            Load demo files to explore the app, or upload your own data.
          </Text>

          <div className={styles.initialChoiceButtonsRow}>
            <AppButton
              type="primary"
              icon={<DownloadOutlined />}
              onClick={onLoadDemo}
              loading={isLoadingDemo}
            >
              Load Demo Data
            </AppButton>
            <AppButton
              type="default"
              icon={<DatabaseOutlined />}
              onClick={onLoadMyData}
            >
              Load My Data
            </AppButton>
            <AppButton
              type="default"
              icon={<PlayCircleOutlined />}
              onClick={onContinueWithoutData}
            >
              Continue without data
            </AppButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
