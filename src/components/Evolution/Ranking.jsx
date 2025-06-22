import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Slider } from "antd";

import { selectNumericVars } from "@/features/cantab/cantabSlice";
import {
  setDesc,
  setNBars,
  setPValue,
  setFilteringList,
} from "@/features/evolution/evolutionSlice";

import RankingPlot from "./RankingPlot";
import ChartBar from "@/utils/ChartBar";
import useResizeObserver from "@/utils/useResizeObserver";
import styles from "@/utils//Charts.module.css";
import tests from "@/utils/evolution_tests";

export default function Ranking({ test, remove }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);

  const groupVar = useSelector((state) => state.cantab.groupVar);
  const timeVar = useSelector((state) => state.cantab.timeVar);
  const selection = useSelector((state) => state.cantab.selection);
  const variables = useSelector(selectNumericVars);

  const filterList = useSelector((state) => state.evolution.filterList);
  const nBars = useSelector((state) => state.evolution.nBars);
  const pValue = useSelector((state) => state.evolution.pValue);
  const desc = useSelector((state) => state.evolution.desc);

  const [ranking, setRanking] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setRanking(new RankingPlot(ref.current));
  }, []);

  useEffect(() => {
    if (ranking?.data && dimensions) {
      ranking.onResize(dimensions);
    }
  }, [dimensions]);

  useEffect(() => {
    if (test) {
      const testObj = tests[0];
      const data = [];

      for (const variable of variables) {
        const id = "id";
        const res = testObj.run(selection, groupVar, timeVar, id, variable);
        data.push({
          variable,
          value: res.metric.value,
          ...res,
        });
      }

      setResult({ data: data, measure: testObj.metric.symbol });
    }
  }, [selection, groupVar, timeVar, variables, test]);

  useEffect(() => {
    if (ranking) {
      ranking.data = result.data;
      ranking.measure = result.measure;
      ranking.desc = desc;
      ranking.filterList = filterList;
      ranking.nBars = nBars;
      ranking.updateVis();
    }
  }, [nBars, desc, filterList, result]);

  return (
    <>
      <div className={styles.viewContainer}>
        <ChartBar
          title={`Ranking - Z-score test`}
          infoTooltip={""}
          svgIds={["evolution-ranking"]}
          remove={remove}
        >
          <Options></Options>
        </ChartBar>
        <svg ref={ref} id={"evolution-ranking"} className="fill" />
      </div>
    </>
  );
}

const Options = () => {
  const n_bars = useSelector((state) => state.evolution.nBars);
  const p_value = useSelector((state) => state.evolution.pValue);
  const asc = useSelector((state) => state.evolution.desc);

  const dispatch = useDispatch();

  const onChangeIsNumericCheckbox1 = (e) => {
    dispatch(setIsNumeric(!e.target.checked));
    dispatch(setFilteringList([]));
  };

  const onChangeAscCheckbox = (e) => {
    dispatch(setDesc(e.target.checked));
  };

  const onChangeNBarsSliderComplete = (value) => {
    dispatch(setNBars(value));
  };

  const onChangePValue = (value) => {
    dispatch(setPValue(value));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
        }}
      >
        <Checkbox
          style={{ fontSize: "16px" }}
          checked={asc}
          onChange={onChangeAscCheckbox}
        >
          Asc. Order
        </Checkbox>
      </div>
      <div style={{ fontSize: "16px" }}>Nº Bars:</div>

      <Slider
        min={0}
        max={100}
        defaultValue={n_bars}
        onChangeComplete={onChangeNBarsSliderComplete}
        step={1}
        style={{ width: "100%" }}
      />

      <div style={{ margin: "5px", fontSize: "16px" }}>P-Value:</div>
      <Slider
        min={0.01}
        max={1}
        defaultValue={p_value}
        onChangeComplete={onChangePValue}
        step={0.01}
        style={{ width: "100%" }}
      />

      {/* <FilteredVariables></FilteredVariables> */}
    </div>
  );
};
