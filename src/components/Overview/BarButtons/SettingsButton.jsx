import React, { useCallback } from "react";
import { Slider, Typography, Space } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { updateConfig } from "@/features/data/dataSlice";
import { SettingOutlined } from "@ant-design/icons";
import PopoverButton from "@/utils/PopoverButton";
import appStyles from "@/utils/App.module.css";

const { Text } = Typography;

function SettingsContent() {
  const config = useSelector((state) => state.dataframe.config);
  const dispatch = useDispatch();

  const handleUpdateConfig = useCallback(
    (field, value) => dispatch(updateConfig({ field, value })),
    [dispatch]
  );
  return (
    <>
      <div>
        <Text strong>Navio Height:</Text>
        <Text type="secondary"> {config.navioHeight}px</Text>
        <Slider
          min={400}
          max={3000}
          step={100}
          defaultValue={config.navioHeight}
          onChangeComplete={(v) => handleUpdateConfig("navioHeight", v)}
        />
      </div>

      <div>
        <Text strong>Attribute Width:</Text>
        <Text type="secondary"> {config.attrWidth}px</Text>
        <Slider
          min={10}
          max={100}
          step={5}
          defaultValue={config.attrWidth}
          onChangeComplete={(v) => handleUpdateConfig("attrWidth", v)}
        />
      </div>

      <div>
        <Text strong>Label Height:</Text>
        <Text type="secondary"> {config.navioLabelHeight}px</Text>
        <Slider
          min={100}
          max={200}
          step={10}
          defaultValue={config.navioLabelHeight}
          onChangeComplete={(v) => handleUpdateConfig("navioLabelHeight", v)}
        />
      </div>
    </>
  );
}

export default function SettingsButton() {
  return (
    <PopoverButton
      content={<SettingsContent></SettingsContent>}
      icon={<SettingOutlined></SettingOutlined>}
      title={"Chart Settings"}
    ></PopoverButton>
  );
}
