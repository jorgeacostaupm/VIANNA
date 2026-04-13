import React from "react";
import { Typography, Slider, Radio, Switch } from "antd";

import panelStyles from "@/styles/SettingsPanel.module.css";

const { Text } = Typography;

export function MarkerSettings({ markerShape, markerSize, disabled, update }) {
  return (
    <div className={panelStyles.section}>
      <div className={panelStyles.sectionTitle}>Markers</div>
      <div className={panelStyles.controlInlineRow}>
        <Radio.Group
          className={panelStyles.radioGroupCompact}
          disabled={disabled}
          optionType="button"
          buttonStyle="solid"
          value={markerShape}
          size="small"
          onChange={(e) => update("markerShape", e.target.value)}
        >
          <Radio.Button value="circle">Circle</Radio.Button>
          <Radio.Button value="square">Square</Radio.Button>
          <Radio.Button value="diamond">Diamond</Radio.Button>
        </Radio.Group>
      </div>
      <SliderControl
        label="Size"
        valueLabel={`${markerSize}px`}
        min={4}
        max={20}
        step={1}
        value={markerSize}
        disabled={disabled}
        onChange={(v) => update("markerSize", v)}
      />
    </div>
  );
}

export function IntervalSettings({ showCaps, capSize, disabled, update }) {
  return (
    <div className={panelStyles.section}>
      <div className={panelStyles.sectionTitle}>Intervals</div>
      <div className={panelStyles.row}>
        <Text className={panelStyles.label}>Caps</Text>
        <Switch
          size="small"
          checked={showCaps}
          disabled={disabled}
          onChange={(v) => update("showCaps", v)}
        />
      </div>
      <SliderControl
        label="Cap size"
        valueLabel={`${capSize}px`}
        min={0}
        max={20}
        step={1}
        value={capSize}
        disabled={disabled}
        onChange={(v) => update("capSize", v)}
      />
    </div>
  );
}

export function SliderControl({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
}) {
  return (
    <div className={panelStyles.sliderInlineRow}>
      <Text className={panelStyles.label}>{label}</Text>
      <Text className={panelStyles.value}>{valueLabel}</Text>
      <Slider
        className={panelStyles.sliderInlineControl}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}
