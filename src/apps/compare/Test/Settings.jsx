import React from "react";
import { Typography, Slider, Radio, Switch, Select } from "antd";

import panelStyles from "@/styles/SettingsPanel.module.css";
import AxisLabelSizeControl from "@/components/ui/AxisLabelSizeControl";

const { Text } = Typography;

const sortOptions = [
  { value: "name", label: "Group name" },
  { value: "value", label: "Mean value" },
];

function MarkerSettings({ markerShape, markerSize, disabled, update }) {
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

function IntervalSettings({ showCaps, capSize, disabled, update }) {
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

export function PairwiseSettings({ config, setConfig }) {
  const {
    isSync,
    showCaps,
    capSize,
    markerShape,
    markerSize,
    positiveOnly,
    sortDescending,
    yAxisLabelSpace,
  } = config;

  const disabled = !isSync;
  const update = (field, value) => setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={panelStyles.panel}>
      <MarkerSettings
        markerShape={markerShape}
        markerSize={markerSize}
        disabled={disabled}
        update={update}
      />

      <IntervalSettings
        showCaps={showCaps}
        capSize={capSize}
        disabled={disabled}
        update={update}
      />

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Guides</div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Positive effects only</Text>
          <Switch
            size="small"
            checked={positiveOnly}
            disabled={disabled}
            onChange={(v) => update("positiveOnly", v)}
          />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Sort descending</Text>
          <Switch
            size="small"
            checked={sortDescending}
            disabled={disabled}
            onChange={(v) => update("sortDescending", v)}
          />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Grid lines</Text>
          <Switch size="small" checked disabled />
        </div>
        <SliderControl
          label="Y label space"
          valueLabel={`${Number.isFinite(yAxisLabelSpace) ? yAxisLabelSpace : 160}px`}
          min={100}
          max={320}
          step={5}
          value={Number.isFinite(yAxisLabelSpace) ? yAxisLabelSpace : 160}
          disabled={disabled}
          onChange={(v) => update("yAxisLabelSpace", v)}
        />
        <AxisLabelSizeControl
          config={config}
          setConfig={setConfig}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function PointRangeSettings({ config, setConfig }) {
  const {
    isSync,
    showCaps,
    capSize,
    markerShape,
    markerSize,
    showZeroLine,
    sortBy,
  } = config;

  const disabled = !isSync;
  const update = (field, value) => setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={panelStyles.panel}>
      <MarkerSettings
        markerShape={markerShape}
        markerSize={markerSize}
        disabled={disabled}
        update={update}
      />

      <IntervalSettings
        showCaps={showCaps}
        capSize={capSize}
        disabled={disabled}
        update={update}
      />

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Guides</div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Zero line</Text>
          <Switch
            size="small"
            checked={showZeroLine}
            disabled={disabled}
            onChange={(v) => update("showZeroLine", v)}
          />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Sort by</Text>
          <Select
            size="small"
            value={sortBy}
            onChange={(v) => update("sortBy", v)}
            options={sortOptions}
            disabled={disabled}
          />
        </div>
        <AxisLabelSizeControl
          config={config}
          setConfig={setConfig}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function SliderControl({
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
