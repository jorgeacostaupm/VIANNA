import React, { useState, useEffect } from "react";
import { Popover, Tooltip } from "antd";
import { useSelector } from "react-redux";
import styles from "./PopoverButton.module.css";
import { selectShowInformativeTooltips } from "@/store/features/main";
import useAnchoredOverlay from "./useAnchoredOverlay";
import { AppButton, APP_BUTTON_VARIANTS, appButtonStyles } from "@/components/ui/button";

export default function PopoverButton({
  content,
  icon,
  title,
  placement = "bottomRight",
  tooltipDuration = 1500,
  panelWidth,
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const {
    open,
    overlayStyle,
    isFixedOverlay,
    triggerRef,
    handleOpenChange: handleOverlayOpenChange,
  } = useAnchoredOverlay();
  const showInformativeTooltips = useSelector(selectShowInformativeTooltips);
  const hasTooltip = Boolean(title) && showInformativeTooltips;

  const showTooltip = () => {
    if (hasTooltip) {
      setTooltipVisible(true);
    }
  };

  useEffect(() => {
    if (!hasTooltip) {
      setTooltipVisible(false);
    }
  }, [hasTooltip]);

  useEffect(() => {
    let timer;
    if (tooltipVisible) {
      timer = setTimeout(() => setTooltipVisible(false), tooltipDuration);
    }
    return () => clearTimeout(timer);
  }, [tooltipVisible, tooltipDuration]);

  const handleOpenChange = (nextOpen) => {
    handleOverlayOpenChange(nextOpen);
    if (nextOpen) setTooltipVisible(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      arrow={false}
      content={
        <div
          className={styles.panel}
          style={panelWidth ? { width: panelWidth } : undefined}
        >
          <div className={styles.panelBody}>{content}</div>
        </div>
      }
      trigger="click"
      placement={placement}
      overlayClassName={`${styles.popoverOverlay} ${
        isFixedOverlay ? styles.popoverOverlayFixed : ""
      }`}
      overlayStyle={overlayStyle}
      getPopupContainer={() => document.body}
    >
      <Tooltip
        title={hasTooltip ? title : null}
        open={hasTooltip && tooltipVisible && !open}
        onOpenChange={(nextVisible) => {
          if (hasTooltip) {
            setTooltipVisible(nextVisible);
          }
        }}
        mouseLeaveDelay={0}
      >
        <span
          ref={triggerRef}
          onMouseEnter={showTooltip}
          className={styles.tooltipTrigger}
        >
          <AppButton
            variant={APP_BUTTON_VARIANTS.TOOLBAR}
            size="small"
            className={open ? appButtonStyles.toolbarButtonActive : ""}
            icon={icon}
            aria-label={title || "Open menu"}
          />
        </span>
      </Tooltip>
    </Popover>
  );
}
