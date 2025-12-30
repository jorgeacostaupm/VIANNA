import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

const wideCharts = ["ranking", "numeric", "categoric", "evolution"];
const squareCharts = ["scatter", "corr", "pca"];

export default function useGridViews(defaultW = 3, defaultH = 4) {
  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);
  const dfFilename = useSelector((s) => s.dataframe.present.filename);
  const hierFilename = useSelector((s) => s.metadata.filename);

  const addView = useCallback((type, props = {}) => {
    console.log("ADD VIEW:", type);
    const id = `${type}-${Date.now()}`;

    setViews((prev) => [{ id, type, ...props }, ...prev]);

    let x = type === "pointrange" ? 3 : 0;
    let yOffset = type === "pointrange" ? 0 : defaultH;
    let w = defaultW;
    let h = defaultH;
    if (wideCharts.includes(type)) w = 6;
    else if (squareCharts.includes(type)) (w = 8), (h = 8);
    setLayout((prev) => [
      { i: id, x, y: 0, w, h },
      ...prev.map((l) => ({ ...l, y: l.y + yOffset })),
    ]);
  }, []);

  const removeView = useCallback((id) => {
    setViews((p) => p.filter((v) => v.id !== id));
    setLayout((p) => p.filter((l) => l.i !== id));
  }, []);

  useEffect(() => {
    setViews([]);
    setLayout([]);
  }, [dfFilename, hierFilename]);

  return { views, layout, setLayout, addView, removeView };
}
