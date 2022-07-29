import { createSignal, ParentComponent } from "solid-js";
import { createContext, useContext } from "solid-js";
import { Bounds, createElementBounds } from "@solid-primitives/bounds";

const MeasuredWrapperCtx = createContext<Bounds>();

export const ViewportStage: ParentComponent = (props) => {
  const [target, setTarget] = createSignal<Element>();
  const bounds = createElementBounds(target) as Bounds;

  return (
    <div class="flex-grow" ref={setTarget}>
      <MeasuredWrapperCtx.Provider value={bounds}>
        {props.children}
      </MeasuredWrapperCtx.Provider>
    </div>
  );
};

export const useViewportBounds = (): Bounds => {
  const bounds = useContext(MeasuredWrapperCtx);
  if (!bounds) {
    throw new Error(
      "useViewportBounds must be wrapped in a ViewportStage component"
    );
  }

  return bounds;
};
