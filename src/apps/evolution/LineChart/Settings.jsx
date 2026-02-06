import React from "react";
import { Checkbox, Switch, Slider, Typography, Select } from "antd";
import panelStyles from "@/styles/SettingsPanel.module.css";
import evolutionTests from "@/utils/evolution_tests";

const { Text } = Typography;

export default function Settings({ config, setConfig, availableTimes = [] }) {
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
    showLegend,
    showGrid,
    testIds = [],
    testTimeFrom,
    testTimeTo,
  } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));
  const toggleTest = (testId, checked) => {
    const next = checked
      ? [...new Set([...(testIds || []), testId])]
      : (testIds || []).filter((id) => id !== testId);
    update("testIds", next);
  };

  const timeOptions = availableTimes.map((t) => ({
    label: t,
    value: t,
  }));

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Series</div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Means</Text>
          <Switch checked={showMeans} onChange={(v) => update("showMeans", v)} />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>STDs</Text>
          <Switch checked={showStds} onChange={(v) => update("showStds", v)} />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>95% CIs</Text>
          <Switch checked={showCIs} onChange={(v) => update("showCIs", v)} />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Observations</Text>
          <Switch checked={showObs} onChange={(v) => update("showObs", v)} />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Complete subjects</Text>
          <Switch
            checked={showComplete}
            onChange={(v) => update("showComplete", v)}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Appearance</div>
        <SliderControl
          label="Mean point size"
          value={meanPointSize}
          min={1}
          max={40}
          onChange={(v) => update("meanPointSize", v)}
        />
        <SliderControl
          label="Subject point size"
          value={subjectPointSize}
          min={1}
          max={20}
          onChange={(v) => update("subjectPointSize", v)}
        />
        <SliderControl
          label="Mean stroke width"
          value={meanStrokeWidth}
          min={1}
          max={30}
          onChange={(v) => update("meanStrokeWidth", v)}
        />
        <SliderControl
          label="Subject stroke width"
          value={subjectStrokeWidth}
          min={1}
          max={10}
          onChange={(v) => update("subjectStrokeWidth", v)}
        />
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Tests</div>
        <div className={panelStyles.helper}>
          Select one or more tests to compute for the evolution view.
        </div>
        <div className={panelStyles.optionList}>
          {evolutionTests.map((test) => (
            <div key={test.id} className={panelStyles.optionItem}>
              <Checkbox
                checked={testIds.includes(test.id)}
                onChange={(e) => toggleTest(test.id, e.target.checked)}
              />
              <div className={panelStyles.optionBody}>
                <div className={panelStyles.optionTitle}>{test.label}</div>
                <div className={panelStyles.optionDesc}>
                  {test.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Paired timepoints</Text>
          <Text className={panelStyles.helper}>
            Used by paired tests to compare two time points within each group.
          </Text>
          <div className={panelStyles.inline}>
            <Select
              className={panelStyles.control}
              options={timeOptions}
              placeholder="Time A"
              value={
                availableTimes.includes(testTimeFrom) ? testTimeFrom : undefined
              }
              onChange={(value) => update("testTimeFrom", value)}
              disabled={timeOptions.length < 2}
            />
            <Select
              className={panelStyles.control}
              options={timeOptions}
              placeholder="Time B"
              value={
                availableTimes.includes(testTimeTo) ? testTimeTo : undefined
              }
              onChange={(value) => update("testTimeTo", value)}
              disabled={timeOptions.length < 2}
            />
          </div>
          {availableTimes.length < 2 && (
            <Text className={panelStyles.helper}>
              At least two time points are needed to run paired tests.
            </Text>
          )}
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Guides</div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Legend</Text>
          <Switch
            checked={showLegend}
            onChange={(v) => update("showLegend", v)}
          />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Grid</Text>
          <Switch checked={showGrid} onChange={(v) => update("showGrid", v)} />
        </div>
      </div>
    </div>
  );
}

function SliderControl({ label, value, min, max, onChange }) {
  return (
    <div className={panelStyles.rowStack}>
      <Text className={panelStyles.label}>{label}</Text>
      <Text className={panelStyles.value}>{value}px</Text>
      <Slider min={min} max={max} step={1} value={value} onChange={onChange} />
    </div>
  );
}
