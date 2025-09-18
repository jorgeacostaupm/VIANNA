import { useEffect } from "react";
import { notification } from "antd";
import { pubsub } from "./pubsub";

// NOTIFICATION FUNCTIONS

let notificationHandler = null;

function subscribeToNotification(api) {
  if (notificationHandler) return;

  notificationHandler = (data) => {
    api.open({
      message: data.message || "Notification",
      description: (
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            whiteSpace: "pre-line",
          }}
        >
          {data.description || ""}
        </div>
      ),

      type: data.type || "info", // 'info', 'success', 'warning', 'error'
      placement: data.placement || "bottomRight",
      duration:
        data.type === "error" ? null : data.duration ? 3 : data.duration,
      pauseOnHover: data.pauseOnHover || false,
      showProgress: data.pauseOnHover || false,
      style: {
        width: 500,
        maxWidth: "80vw",
        whiteSpace: "pre-line",
      },
    });
  };

  pubsub.subscribe("notification", notificationHandler);
}

function unsubscribeFromNotification() {
  if (notificationHandler) {
    pubsub.unsubscribe("notification", notificationHandler);
    notificationHandler = null;
  }
}

function useNotification() {
  const [api, holder] = notification.useNotification();

  useEffect(() => {
    subscribeToNotification(api);
    return () => unsubscribeFromNotification();
  }, [api]);

  return holder;
}

export default useNotification;
