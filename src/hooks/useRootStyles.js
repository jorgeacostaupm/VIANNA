import { useEffect, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";

const DEFAULT_ROOT_STYLES = { padding: 0, maxWidth: "100vw" };

const useRootStyles = (
  setInit,
  title,
  applyStyles = DEFAULT_ROOT_STYLES,
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (rootElement && applyStyles) {
      Object.assign(rootElement.style, applyStyles);
    }

    const hash = window.location.hash || "";
    const route = hash.startsWith("#/") ? hash.slice(2).split("/")[0] : "";
    const appRoute = route || "overview";
    window.name = `vianna-app-${appRoute}`;

    if (title) {
      document.title = title;
    }
  }, [applyStyles, title]);

  useLayoutEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(setInit(false));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch, setInit]);
};

export default useRootStyles;
