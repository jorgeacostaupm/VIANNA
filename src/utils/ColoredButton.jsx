import { Button } from "antd";
import buttonStyles from "@/utils/Buttons.module.css";
import AutoCloseTooltip from "./AutoCloseTooltip";

export default function ColoredButton({ title, icon, onClick, placement }) {
  return (
    <AutoCloseTooltip title={title} placement={placement}>
      <Button
        size="large"
        shape="circle"
        className={buttonStyles.coloredButton}
        icon={icon}
        onClick={onClick}
      />
    </AutoCloseTooltip>
  );
}
