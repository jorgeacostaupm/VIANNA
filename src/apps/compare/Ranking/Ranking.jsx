import React, { useEffect, useRef, useState } from "react";

import { Typography, Radio, Slider, Switch } from "antd";
import { useSelector } from "react-redux";
import {
  selectNumericVars,
  selectCategoricalVars,
} from "@/store/slices/cantabSlice";
import useResizeObserver from "@/hooks/useResizeObserver";
import RankingPlot from "./RankingPlot";
import ChartBar from "@/components/charts/ChartBar";
import styles from "@/styles/Charts.module.css";
import { pubsub } from "@/utils/pubsub";
import NoDataPlaceholder from "@/components/charts/NoDataPlaceholder";
import { computeRankingData } from "@/utils/functions";
import panelStyles from "@/styles/SettingsPanel.module.css";

const { publish } = pubsub;
const { Text } = Typography;

export default function Ranking({ test, remove, id }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);

  const groupVar = useSelector((state) => state.cantab.present.groupVar);
  const selection = useSelector((state) => state.dataframe.present.selection);
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
    showGrid: true,
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
        info={info}
        svgIDs={data && [id]}
        remove={remove}
        config={config}
        setConfig={setConfig}
        settings={<Options config={config} setConfig={setConfig} />}
      ></ChartBar>

      {!data && <NoDataPlaceholder></NoDataPlaceholder>}

      <svg
        ref={ref}
        id={id}
        className={styles.chartSvg}
        style={{ display: data ? "block" : "none" }}
      />
    </div>
  );
}

function Options({ config, setConfig }) {
  const { desc, nBars, pValue, showGrid } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Ordering</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Sort order</Text>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            value={desc ? "desc" : "asc"}
            onChange={(e) => update("desc", e.target.value === "desc")}
          >
            <Radio.Button value="asc">Ascending</Radio.Button>
            <Radio.Button value="desc">Descending</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Filters</div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>P-value threshold</Text>
          <Text className={panelStyles.value}>{pValue.toFixed(2)}</Text>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={pValue}
            onChange={(v) => update("pValue", v)}
          />
        </div>
        <div className={panelStyles.rowStack}>
          <Text className={panelStyles.label}>Number of bars</Text>
          <Text className={panelStyles.value}>{nBars}</Text>
          <Slider
            min={1}
            max={50}
            step={1}
            value={nBars}
            onChange={(v) => update("nBars", v)}
          />
        </div>
      </div>

      <div className={panelStyles.section}>
        <div className={panelStyles.sectionTitle}>Guides</div>
        <div className={panelStyles.row}>
          <Text className={panelStyles.label}>Grid lines</Text>
          <Switch
            checked={showGrid}
            onChange={(v) => update("showGrid", v)}
          />
        </div>
      </div>
    </div>
  );
}
