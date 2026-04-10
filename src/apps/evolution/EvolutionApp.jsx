import { Apps } from "@/utils/Constants";
import registry from "./registry";
import Grid from "@/core/Grid";
import Panel from "./Panel";
import { createEvolutionPanelCommands } from "./panelCommands";

export default function EvolutionApp() {
  const panel = (addView) => {
    const commands = createEvolutionPanelCommands({ addView });
    return <Panel generateEvolution={commands.addEvolution} />;
  };

  return (
    <Grid
      registry={registry}
      componentName={Apps.EVOLUTION}
      panel={panel}
      panelPlacement="left"
    />
  );
}
