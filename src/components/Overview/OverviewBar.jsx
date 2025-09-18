import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Select,
  Typography,
  Tooltip,
  Card,
  Slider,
  Input,
  Button,
  Space,
} from "antd";
import { EditOutlined, SettingOutlined } from "@ant-design/icons";

import { selectNavioVars } from "@/features/cantab/cantabSlice";

import { updateData, updateConfig } from "@/features/data/dataSlice";
import SwitchButton from "./BarButtons/SwitchButton";
import FixButton from "./BarButtons/FixButton";
import ResetButton from "./BarButtons/ResetButton";
import NullQuarantineButton from "./BarButtons/NullQuarantinesButton";
import QuarantineButton from "./BarButtons/QuarantineButton";
import LegendButton from "./BarButtons/LegendButton";

import { generateFileName } from "@/utils/functions";
import { ORDER_VARIABLE } from "@/utils/Constants";
import buttonStyles from "@/utils/Buttons.module.css";
import styles from "@/utils/ChartBar.module.css";
import SettingsButton from "./BarButtons/SettingsButton";
import EditButton from "./BarButtons/EditButton";
import ExportButton from "./BarButtons/ExportButton";

const { Text } = Typography;

export default function OverviewBar({ title }) {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const config = useSelector((state) => state.dataframe.config);

  return (
    <>
      <div className={styles.chartBar}>
        <div className={`${styles.chartTitle}`}>{title}</div>

        <div className={styles.right}>
          <NullQuarantineButton />
          <QuarantineButton />
          <SwitchButton />

          <div className={styles.separator} />

          <FixButton />
          <ResetButton />

          <div className={styles.separator} />

          <LegendButton />
          <EditButton></EditButton>
          <ExportButton></ExportButton>
          <SettingsButton></SettingsButton>
        </div>
      </div>
    </>
  );
}

/* useEffect(() => {
    function handleClickOutside(event) {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    }

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]); */
