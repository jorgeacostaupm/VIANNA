import { useDispatch, useSelector } from "react-redux";

import { selectCategoricalVars } from "@/store/features/main";
import { setSelectedVar } from "@/store/features/compare";
import { Apps } from "@/utils/Constants";
import registry from "./registry";
import Grid from "@/core/Grid";
import Panel from "./Panel";
import { createComparePanelCommands } from "./panelCommands";

export default function CompareApp() {
  const dispatch = useDispatch();
  const cVars = useSelector(selectCategoricalVars);

  const panel = (addView) => {
    const commands = createComparePanelCommands({
      addView,
      dispatch,
      categoricalVariables: cVars,
      setSelectedVar,
    });

    return (
      <Panel
        generateDistribution={commands.addDistribution}
        generateTest={commands.runTestForVariable}
        generateRanking={commands.addRanking}
      />
    );
  };

  return (
    <Grid
      registry={registry}
      componentName={Apps.COMPARE}
      panel={panel}
      panelPlacement="left"
    />
  );
}
