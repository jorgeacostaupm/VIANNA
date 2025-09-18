import React, { useState, useEffect } from "react";
import { Popover, Button, Tooltip, Space } from "antd";
import buttonStyles from "@/utils/Buttons.module.css";
import appStyles from "@/utils/App.module.css";

export default function PopoverButton({
  content,
  icon,
  title,
  placement = "bottomRight",
  tooltipDuration = 1500,
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const showTooltip = () => setTooltipVisible(true);

  useEffect(() => {
    let timer;
    if (tooltipVisible) {
      timer = setTimeout(() => setTooltipVisible(false), tooltipDuration);
    }
    return () => clearTimeout(timer);
  }, [tooltipVisible, tooltipDuration]);

  return (
    <Popover
      content={
        <Space
          direction="vertical"
          size="large"
          className={appStyles.popoverMenu}
        >
          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            {content}
          </div>
        </Space>
      }
      trigger="click"
      placement={placement}
      overlayInnerStyle={{
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        borderRadius: 8,
        backgroundColor: "#fff",
        whiteSpace: "pre-line",
      }}
    >
      <Tooltip
        title={title}
        open={tooltipVisible}
        onOpenChange={setTooltipVisible}
        mouseLeaveDelay={0}
      >
        <span onMouseEnter={showTooltip} style={{ display: "inline-block" }}>
          <Button
            shape="circle"
            size="large"
            className={buttonStyles.barButton}
            icon={icon}
          />
        </span>
      </Tooltip>
    </Popover>
  );
}
