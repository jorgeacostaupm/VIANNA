import React, { useState, useEffect } from "react";
import { Popover, Button, Tooltip } from "antd";
import styles from "./PopoverButton.module.css";
import chartStyles from "@/styles/Charts.module.css";

export default function PopoverButton({
  content,
  icon,
  title,
  placement = "bottomRight",
  tooltipDuration = 1500,
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [open, setOpen] = useState(false);

  const showTooltip = () => setTooltipVisible(true);

  useEffect(() => {
    let timer;
    if (tooltipVisible) {
      timer = setTimeout(() => setTooltipVisible(false), tooltipDuration);
    }
    return () => clearTimeout(timer);
  }, [tooltipVisible, tooltipDuration]);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) setTooltipVisible(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      arrow={false}
      content={
        <div className={styles.panel}>
          {title && <div className={styles.panelHeader}>{title}</div>}
          <div className={styles.panelBody}>{content}</div>
        </div>
      }
      trigger="click"
      placement={placement}
      overlayClassName={styles.popoverOverlay}
      getPopupContainer={(triggerNode) =>
        triggerNode?.closest?.(`.${chartStyles.viewContainer}`) ||
        document.body
      }
    >
      <Tooltip
        title={title}
        open={Boolean(title) && tooltipVisible && !open}
        onOpenChange={setTooltipVisible}
        mouseLeaveDelay={0}
      >
        <span onMouseEnter={showTooltip} className={styles.tooltipTrigger}>
          <Button
            size="small"
            className={`${styles.menuButton} ${
              open ? styles.menuButtonActive : ""
            }`}
            icon={icon}
            aria-label={title}
          />
        </span>
      </Tooltip>
    </Popover>
  );
}
