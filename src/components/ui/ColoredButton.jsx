import AutoCloseTooltip from "./AutoCloseTooltip";
import { AppButton, APP_BUTTON_VARIANTS } from "@/components/ui/button";

export default function ColoredButton({
  title = "",
  icon = null,
  onClick,
  placement,
  disabled = false,
  loading = false,
  children,
  shape = "default",
  variant = APP_BUTTON_VARIANTS.ACTION,
  ...buttonProps
}) {
  return (
    <AutoCloseTooltip title={title} placement={placement}>
      <AppButton
        variant={variant}
        shape={shape}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        {...buttonProps}
      >
        {children}
      </AppButton>
    </AutoCloseTooltip>
  );
}
