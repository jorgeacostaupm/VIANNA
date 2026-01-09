import React from "react";
import { Typography, Radio, Slider, InputNumber, Switch } from "antd";

const { Text } = Typography;

export default function Settings({ config, setConfig }) {
  const {
    chartType,
    nPoints,
    margin,
    range,
    xForce,
    yForce,
    collideForce,
    useCustomRange,
    alpha,
    alphaDecay,
    timeout,
    pointSize,
    showPoints,
  } = config;

  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Text strong>Graph</Text>
      <Radio.Group
        style={{ marginLeft: 16, color: "red" }}
        optionType="button"
        buttonStyle="solid"
        value={chartType}
        onChange={(e) => update("chartType", e.target.value)}
      >
        <Radio.Button value="density">Density</Radio.Button>
        <Radio.Button value="histogram">Histogram</Radio.Button>
        <Radio.Button value="violin">Violins</Radio.Button>
        <Radio.Button value="box">Boxes</Radio.Button>
      </Radio.Group>

      {chartType === "box" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong>Show Observations</Text>
            <Switch
              checked={showPoints}
              onChange={(v) => update("showPoints", v)}
            />
          </div>
          <div>
            <Text strong>Point size:</Text>
            <Text type="secondary"> {pointSize}px</Text>
            <Slider
              min={1}
              max={30}
              step={1}
              value={pointSize}
              onChange={(v) => update("pointSize", v)}
            />
          </div>
        </>
      )}

      {(chartType === "density" || chartType === "histogram") && (
        <>
          <div>
            <Text strong>Bins:</Text>
            <Text type="secondary"> {nPoints}</Text>
            <Slider
              min={1}
              max={250}
              step={1}
              value={nPoints}
              onChange={(v) => update("nPoints", v)}
            />
          </div>
          {chartType === "density" && (
            <>
              <div>
                <Text strong>Margin:</Text>
                <Text type="secondary"> {(margin * 100).toFixed(0)}%</Text>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={margin}
                  onChange={(v) => update("margin", v)}
                  disabled={useCustomRange}
                />
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                <Text strong>Custom X range</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                min:
                <InputNumber
                  value={range[0]}
                  onChange={(val) =>
                    update("range", [val ?? range[0], range[1]])
                  }
                />
                max:
                <InputNumber
                  value={range[1]}
                  onChange={(val) =>
                    update("range", [range[0], val ?? range[1]])
                  }
                />
                <Switch
                  checked={useCustomRange}
                  onChange={(checked) => update("useCustomRange", checked)}
                />
              </div>
            </>
          )}
        </>
      )}

      {chartType === "swarm" && (
        <>
          <div>
            <Text strong>Point size:</Text>
            <Text type="secondary"> {pointSize}px</Text>
            <Slider
              min={1}
              max={30}
              step={1}
              value={pointSize}
              onChange={(v) => update("pointSize", v)}
            />
          </div>

          <div>
            <Text strong>X force:</Text>
            <Text type="secondary"> {xForce.toFixed(2)}</Text>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={xForce}
              onChange={(v) => update("xForce", v)}
            />
          </div>

          <div>
            <Text strong>Y force:</Text>
            <Text type="secondary"> {yForce.toFixed(2)}</Text>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={yForce}
              onChange={(v) => update("yForce", v)}
            />
          </div>

          <div>
            <Text strong>Collide force:</Text>
            <Text type="secondary"> {collideForce.toFixed(2)}</Text>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={collideForce}
              onChange={(v) => update("collideForce", v)}
            />
          </div>

          <div>
            <Text strong>Alpha:</Text>
            <Text type="secondary"> {alpha.toFixed(2)}</Text>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={alpha}
              onChange={(v) => update("alpha", v)}
            />
          </div>

          <div>
            <Text strong>Alpha decay:</Text>
            <Text type="secondary"> {alphaDecay.toFixed(2)}</Text>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={alphaDecay}
              onChange={(v) => update("alphaDecay", v)}
            />
          </div>

          <div>
            <Text strong>Timeout (ms):</Text>
            <Text type="secondary"> {timeout}</Text>
            <Slider
              min={0}
              max={2000}
              step={50}
              value={timeout}
              onChange={(v) => update("timeout", v)}
            />
          </div>
        </>
      )}
    </>
  );
}
