export function createComparePanelCommands({
  addView,
  dispatch,
  categoricalVariables = [],
  setSelectedVar,
}) {
  const runTestForVariable = (test, variable) => {
    if (!test || !variable) return;

    dispatch(setSelectedVar(variable));

    const isCategorical = categoricalVariables.includes(variable);
    addView("pairwise", { test, variable });
    if (!isCategorical) {
      addView("pointrange", { test, variable });
    }
  };

  return {
    addDistribution(variable) {
      if (!variable) return;
      const type = categoricalVariables.includes(variable)
        ? "categoric"
        : "numeric";
      addView(type, { variable });
    },

    runTestForVariable,

    addRanking(test) {
      if (!test) return;
      addView("ranking", {
        test,
        onVariableClick: (variable) => runTestForVariable(test, variable),
      });
    },
  };
}
