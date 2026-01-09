import React from "react";
import {
  SettingOutlined,
  InfoCircleFilled,
  CloseOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import DownloadButton from "./DownloadButton";
import styles from "./ChartBar.module.css";
import BarButton from "./BarButton";
import PopoverButton from "./PopoverButton";
import buttonStyles from "@/utils/Buttons.module.css";

export default function ChartBar({
  settings,
  title,
  svgIDs,
  remove,
  info = "",
  config,
  setConfig,
}) {
  const updateConfig = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={styles.chartBar}>
      <div className={`${styles.dragHandle} drag-handle ${styles.chartTitle}`}>
        {title}
      </div>

      <div className={styles.right}>
        {setConfig && (
          <BarButton
            title={
              config.isSync
                ? "Disable sync with Explorer selection"
                : "Enable sync with Explorer selection"
            }
            icon={<SyncOutlined />}
            onClick={() => updateConfig("isSync", !config.isSync)}
            className={
              config.isSync
                ? buttonStyles.barButton
                : buttonStyles.greyBarButton
            }
          />
        )}
        {svgIDs && <DownloadButton svgIds={svgIDs} filename={`${title}`} />}

        {info && (
          <PopoverButton
            content={info}
            icon={<InfoCircleFilled />}
            title={"Info"}
          />
        )}

        <PopoverButton
          content={settings}
          icon={<SettingOutlined></SettingOutlined>}
          title={"Settings"}
        />
        {remove && (
          <BarButton title="Close" icon={<CloseOutlined />} onClick={remove} />
        )}
      </div>
    </div>
  );
}

export function NodeBar({ title, remove }) {
  return (
    <div className={styles.chartBar}>
      <div className={styles.chartTitle}>{title}</div>

      <div className={styles.right}>
        {remove && (
          <BarButton title="Close" icon={<CloseOutlined />} onClick={remove} />
        )}
      </div>
    </div>
  );
}

export function Bar({ children, title }) {
  return (
    <div className={styles.chartBar}>
      <div className={`${styles.dragHandle} drag-handle ${styles.chartTitle}`}>
        {title}
      </div>

      <div className={styles.right}>{children}</div>
    </div>
  );
}
