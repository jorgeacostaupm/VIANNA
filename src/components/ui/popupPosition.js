const DEFAULT_VIEW_BAR_HEIGHT = 52;
const VIEW_MARGIN = 1;

export function getViewOverlayPosition(triggerNode) {
  if (typeof window === "undefined") return null;

  const viewContainer = triggerNode?.closest?.("[data-view-container]");
  if (!viewContainer) return null;

  const viewRect = viewContainer.getBoundingClientRect();
  const viewBar = viewContainer.querySelector("[data-view-bar]");
  const barBottom = viewBar
    ? viewBar.getBoundingClientRect().bottom
    : viewRect.top + DEFAULT_VIEW_BAR_HEIGHT;

  const top = Math.max(VIEW_MARGIN, Math.round(barBottom + VIEW_MARGIN));
  const right = Math.max(
    VIEW_MARGIN,
    Math.round(window.innerWidth - viewRect.right + VIEW_MARGIN),
  );

  return {
    "--view-overlay-top": `${top}px`,
    "--view-overlay-right": `${right}px`,
  };
}
