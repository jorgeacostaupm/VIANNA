import React, { useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import navio from "navio";

export default function Overview({ data, config, setSelection }) {
  const dispatch = useDispatch();
  const navioRef = useRef(null);

  const columns = useSelector(
    (state) => state.dataframe.navioColumns,
    shallowEqual
  );

  const handleSelection = useCallback(
    (selection) => {
      dispatch(setSelection(JSON.parse(JSON.stringify(selection))));
    },
    [dispatch]
  );

  useEffect(() => {
    console.log("useEffect", data, config, columns, navioRef);
    if (!data) return;

    const nv = navio(navioRef.current, config.navioHeight);
    nv.attribWidth = config.attrWidth;
    nv.y0 = config.navioLabelHeight;
    nv.attribFontSize = 20;
    nv.attribFontSizeSelected = 24;
    nv.filterFontSize = 14;
    nv.tooltipFontSize = 16;
    nv.tooltipBgColor = "#fff";
    nv.margin = 50;
    nv.tooltipMargin = 25;
    nv.data(JSON.parse(JSON.stringify(data)));
    nv.updateCallback(handleSelection);
    nv.addAllAttribs(columns);
  }, [data, config, columns, handleSelection]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div ref={navioRef} style={{ fontSize: 14 }} />
    </div>
  );
}
