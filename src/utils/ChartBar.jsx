import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Tooltip } from "antd";
import {
  SettingOutlined,
  InfoCircleFilled,
  CloseOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import DownloadButton from "./DownloadButton";
import AutoCloseTooltip from "./AutoCloseTooltip";
import styles from "./ChartBar.module.css";
import buttonStyles from "./Buttons.module.css";

export const iconStyle = { fontSize: "25px" };

export default function ChartBar({
  children,
  title,
  svgIds,
  remove,
  infoTooltip = "",
  config,
  setConfig,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const updateConfig = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  /*   useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
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

  return (
    <>
      <div className={styles.chartBar}>
        <div className={`${styles.dragHandle} drag-handle`}></div>

        <div
          className={`${styles.dragHandle} drag-handle ${styles.chartTitle}`}
        >
          {title}
        </div>

        <div className={styles.right}>
          {setConfig && (
            <Tooltip
              title={
                config.isSync
                  ? "Disable sync with Explorer selection"
                  : "Enable sync with Explorer selection"
              }
            >
              <Button
                className={buttonStyles.coloredButton}
                shape="circle"
                icon={<SyncOutlined spin={config.isSync} style={iconStyle} />}
                onClick={() => updateConfig("isSync", !config.isSync)}
              />
            </Tooltip>
          )}
          {svgIds && (
            <DownloadButton
              svgIds={svgIds}
              filename={`${title}_${infoTooltip}`}
            />
          )}

          {infoTooltip && (
            <Tooltip title={infoTooltip}>
              <Button
                className={buttonStyles.coloredButton}
                shape="circle"
                icon={<InfoCircleFilled style={iconStyle} />}
              />
            </Tooltip>
          )}

          <AutoCloseTooltip title="Chart settings">
            <Button
              className={buttonStyles.coloredButton}
              shape="circle"
              icon={<SettingOutlined style={iconStyle} />}
              onClick={() => setIsVisible(!isVisible)}
            />
          </AutoCloseTooltip>

          {remove && (
            <AutoCloseTooltip title="Close view">
              <Button
                className={buttonStyles.coloredButton}
                shape="circle"
                icon={<CloseOutlined style={iconStyle} />}
                onClick={remove}
              />
            </AutoCloseTooltip>
          )}
        </div>
      </div>

      {isVisible && (
        <Card ref={cardRef} size="small" className={styles.options}>
          {children}
        </Card>
      )}
    </>
  );
}

export function NodeBar({ title, remove }) {
  return (
    <div className={styles.chartBar}>
      <div className={styles.chartTitle}>{title}</div>

      <div className={styles.right}>
        {remove && (
          <AutoCloseTooltip title="Close">
            <Button
              className={buttonStyles.coloredButton}
              shape="circle"
              icon={<CloseOutlined style={iconStyle} />}
              onClick={remove}
            />
          </AutoCloseTooltip>
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
