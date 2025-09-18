import { Button } from "antd";
import buttonStyles from "@/utils/Buttons.module.css";
import AutoCloseTooltip from "./AutoCloseTooltip";

export default function PanelButton({ title, icon, onClick }) {
  return (
    <AutoCloseTooltip title={title}>
      <Button
        size="large"
        shape="circle"
        className={buttonStyles.panelButton}
        icon={icon}
        onClick={onClick}
      />
    </AutoCloseTooltip>
  );
}
