import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Typography, Space, Radio, Slider, InputNumber, Switch } from "antd";

import DistributionsPlot from "./DistributionsPlot";
import useResizeObserver from "@/utils/useResizeObserver";
import { getDistributionData } from "@/utils/functions";
import ChartBar from "@/utils/ChartBar";
import styles from "@/utils/Charts.module.css";
import { pubsub } from "@/utils/pubsub";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
const { publish } = pubsub;
const { Text } = Typography;

export default function Distributions({ variable, remove }) {
  const ref = useRef(null);
  const refLegend = useRef(null);
  const dims = useResizeObserver(ref);

  const selection = useSelector((s) => s.cantab.selection);
  const groupVar = useSelector((s) => s.cantab.groupVar);

  const [data, setData] = useState(null);
  const [chart, setChart] = useState(null);
  const [config, setConfig] = useState({
    isSync: true,
    estimator: "density",
    nPoints: 30,
    range: [null, null],
    useCustomRange: false,
    margin: 0.5,
    xForce: 0.05,
    yForce: 1.0,
    collideForce: 0.8,
    alpha: 0.8,
    alphaDecay: 0.2,
    timeout: 500,
    pointSize: 5,
    variable: variable,
  });

  useEffect(() => {
    const dp = new DistributionsPlot(ref.current);
    setChart(dp);
  }, []);

  useEffect(() => {
    if (chart?.data && dims) {
      chart.onResize(dims);
    }
  }, [dims, chart]);

  useEffect(() => {
    if (!config.isSync) return;

    try {
      const res = getDistributionData(selection, variable, groupVar);
      setData(res);
    } catch (error) {
      publish("notification", {
        message: "Error computing data",
        description: error.message,
        placement: "bottomRight",
        type: "error",
      });
      setData(null);
    }
  }, [selection, groupVar, variable, config.isSync]);

  useEffect(() => {
    if (!chart || !variable || !data) return;

    chart.data = data;
    chart.config = config;
    chart.updateVis();
  }, [data, config, chart]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`${variable} Distribution`}
        svgIds={data && ["compare-lines-legend", "compare-distr"]}
        infoTooltip="Distribution plots: density, histogram, swarm"
        remove={remove}
        config={config}
        setConfig={setConfig}
      >
        <Options config={config} setConfig={setConfig} />
      </ChartBar>

      {!data && <NoDataPlaceholder></NoDataPlaceholder>}

      <div
        className={styles.chartLegendContainer}
        style={{ display: data ? "flex" : "none" }}
      >
        <div className={styles.distributionChart}>
          <svg ref={ref} id="compare-distr" className={styles.chartSvg} />
        </div>
        <div className={styles.legend}>
          <svg
            ref={refLegend}
            id="compare-lines-legend"
            className={styles.legendSvg}
          />
        </div>
      </div>
    </div>
  );
}

function Options({ config, setConfig }) {
  const {
    estimator,
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
  } = config;

  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong style={{ fontSize: 16 }}>
          Select graph:
        </Text>
        <Radio.Group
          className="custom-red-radio"
          style={{ marginLeft: 16, color: "red" }}
          optionType="button"
          buttonStyle="solid"
          value={estimator}
          onChange={(e) => update("estimator", e.target.value)}
        >
          <Radio.Button value="density">Density</Radio.Button>
          <Radio.Button value="histogram">Histogram</Radio.Button>
          <Radio.Button value="swarm">Swarm Plot</Radio.Button>
        </Radio.Group>
      </div>

      {estimator !== "swarm" && (
        <>
          <div>
            <Text strong style={{ fontSize: 16 }}>
              Bins:
            </Text>
            <Text type="secondary"> {nPoints}</Text>
            <Slider
              min={1}
              max={250}
              step={1}
              value={nPoints}
              onChange={(v) => update("nPoints", v)}
            />
          </div>
          {estimator === "density" && (
            <>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  Margin:
                </Text>
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

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong style={{ fontSize: 16 }}>
                  Custom X range
                </Text>
                <Switch
                  checked={useCustomRange}
                  onChange={(checked) => update("useCustomRange", checked)}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                X min:
                <InputNumber
                  value={range[0]}
                  onChange={(val) =>
                    update("range", [val ?? range[0], range[1]])
                  }
                />
                X max:
                <InputNumber
                  value={range[1]}
                  onChange={(val) =>
                    update("range", [range[0], val ?? range[1]])
                  }
                />
              </div>
            </>
          )}
        </>
      )}

      {estimator === "swarm" && (
        <>
          <div>
            <Text strong style={{ fontSize: 16 }}>
              Point size:
            </Text>
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
            <Text strong style={{ fontSize: 16 }}>
              X force:
            </Text>
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
            <Text strong style={{ fontSize: 16 }}>
              Y force:
            </Text>
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
            <Text strong style={{ fontSize: 16 }}>
              Collide force:
            </Text>
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
            <Text strong style={{ fontSize: 16 }}>
              Alpha:
            </Text>
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
            <Text strong style={{ fontSize: 16 }}>
              Alpha decay:
            </Text>
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
            <Text strong style={{ fontSize: 16 }}>
              Timeout (ms):
            </Text>
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
    </Space>
  );
}
