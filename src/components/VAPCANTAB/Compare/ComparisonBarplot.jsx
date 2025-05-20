import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DownloadSVG from "@/components/VAPUtils/Download";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";
import { computeCompareRankingDataOnWorkerNEW } from "@/components/VAPUtils/functions";
import { setSelectedVar } from "@/components/VAPUtils/features/compare/compareSlice";
import { D3ComparisonBarplot } from "./D3ComparisonBarplot";
import { Spin } from "antd";
import { pubsub } from "@/components/VAPUtils/pubsub";
const { publish } = pubsub;

function ComparisonBarplot() {
  const dispatch = useDispatch();
  const refBars = useRef(null);
  const barsDimensions = useResizeObserver(refBars);

  const [bars, setBars] = useState(null);
  const groupVar = useSelector((state) => state.cantab.group_var);
  const selection = useSelector((state) => state.cantab.selection);

  const isNumeric = useSelector((state) => state.compare.isNumeric);
  const filterList = useSelector((state) => state.compare.filterList);
  const nBars = useSelector((state) => state.compare.nBars);
  const pValue = useSelector((state) => state.compare.pValue);
  const desc = useSelector((state) => state.compare.desc);
  const loading = useSelector((state) => state.compare.loading);

  const result = useSelector((state) => state.compare.result);

  useEffect(() => {
    setBars(new D3ComparisonBarplot(refBars.current));
  }, []);

  useEffect(() => {
    console.log("USE", result);
    if (result?.data?.length === 0 && bars) {
      let configuration = {
        message: "No relevant data to show.",
        description: `No value with p-value < ${pValue}.`,
        type: "info",
        pauseOnHover: true,
      };
      dispatch(setSelectedVar(null));
      publish("notification", configuration);
    }
  }, [result]);

  useEffect(() => {
    if (bars?.data && barsDimensions) {
      bars.onResize(barsDimensions);
    }
  }, [barsDimensions]);

  useEffect(() => {
    computeCompareRankingDataOnWorkerNEW(
      selection,
      groupVar,
      isNumeric,
      pValue
    );
  }, [selection, groupVar, isNumeric, pValue]);

  useEffect(() => {
    if (bars) {
      bars.data = result.data;
      bars.measure = result.measure;
      bars.desc = desc;
      bars.filterList = filterList;
      bars.nBars = nBars;
      bars.updateVis();
    }
  }, [nBars, desc, filterList, result]);

  return (
    <div className="viewContainer">
      {loading && <Spin style={{ position: "absolute" }} size="large" />}
      <div id="description-tooltip"></div>
      <div id="tooltip"></div>
      <DownloadSVG id="compare-ranking" />
      <svg
        style={{ visibility: loading ? "hidden" : "visible" }}
        ref={refBars}
        id={"compare-ranking"}
        className="fill"
      />
    </div>
  );
}

export default ComparisonBarplot;
