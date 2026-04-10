import { Apps } from "@/utils/Constants";
import registry from "./registry";
import Grid from "@/core/Grid";
import Panel from "./Panel";
import { createCorrelationPanelCommands } from "./panelCommands";

export default function CorrelationApp() {
  const panel = (addView) => {
    const commands = createCorrelationPanelCommands({ addView });
    return <Panel commands={commands} />;
  };

  return (
    <Grid
      registry={registry}
      componentName={Apps.CORRELATION}
      panel={panel}
      panelPlacement="left"
    />
  );
}
