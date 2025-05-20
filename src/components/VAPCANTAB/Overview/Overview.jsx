import React, { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import navio from "navio";
import { setSelection } from "@/components/VAPUtils/features/cantab/cantabSlice";
import { DEFAULT_ORDER_VARIABLE } from "@/components/VAPCANTAB/Utils/constants/Constants";

// Disable navio console logs
const originalConsoleLog = console.log;
console.log = function () {
  if (
    (typeof arguments[0] === "string" && !arguments[0].includes("Navio")) ||
    typeof arguments[0] !== "string"
  ) {
    originalConsoleLog.apply(console, arguments);
  }
};

const Overview = () => {
  const holderRef = useRef(null);
  const navioColumnsRef = useRef(null);
  const versionRef = useRef(null);
  const attrWidthRef = useRef(null);

  const navioColumns = useSelector((state) => state.dataframe.navioColumns);
  const version = useSelector((state) => state.dataframe.version);
  const attr_width = useSelector((state) => state.cantab.attr_width);
  const dt = useSelector((state) => state.dataframe.dataframe);

  const dispatch = useDispatch();

  /* const [nv, setNv] = useState(null);
  useEffect(() => {
    const nav = navio(holderRef.current, holderRef.current.getBoundingClientRect().height);
    setNv(nav);
  }, []); */

  function navioCallback(data) {
    const deepCopyData = JSON.parse(JSON.stringify(data));
    dispatch(setSelection(deepCopyData));
  }

  function updateNavio() {
    const nv = navio(holderRef.current, window.innerHeight * 0.9);
    const deepCopyDt = JSON.parse(JSON.stringify(dt)); // Navio needs to modifiy the content, and redux uses inmutable objects, so we need a copy
    nv.attribWidth = attr_width;
    nv.data(deepCopyDt);
    nv.addAllAttribs(navioColumns);
    nv.updateCallback(navioCallback);
    navioColumnsRef.current = navioColumns;
    versionRef.current = version;
    attrWidthRef.current = attr_width;
  }

  useEffect(() => {
    if (dt) {
      console.log(
        navioColumnsRef.current,
        navioColumns,
        versionRef.current,
        version
      );
      const navioColumnsChanged =
        JSON.stringify(navioColumnsRef.current) !==
        JSON.stringify(navioColumns);
      const versionChanged = versionRef.current !== version;
      if (navioColumnsChanged || versionChanged) {
        updateNavio();
      }
    }
  }, [navioColumns, version]);

  useEffect(() => {
    if (dt) {
      updateNavio();
    }
  }, [dt, attr_width]);

  return <div ref={holderRef} />;
};

export default Overview;
