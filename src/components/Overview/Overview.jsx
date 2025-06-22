import React, { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import navio from "navio";
import useResizeObserver from "@/utils/useResizeObserver";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default function Overview({ config, data, setSelection }) {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const navioRef = useRef(null);

  const columns = useSelector(
    (state) => state.dataframe.navioColumns,
    shallowEqual
  );

  const dimensions = useResizeObserver(containerRef);
  const debouncedDimensions = useDebounce(dimensions, 100);

  const handleSelection = useCallback(
    (selection) => {
      dispatch(setSelection(JSON.parse(JSON.stringify(selection))));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!data || !debouncedDimensions) return;

    const nv = navio(navioRef.current, debouncedDimensions.height);
    nv.attribWidth = +config.attrWidth;
    nv.y0 = +config.y0;
    nv.data(JSON.parse(JSON.stringify(data)));
    nv.updateCallback(handleSelection);
    nv.addAllAttribs(columns);
  }, [data, config, columns, debouncedDimensions, handleSelection]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        paddingBottom: "20px",
      }}
    >
      <div ref={navioRef} style={{ overflow: "visible" }} />
    </div>
  );
}
