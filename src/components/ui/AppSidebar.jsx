import React, { useState } from "react";
import { Popover } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import styles from "@/styles/App.module.css";

export default function AppSidebar({
  isOpen: controlledIsOpen,
  defaultOpen = true,
  onOpen,
  onClose,
  onOpenChange,
  logoSrc = "./app_name.svg",
  logoAlt = "VIANNA",
  description = null,
  hideAriaLabel = "Hide sidebar",
  showAriaLabel = "Show sidebar",
  children,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setSidebarOpen = (nextIsOpen) => {
    if (!isControlled) {
      setInternalIsOpen(nextIsOpen);
    }

    if (nextIsOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }

    onOpenChange?.(nextIsOpen);
  };

  const handleClose = () => {
    if (!isOpen) return;
    setSidebarOpen(false);
  };

  const handleOpen = () => {
    if (isOpen) return;
    setSidebarOpen(true);
  };

  const mainSidebarClassName = [
    styles.mainSidebar,
    isOpen ? styles.mainSidebarOpen : styles.mainSidebarClosed,
  ].join(" ");

  return (
    <div className={styles.mainSidebarContainer}>
      <aside className={mainSidebarClassName}>
        <Popover
          content={
            <div className={styles.appBarPopoverContent}>{description}</div>
          }
          trigger="hover"
          placement="rightTop"
        >
          <img
            src={logoSrc}
            alt={logoAlt}
            className={`${styles.appBarLogo} ${styles.mainSidebarLogo}`}
          />
        </Popover>

        <div className={styles.mainSidebarControls}>{children}</div>

        <button
          type="button"
          className={styles.mainSidebarHideButton}
          onClick={handleClose}
          aria-label={hideAriaLabel}
        >
          <MenuFoldOutlined />
        </button>
      </aside>

      {!isOpen && (
        <button
          type="button"
          className={styles.mainSidebarShowButton}
          onClick={handleOpen}
          aria-label={showAriaLabel}
        >
          <MenuUnfoldOutlined />
        </button>
      )}
    </div>
  );
}
