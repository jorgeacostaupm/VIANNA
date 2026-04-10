export function createEvolutionPanelCommands({ addView }) {
  return {
    addEvolution(variable) {
      if (!variable) return;
      addView("evolution", { variable });
    },
  };
}
