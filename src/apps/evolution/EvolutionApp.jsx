import { setInit } from "@/store/slices/evolutionSlice";
import { Apps } from "@/utils/Constants";
import registry from "./registry";
import Grid from "@/core/Grid";
import Panel from "./Panel";

export default function EvolutionApp() {
  const panel = (addView) => (
    <Panel
      generateEvolution={(variable) => addView("evolution", { variable })}
    />
  );

  return (
    <Grid
      setInit={setInit}
      registry={registry}
      componentName={Apps.EVOLUTION}
      panel={panel}
      panelPlacement="left"
      flow="horizontal"
    />
  );
}
