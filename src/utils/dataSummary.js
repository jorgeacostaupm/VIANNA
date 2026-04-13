function hasNonEmptyValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function normalizeValue(value) {
  return String(value);
}

export function getDistinctValueCount(rows, column) {
  if (!Array.isArray(rows) || rows.length === 0 || !column) {
    return null;
  }

  const uniqueValues = new Set();
  for (const row of rows) {
    const value = row?.[column];
    if (!hasNonEmptyValue(value)) continue;
    uniqueValues.add(normalizeValue(value));
  }

  return uniqueValues.size;
}
