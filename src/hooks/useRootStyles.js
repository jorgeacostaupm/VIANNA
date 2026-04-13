import { useEffect } from "react";

const DEFAULT_ROOT_STYLES = { padding: 0, maxWidth: "100vw" };

const useRootStyles = (title, applyStyles = DEFAULT_ROOT_STYLES) => {
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
};

export default useRootStyles;
