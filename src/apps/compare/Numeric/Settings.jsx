import React from "react";
import {
  Typography,
  Radio,
  Slider,
  InputNumber,
  Switch,
} from "antd";
import panelStyles from "@/styles/SettingsPanel.module.css";

const { Text } = Typography;

export default function Settings({ config, setConfig }) {
  const {
    chartType,
    nPoints,
    margin,
    range,
    useCustomRange,
    pointSize,
    showPoints,
    showLegend,
    showGrid,
  } = config;

  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const showBins =
    chartType === "density" ||
    chartType === "histogram" ||
    chartType === "violin";

  const showMargin = chartType === "density" || chartType === "violin";

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>View</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Chart type</Text>
          <Radio.Group
            className={panelStyles.control}
            optionType="button"
            buttonStyle="solid"
            value={chartType}
            onChange={(e) => update("chartType", e.target.value)}
          >
            <Radio.Button value="density">Density</Radio.Button>
            <Radio.Button value="histogram">Histogram</Radio.Button>
            <Radio.Button value="violin">Violins</Radio.Button>
            <Radio.Button value="box">Boxplots</Radio.Button>
          </Radio.Group>
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Legend</Text>
          <Switch
            checked={showLegend}
            onChange={(v) => update("showLegend", v)}
          />
        </div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Grid</Text>
          <Switch
            checked={showGrid}
            onChange={(v) => update("showGrid", v)}
          />
        </div>
      </div>

      {chartType === "box" && (
        <div className={panelStyles.section}>
          <div className={panelStyles.sectionTitle}>Observations</div>
          <div className={panelStyles.row}>
            <Text className={panelStyles.label}>Show points</Text>
            <Switch
              checked={showPoints}
              onChange={(v) => update("showPoints", v)}
            />
          </div>
          <div className={panelStyles.rowStack}>
            <Text className={panelStyles.label}>Point size</Text>
            <Text className={panelStyles.value}>{pointSize}px</Text>
            <Slider
              min={1}
              max={30}
              step={1}
              value={pointSize}
              onChange={(v) => update("pointSize", v)}
            />
          </div>
        </div>
      )}

      {showBins && (
        <div className={panelStyles.section}>
          <div className={panelStyles.sectionTitle}>Distribution</div>
          <div className={panelStyles.rowStack}>
            <Text className={panelStyles.label}>Bins</Text>
            <Text className={panelStyles.value}>{nPoints}</Text>
            <Slider
              min={5}
              max={200}
              step={1}
              value={nPoints}
              onChange={(v) => update("nPoints", v)}
            />
          </div>
          {showMargin && (
            <div className={panelStyles.rowStack}>
              <Text className={panelStyles.label}>Padding</Text>
              <Text className={panelStyles.value}>
                {(margin * 100).toFixed(0)}%
              </Text>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={margin}
                onChange={(v) => update("margin", v)}
                disabled={useCustomRange}
              />
              <Text className={panelStyles.helper}>
                Adds breathing room around the distribution.
              </Text>
            </div>
          )}
        </div>
      )}

      {(chartType === "density" || chartType === "violin") && (
        <div className={panelStyles.section}>
          <div className={panelStyles.sectionTitle}>Range</div>
          <div className={panelStyles.row}>
            <Text className={panelStyles.label}>Custom range</Text>
            <Switch
              checked={useCustomRange}
              onChange={(checked) => update("useCustomRange", checked)}
            />
          </div>
          <div className={panelStyles.inline}>
            <span className={panelStyles.helper}>Min</span>
            <InputNumber
              value={range[0]}
              onChange={(val) =>
                update("range", [val ?? range[0], range[1]])
              }
              disabled={!useCustomRange}
            />
            <span className={panelStyles.helper}>Max</span>
            <InputNumber
              value={range[1]}
              onChange={(val) =>
                update("range", [range[0], val ?? range[1]])
              }
              disabled={!useCustomRange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
