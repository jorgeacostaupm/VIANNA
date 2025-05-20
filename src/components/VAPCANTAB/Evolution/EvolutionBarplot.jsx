import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DownloadSVG from "@/components/VAPUtils/Download";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";
import { computeEvolutionRankingDataOnWorker } from "@/components/VAPUtils/functions";
import { setSelectedVar } from "@/components/VAPUtils/features/compare/compareSlice";
import { D3EvolutionBarplot } from "./D3EvolutionBarplot";
import { pubsub } from "@/components/VAPUtils/pubsub";
const { publish } = pubsub;

function EvolutionBarplot() {
  const dispatch = useDispatch();
  const refBars = useRef(null);
  const barsDimensions = useResizeObserver(refBars);

  const [bars, setBars] = useState(null);
  const groupVar = useSelector((state) => state.cantab.group_var);
  const timeVar = useSelector((state) => state.cantab.time_var);
  const selection = useSelector((state) => state.cantab.selection);

  const isNumeric = useSelector((state) => state.evolution.isNumeric);
  const filterList = useSelector((state) => state.evolution.filterList);
  const nBars = useSelector((state) => state.evolution.nBars);
  const pValue = useSelector((state) => state.evolution.pValue);
  const desc = useSelector((state) => state.evolution.desc);
  const processingBars = useSelector((state) => state.evolution.loading);

  const result = useSelector((state) => state.evolution.result);

  useEffect(() => {
    setBars(new D3EvolutionBarplot(refBars.current));
  }, []);

  useEffect(() => {
    if (result?.data?.length === 0) {
      let configuration = {
        message: "No relevant data to compare.",
        description: `No Z-score with p-value > ${pValue}.`,
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
    console.log("selection changes", selection);
    computeEvolutionRankingDataOnWorker(
      selection,
      groupVar,
      timeVar,
      isNumeric,
      pValue
    );
  }, [selection, groupVar, timeVar, isNumeric, pValue]);

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
      <div id="description-tooltip"></div>
      <div id="tooltip"></div>
      <DownloadSVG id="evolution-ranking" />
      <svg ref={refBars} id={"evolution-ranking"} className="fill" />
    </div>
  );
}

export default EvolutionBarplot;
