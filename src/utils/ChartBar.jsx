import React from "react";
import {
  SettingOutlined,
  InfoCircleFilled,
  CloseOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { ConfigProvider } from "antd";
import DownloadButton from "./DownloadButton";
import styles from "./ChartBar.module.css";
import BarButton from "./BarButton";
import PopoverButton from "./PopoverButton";

export default function ChartBar({
  children,
  title,
  svgIds,
  remove,
  infoTooltip = "",
  config,
  setConfig,
}) {
  const updateConfig = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <ConfigProvider theme={{ token: { fontSize: 20 } }}>
      <div className={styles.chartBar}>
        <div className={`${styles.dragHandle} drag-handle`}></div>

        <div
          className={`${styles.dragHandle} drag-handle ${styles.chartTitle}`}
        >
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
              icon={<SyncOutlined spin={config.isSync} />}
              onClick={() => updateConfig("isSync", !config.isSync)}
            />
          )}
          {svgIds && (
            <DownloadButton
              svgIds={svgIds}
              filename={`${title}_${infoTooltip}`}
            />
          )}

          {infoTooltip && (
            <PopoverButton
              content={infoTooltip}
              icon={<InfoCircleFilled />}
              title={"Chart Information"}
            />
          )}

          <PopoverButton
            content={children}
            icon={<SettingOutlined></SettingOutlined>}
            title={"Chart Settings"}
          />
          {remove && (
            <BarButton
              title="Close view"
              icon={<CloseOutlined />}
              onClick={remove}
            />
          )}
        </div>
      </div>
    </ConfigProvider>
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

export function Bar({ children, title, drag = true }) {
  return (
    <div className={styles.chartBar}>
      {drag && <div className={`${styles.dragHandle} drag-handle`}></div>}

      <div
        className={
          drag
            ? `${styles.chartTitle} ${styles.dragHandle} drag-handle`
            : `${styles.chartTitle}`
        }
      >
        {title}
      </div>

      <div className={styles.right}>{children}</div>
    </div>
  );
}

/*   useEffect(() => {
    function handleClickOutside(event) {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    }

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]); */
