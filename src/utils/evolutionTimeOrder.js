export const TimeOrderMode = Object.freeze({
  AUTO: "auto",
  DATE: "date",
  NUMERIC: "numeric",
  TEXT: "text",
});

export const TimeOrderDirection = Object.freeze({
  ASC: "asc",
  DESC: "desc",
});

const TIME_ORDER_MODES = new Set(Object.values(TimeOrderMode));
const TIME_ORDER_DIRECTIONS = new Set(Object.values(TimeOrderDirection));

export const DEFAULT_TIME_ORDER_CONFIG = Object.freeze({
  valueMode: TimeOrderMode.AUTO,
  direction: TimeOrderDirection.ASC,
  useManualOrder: false,
  manualOrder: [],
});

function naturalCompare(a, b) {
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getNumericToken(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = String(value).trim();
  if (!text) return null;

  const direct = Number(text);
  if (Number.isFinite(direct)) return direct;

  const match = text.match(/[-+]?\d+(\.\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function looksLikeDateString(value) {
  return (
    /[-/]/.test(value) ||
    value.includes("T") ||
    /[A-Za-z]{3,}/.test(value)
  );
}

function getDateToken(value) {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }

  const text = String(value).trim();
  if (!text || !looksLikeDateString(text)) return null;

  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function getModeComparator(mode) {
  if (mode === TimeOrderMode.DATE) {
    return (a, b) => {
      const da = getDateToken(a);
      const db = getDateToken(b);
      const aIsDate = da != null;
      const bIsDate = db != null;

      if (aIsDate && bIsDate) return da - db;
      if (aIsDate && !bIsDate) return -1;
      if (!aIsDate && bIsDate) return 1;
      return naturalCompare(a, b);
    };
  }

  if (mode === TimeOrderMode.NUMERIC) {
    return (a, b) => {
      const na = getNumericToken(a);
      const nb = getNumericToken(b);
      const aIsNumeric = na != null;
      const bIsNumeric = nb != null;

      if (aIsNumeric && bIsNumeric) {
        if (na !== nb) return na - nb;
        return naturalCompare(a, b);
      }
      if (aIsNumeric && !bIsNumeric) return -1;
      if (!aIsNumeric && bIsNumeric) return 1;
      return naturalCompare(a, b);
    };
  }

  return naturalCompare;
}

function uniqueLabels(values = []) {
  const seen = new Set();
  const ordered = [];

  values.forEach((value) => {
    const label = String(value);
    if (seen.has(label)) return;
    seen.add(label);
    ordered.push(label);
  });

  return ordered;
}

function sanitizeManualOrder(manualOrder = []) {
  const seen = new Set();
  const ordered = [];

  manualOrder.forEach((value) => {
    const label = String(value);
    if (seen.has(label)) return;
    seen.add(label);
    ordered.push(label);
  });

  return ordered;
}

function applyManualOrder(sortedValues, manualOrder) {
  if (!manualOrder.length) return sortedValues;

  const available = new Set(sortedValues);
  const manual = manualOrder.filter((value) => available.has(value));
  const manualSet = new Set(manual);
  const remaining = sortedValues.filter((value) => !manualSet.has(value));

  return [...manual, ...remaining];
}

export function normalizeTimeOrderConfig(config = null) {
  const base = config || {};
  const valueMode = TIME_ORDER_MODES.has(base.valueMode)
    ? base.valueMode
    : DEFAULT_TIME_ORDER_CONFIG.valueMode;
  const direction = TIME_ORDER_DIRECTIONS.has(base.direction)
    ? base.direction
    : DEFAULT_TIME_ORDER_CONFIG.direction;
  const useManualOrder =
    typeof base.useManualOrder === "boolean"
      ? base.useManualOrder
      : DEFAULT_TIME_ORDER_CONFIG.useManualOrder;
  const manualOrder = Array.isArray(base.manualOrder)
    ? sanitizeManualOrder(base.manualOrder)
    : [];

  return {
    valueMode,
    direction,
    useManualOrder,
    manualOrder,
  };
}

export function detectTimeOrderMode(values = []) {
  const labels = uniqueLabels(values);
  if (!labels.length) return TimeOrderMode.TEXT;

  const allDateLike = labels.every((value) => getDateToken(value) != null);
  if (allDateLike) return TimeOrderMode.DATE;

  const allNumeric = labels.every((value) => getNumericToken(value) != null);
  if (allNumeric) return TimeOrderMode.NUMERIC;

  return TimeOrderMode.TEXT;
}

export function resolveTimeOrderMode(values = [], config = null) {
  const normalized = normalizeTimeOrderConfig(config);
  if (normalized.valueMode !== TimeOrderMode.AUTO) {
    return normalized.valueMode;
  }
  return detectTimeOrderMode(values);
}

export function sortTimeValues(values = [], config = null) {
  const normalized = normalizeTimeOrderConfig(config);
  const labels = uniqueLabels(values);
  const mode = resolveTimeOrderMode(labels, normalized);
  const comparator = getModeComparator(mode);
  const sorted = [...labels].sort(comparator);

  if (normalized.direction === TimeOrderDirection.DESC) {
    sorted.reverse();
  }

  if (!normalized.useManualOrder) {
    return sorted;
  }

  return applyManualOrder(sorted, normalized.manualOrder);
}
