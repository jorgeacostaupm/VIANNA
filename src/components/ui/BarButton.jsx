import AutoCloseTooltip from "./AutoCloseTooltip";
import { AppButton, APP_BUTTON_VARIANTS } from "@/components/ui/button";

export default function BarButton({
  title,
  icon,
  onClick,
  disabled,
  loading = false,
  ariaLabel,
  className,
  type,
  shape,
  size = "small",
  placement = "top",
  variant = APP_BUTTON_VARIANTS.TOOLBAR,
  ...buttonProps
}) {
  return (
    <AutoCloseTooltip title={title} placement={placement}>
      <AppButton
        variant={variant}
        size={size}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        className={className}
        type={type}
        shape={shape}
        aria-label={ariaLabel || title}
        {...buttonProps}
      />
    </AutoCloseTooltip>
  );
}
