import React, { useEffect, useRef, useState } from "react";
import * as aq from "arquero";
import { Typography, Space, Radio, Slider } from "antd";
import { useSelector } from "react-redux";
import {
  selectNumericVars,
  selectCategoricalVars,
} from "@/features/cantab/cantabSlice";
import useResizeObserver from "@/utils/useResizeObserver";
import RankingPlot from "./RankingPlot";
import ChartBar from "@/utils/ChartBar";
import styles from "@/utils/Charts.module.css";
import { pubsub } from "@/utils/pubsub";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import { computeRankingData } from "@/utils/functions";

const { publish } = pubsub;
const { Text } = Typography;

export default function Ranking({ test, remove }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);

  const groupVar = useSelector((state) => state.cantab.groupVar);
  const selection = useSelector((state) => state.cantab.selection);
  const numericVars = useSelector(selectNumericVars);
  const categoricVars = useSelector(selectCategoricalVars);
  const hierarchy = useSelector((state) => state.metadata.attributes);

  const [ranking, setRanking] = useState(null);
  const [data, setData] = useState(null);
  const [config, setConfig] = useState({
    isSync: true,
    filterList: [],
    nBars: Math.min(numericVars.length, 10),
    pValue: 0.05,
    desc: true,
  });

  useEffect(() => {
    setRanking(new RankingPlot(ref.current));
  }, []);

  useEffect(() => {
    if (ranking?.data && dimensions) {
      ranking.onResize(dimensions);
    }
  }, [dimensions, ranking]);

  useEffect(() => {
    if (!test || !config.isSync) {
      return;
    }

    try {
      const result = computeRankingData({
        test,
        groupVar,
        selection,
        numericVars,
        categoricVars,
        hierarchy,
      });
      setData(result);
    } catch (error) {
      console.error(error);
      publish("notification", {
        message: "Error computing data",
        description: error.message || String(error),
        placement: "bottomRight",
        type: "error",
      });
      setData(null);
    }
  }, [
    selection,
    groupVar,
    numericVars,
    categoricVars,
    test,
    config.isSync,
    hierarchy,
  ]);

  useEffect(() => {
    if (!ranking || !data?.data) return;
    ranking.measure = data.measure;
    ranking.data = data.data;
    ranking.config = config;
    ranking.updateVis();
  }, [data, config, ranking]);

  const info = `Test: ${test}\nRanking measure: ${data?.measure}`;

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`Ranking - ${test}`}
        infoTooltip={info}
        svgIds={data && ["chart"]}
        remove={remove}
        config={config}
        setConfig={setConfig}
      >
        <Options config={config} setConfig={setConfig} />
      </ChartBar>

      {!data && <NoDataPlaceholder></NoDataPlaceholder>}

      <svg
        ref={ref}
        id="chart"
        className={styles.chartSvg}
        style={{ display: data ? "block" : "none" }}
      />
    </div>
  );
}

function Options({ config, setConfig }) {
  const { desc, nBars, pValue } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong style={{ fontSize: "16px" }}>
          Sort Order:
        </Text>
        <Radio.Group
          style={{ marginLeft: 16 }}
          optionType="button"
          buttonStyle="solid"
          value={desc ? "desc" : "asc"}
          onChange={(e) => update("desc", e.target.value === "desc")}
        >
          <Radio.Button value="asc">Ascending</Radio.Button>
          <Radio.Button value="desc">Descending</Radio.Button>
        </Radio.Group>
      </div>

      <div>
        <Text strong style={{ fontSize: "16px" }}>
          P-Value Threshold:
        </Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {pValue.toFixed(2)}
        </Text>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={pValue}
          onChange={(v) => update("pValue", v)}
        />
      </div>

      <div>
        <Text strong style={{ fontSize: "16px" }}>
          Number of Bars:
        </Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {nBars}
        </Text>
        <Slider
          min={1}
          max={50}
          step={1}
          value={nBars}
          onChange={(v) => update("nBars", v)}
        />
      </div>
    </Space>
  );
}
