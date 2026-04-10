import styles from "./AppButton.module.css";

export const APP_BUTTON_VARIANTS = Object.freeze({
  UNSTYLED: "unstyled",
  TOOLBAR: "toolbar",
  TOOLBAR_MUTED: "toolbarMuted",
  PANEL: "panel",
  ACTION: "action",
  BORDERED: "bordered",
  WARNING: "warning",
});

const VARIANT_CLASS_MAP = Object.freeze({
  [APP_BUTTON_VARIANTS.UNSTYLED]: "",
  [APP_BUTTON_VARIANTS.TOOLBAR]: styles.toolbarButton,
  [APP_BUTTON_VARIANTS.TOOLBAR_MUTED]: styles.toolbarButtonMuted,
  [APP_BUTTON_VARIANTS.PANEL]: styles.panelButton,
  [APP_BUTTON_VARIANTS.ACTION]: styles.actionButton,
  [APP_BUTTON_VARIANTS.BORDERED]: styles.borderedButton,
  [APP_BUTTON_VARIANTS.WARNING]: styles.warningButton,
});

export function resolveButtonVariantClassName(variant) {
  return VARIANT_CLASS_MAP[variant] ?? "";
}

export const appButtonStyles = styles;
