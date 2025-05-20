import { useEffect } from "react";
import { pubsub } from "@/components/VAPUtils/pubsub";

import {
  subscribeToNotification,
  unsubscribeFromNotification,
} from "@/components/VAPUtils/functions";

const { publish } = pubsub;

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

export const useNotificationSubscription = (api) => {
  useEffect(() => {
    subscribeToNotification(api);
    return () => unsubscribeFromNotification();
  }, [api]);
};
