import { resolveViewComponent } from "./viewDefinitions";

export function createViewRenderer(registry, removeView) {
  return function renderView(view) {
    const Comp = resolveViewComponent(registry[view.type]);
    if (!Comp) return null;

    return (
      <div key={view.id}>
        <Comp {...view} remove={() => removeView(view.id)} />
      </div>
    );
  };
}
