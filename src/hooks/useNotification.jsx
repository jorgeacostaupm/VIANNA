import { useEffect } from "react";
import { notification } from "antd";
import { pubsub } from "@/utils/pubsub";

// NOTIFICATION FUNCTIONS

let notificationHandler = null;

const normalizeDescription = (description) => {
  if (description == null) return "";
  if (
    typeof description === "string" ||
    typeof description === "number" ||
    typeof description === "boolean"
  ) {
    return String(description);
  }
  if (description instanceof Error) {
    return description.message || String(description);
  }
  try {
    return JSON.stringify(description, null, 2);
  } catch {
    return String(description);
  }
};

function subscribeToNotification(api) {
  if (notificationHandler) return;

  notificationHandler = (data) => {
    const normalizedDescription = normalizeDescription(data.description);

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
          {normalizedDescription}
        </div>
      ),

      type: data.type || "info", // 'info', 'success', 'warning', 'error'
      placement: data.placement || "bottomRight",
      duration: data.duration ?? (data.type === "error" ? 7 : 3),
      pauseOnHover:
        data.pauseOnHover ??
        (data.source === "test" || data.type === "error"),
      showProgress: data.showProgress ?? data.type === "error",
      style: {
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
