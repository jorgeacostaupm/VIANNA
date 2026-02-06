import { Button } from "antd";
import buttonStyles from "@/styles/Buttons.module.css";
import AutoCloseTooltip from "./AutoCloseTooltip";

export default function PanelButton({ title, icon, onClick, disabled = false }) {
  return (
    <AutoCloseTooltip title={title}>
      <Button
        size="large"
        className={buttonStyles.panelButton}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
      />
    </AutoCloseTooltip>
  );
}
