import React from "react";

const DEFAULT_LAYOUT = Object.freeze({});

export function defineView(component, options = {}) {
  return {
    component,
    layout: options.layout || DEFAULT_LAYOUT,
    meta: options.meta || null,
  };
}

export function normalizeViewRegistry(registry = {}) {
  return Object.entries(registry).reduce((acc, [type, definition]) => {
    if (
      definition &&
      typeof definition === "object" &&
      !React.isValidElement(definition) &&
      Object.prototype.hasOwnProperty.call(definition, "component")
    ) {
      acc[type] = defineView(definition.component, {
        layout: definition.layout,
        meta: definition.meta,
      });
      return acc;
    }

    acc[type] = defineView(definition);
    return acc;
  }, {});
}

export function resolveViewComponent(definition) {
  if (!definition) return null;
  if (
    typeof definition === "object" &&
    Object.prototype.hasOwnProperty.call(definition, "component")
  ) {
    return definition.component;
  }
  return definition;
}

export function resolveViewLayout(definition) {
  if (!definition || typeof definition !== "object") return DEFAULT_LAYOUT;
  return definition.layout || DEFAULT_LAYOUT;
}
