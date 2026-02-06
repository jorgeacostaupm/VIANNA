import { Button } from "antd";
import AutoCloseTooltip from "./AutoCloseTooltip";
import buttonStyles from "@/styles/Buttons.module.css";

export default function BarButton({
  title,
  icon,
  onClick,
  disabled,
  className,
  type,
  shape,
  size = "small",
  placement = "top",
}) {
  const classes = [buttonStyles.barButton, className].filter(Boolean).join(" ");

  return (
    <AutoCloseTooltip title={title} placement={placement}>
      <Button
        size={size}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        className={classes}
        type={type}
        shape={shape}
      />
    </AutoCloseTooltip>
  );
}
