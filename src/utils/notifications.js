import { pubsub } from "@/utils/pubsub";

const { publish } = pubsub;

export const extractErrorMessage = (error, fallback = "Unexpected error.") => {
  if (error == null) return fallback;

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof error === "number" || typeof error === "boolean") {
    return String(error);
  }

  if (error instanceof Error) {
    const message = String(error.message || "").trim();
    return message.length > 0 ? message : fallback;
  }

  if (typeof error === "object") {
    const keys = ["description", "message", "error", "msg", "reason"];
    for (const key of keys) {
      const value = error[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  return fallback;
};

const notifyWithType = (type, payload = {}) => {
  publish("notification", {
    ...payload,
    type: payload.type || type,
  });
};

export const notify = (payload = {}) => {
  publish("notification", payload);
};

export const notifyInfo = (payload = {}) => notifyWithType("info", payload);
export const notifySuccess = (payload = {}) =>
  notifyWithType("success", payload);
export const notifyWarning = (payload = {}) =>
  notifyWithType("warning", payload);

export const notifyError = ({
  error,
  description,
  fallback = "Unexpected error.",
  ...payload
} = {}) =>
  notifyWithType("error", {
    ...payload,
    description: description ?? extractErrorMessage(error, fallback),
  });

export const formatListPreview = (items, max = 8, empty = "-") => {
  if (!Array.isArray(items) || items.length === 0) return empty;

  const preview = items.slice(0, max);
  const remaining = items.length - preview.length;

  return remaining > 0
    ? `${preview.join(", ")} (+${remaining} more)`
    : preview.join(", ");
};

export const buildListResultDescription = ({
  successLabel = "Updated",
  successItems = [],
  failureLabel = "Failed",
  failureItems = [],
  maxItems = 8,
} = {}) => {
  return [
    successItems.length > 0
      ? `${successLabel} (${successItems.length}): ${formatListPreview(successItems, maxItems)}`
      : "",
    failureItems.length > 0
      ? `${failureLabel} (${failureItems.length}): ${formatListPreview(failureItems, maxItems)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
};
