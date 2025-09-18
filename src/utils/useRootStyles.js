import { useEffect, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";

const useRootStyles = (
  setInit,
  title,
  applyStyles = { padding: 0, maxWidth: "100vw" }
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (rootElement && applyStyles) {
      Object.assign(rootElement.style, applyStyles);
    }

    if (title) {
      document.title = title;
    }

    return () => {};
  }, [applyStyles]);

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
