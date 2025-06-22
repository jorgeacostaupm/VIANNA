import { useEffect } from "react";

import {
  subscribeToNotification,
  unsubscribeFromNotification,
} from "@/utils/functions";

export const useRootStyle = () => {
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      root.style.padding = "0px 0px";
      root.style.maxWidth = "100vw";
    }
    return () => {
      if (root) {
        root.style.padding = "2rem";
        root.style.maxWidth = "1280px";
      }
    };
  }, []);
};

export const useNotification = (api) => {
  useEffect(() => {
    subscribeToNotification(api);
    return () => unsubscribeFromNotification();
  }, [api]);
};
