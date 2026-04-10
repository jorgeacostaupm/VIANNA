import AutoCloseTooltip from "./AutoCloseTooltip";
import { AppButton, APP_BUTTON_VARIANTS } from "@/components/ui/button";

export default function PanelButton({
  title,
  icon,
  onClick,
  disabled = false,
  ariaLabel,
}) {
  return (
    <AutoCloseTooltip title={title}>
      <AppButton
        variant={APP_BUTTON_VARIANTS.PANEL}
        size="large"
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel || title}
      />
    </AutoCloseTooltip>
  );
}
