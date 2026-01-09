import React, { useCallback } from "react";
import { Slider, Typography } from "antd";
import { useDispatch } from "react-redux";
import { SettingOutlined } from "@ant-design/icons";
import PopoverButton from "@/utils/PopoverButton";

const { Text } = Typography;

function SettingsContent({ config, updateConfig }) {
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
          step={50}
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

      {/*       <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Button icon={<RedoOutlined />} onClick={handleRedoData} type="default">
          Redo Data
        </Button>
        <Button icon={<UndoOutlined />} onClick={handleUndoData} type="default">
          Undo Data
        </Button>
      </div> */}
    </>
  );
}

export default function SettingsButton({ config, updateConfig }) {
  return (
    <PopoverButton
      content={<SettingsContent config={config} updateConfig={updateConfig} />}
      icon={<SettingOutlined />}
      title={"Settings"}
    />
  );
}
