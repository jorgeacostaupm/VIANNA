import { Button } from "antd";
import buttonStyles from "@/utils/Buttons.module.css";
import AutoCloseTooltip from "./AutoCloseTooltip";

export default function BarButton({ title, icon, onClick, disabled }) {
  return (
    <AutoCloseTooltip title={title}>
      <Button
        shape="circle"
        size="large"
        className={buttonStyles.barButton}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
      />
    </AutoCloseTooltip>
  );
}
