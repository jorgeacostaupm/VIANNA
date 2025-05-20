import React, { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import navio from "navio";
import {
  setSelection,
  setQuarantineSelection,
} from "@/components/VAPUtils/features/cantab/cantabSlice";

// Disable navio console logs
/* const originalConsoleLog = console.log;
console.log = function () {
  if (typeof arguments[0] == 'string' && !arguments[0].includes('Navio')) {
    originalConsoleLog.apply(console, arguments);
  }
}; */

const Quarantine = () => {
  const holderRef = useRef(null);
  const navioColumnsRef = useRef(null);
  const versionRef = useRef(null);
  const attrWidthRef = useRef(null);

  const navioColumns = useSelector((state) => state.dataframe.navioColumns);
  const version = useSelector((state) => state.dataframe.version);
  const attr_width = useSelector((state) => state.cantab.attr_width);
  const dt = useSelector((state) => state.cantab.quarantineData);
  const dispatch = useDispatch();

  /* const [nv, setNv] = useState(null);
  useEffect(() => {
    const nav = navio(holderRef.current, holderRef.current.getBoundingClientRect().height);
    setNv(nav);
  }, []); */

  function navioCallback(data) {
    const deepCopyData = JSON.parse(JSON.stringify(data));
    dispatch(setQuarantineSelection(deepCopyData));
  }

  function updateNavio() {
    const nv = navio(holderRef.current, window.innerHeight * 0.85);
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
      const navioColumnsChanged =
        JSON.stringify(navioColumnsRef.current) !==
        JSON.stringify(navioColumns);
      const versionChanged = versionRef.current !== version;
      if (navioColumnsChanged || versionChanged) {
        updateNavio();
      }
    }
  }, [navioColumns, dt, attr_width, version]);

  useEffect(() => {
    if (dt) {
      updateNavio();
    }
  }, [dt, attr_width]);

  console.log("RENDERING QUARANTINE VIEW...");

  return <div className="fill" ref={holderRef} />;
  1;
};

export default Quarantine;
