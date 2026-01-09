import React from "react";
import { Switch, Slider, Typography, Divider } from "antd";

const { Text } = Typography;

export default function Settings({ config, setConfig }) {
  const {
    showObs,
    showMeans,
    showStds,
    showCIs,
    showComplete,
    meanPointSize,
    subjectPointSize,
    meanStrokeWidth,
    subjectStrokeWidth,
  } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show Means</Text>
        <Switch checked={showMeans} onChange={(v) => update("showMeans", v)} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show STDs</Text>
        <Switch checked={showStds} onChange={(v) => update("showStds", v)} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show 95% ICs</Text>
        <Switch checked={showCIs} onChange={(v) => update("showCIs", v)} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show Observations</Text>
        <Switch checked={showObs} onChange={(v) => update("showObs", v)} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Use Complete Subjects</Text>
        <Switch
          checked={showComplete}
          onChange={(v) => update("showComplete", v)}
        />
      </div>

      <Divider></Divider>

      <SliderControl
        label="Mean Point Size"
        value={meanPointSize}
        min={1}
        max={40}
        onChange={(v) => update("meanPointSize", v)}
      />
      <SliderControl
        label="Subject Point Size"
        value={subjectPointSize}
        min={1}
        max={20}
        onChange={(v) => update("subjectPointSize", v)}
      />
      <SliderControl
        label="Mean Stroke Width"
        value={meanStrokeWidth}
        min={1}
        max={30}
        onChange={(v) => update("meanStrokeWidth", v)}
      />
      <SliderControl
        label="Subject Stroke Width"
        value={subjectStrokeWidth}
        min={1}
        max={10}
        onChange={(v) => update("subjectStrokeWidth", v)}
      />
    </>
  );
}

function SliderControl({ label, value, min, max, onChange }) {
  return (
    <div>
      <Text strong>{label}</Text>
      <Text type="secondary" style={{ marginLeft: 8 }}>
        {value}px
      </Text>
      <Slider min={min} max={max} step={1} value={value} onChange={onChange} />
    </div>
  );
}
