export function createCorrelationPanelCommands({ addView }) {
  return {
    addChart(type) {
      if (!type) return;
      addView(type);
    },
  };
}
