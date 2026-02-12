import { Button, Select, Slider, Switch, Typography } from "antd";

import panelStyles from "@/styles/SettingsPanel.module.css";

const { Text } = Typography;

const ORIENTATION_OPTIONS = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
];

const LINK_STYLE_OPTIONS = [
  { value: "smooth", label: "Smooth" },
  { value: "elbow", label: "Elbow" },
  { value: "straight", label: "Straight" },
];

export const DEFAULT_HIERARCHY_VIEW_CONFIG = {
  nodeSize: 60,
  depthSpacing: 240,
  nodeScale: 1,
  labelFontSize: 24,
  labelMaxLength: 20,
  linkWidth: 1,
  showLabels: true,
};

const sliderFormatter = (value, suffix = "") => `${value}${suffix}`;

export default function HierarchyViewSettings({
  orientation,
  onOrientationChange,
  linkStyle,
  onLinkStyleChange,
  viewConfig,
  onViewConfigChange,
}) {
  const update = (field, value) =>
    onViewConfigChange?.((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={panelStyles.panel} style={{ width: 400 }}>
      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Layout</div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Orientation</Text>
          <Select
            value={orientation}
            onChange={(value) => onOrientationChange?.(value)}
            options={ORIENTATION_OPTIONS}
          />
        </div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Link style</Text>
          <Select
            value={linkStyle}
            onChange={(value) => onLinkStyleChange?.(value)}
            options={LINK_STYLE_OPTIONS}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Nodes</div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Node size</Text>
          <Text className={panelStyles.value}>
            {sliderFormatter(viewConfig.nodeScale, "x")}
          </Text>
          <Slider
            min={0.6}
            max={1.8}
            step={0.05}
            value={viewConfig.nodeScale}
            onChange={(value) => update("nodeScale", value)}
          />
        </div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Sibling spacing</Text>
          <Text className={panelStyles.value}>
            {sliderFormatter(viewConfig.nodeSize, " px")}
          </Text>
          <Slider
            min={36}
            max={140}
            step={2}
            value={viewConfig.nodeSize}
            onChange={(value) => update("nodeSize", value)}
          />
        </div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Depth spacing</Text>
          <Text className={panelStyles.value}>
            {sliderFormatter(viewConfig.depthSpacing, " px")}
          </Text>
          <Slider
            min={120}
            max={420}
            step={5}
            value={viewConfig.depthSpacing}
            onChange={(value) => update("depthSpacing", value)}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Labels & Links</div>

        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Show labels</Text>
          <Switch
            checked={viewConfig.showLabels}
            onChange={(value) => update("showLabels", value)}
          />
        </div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Label size</Text>
          <Text className={panelStyles.value}>
            {sliderFormatter(viewConfig.labelFontSize, " px")}
          </Text>
          <Slider
            min={12}
            max={40}
            step={1}
            value={viewConfig.labelFontSize}
            onChange={(value) => update("labelFontSize", value)}
            disabled={!viewConfig.showLabels}
          />
        </div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Label max length</Text>
          <Text className={panelStyles.value}>
            {sliderFormatter(viewConfig.labelMaxLength, " chars")}
          </Text>
          <Slider
            min={8}
            max={60}
            step={1}
            value={viewConfig.labelMaxLength}
            onChange={(value) => update("labelMaxLength", value)}
            disabled={!viewConfig.showLabels}
          />
        </div>

        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Link width</Text>
          <Text className={panelStyles.value}>
            {sliderFormatter(viewConfig.linkWidth, " px")}
          </Text>
          <Slider
            min={1}
            max={6}
            step={0.2}
            value={viewConfig.linkWidth}
            onChange={(value) => update("linkWidth", value)}
          />
        </div>
      </div>

      <Button
        onClick={() =>
          onViewConfigChange?.(() => DEFAULT_HIERARCHY_VIEW_CONFIG)
        }
      >
        Restore defaults
      </Button>
    </div>
  );
}
