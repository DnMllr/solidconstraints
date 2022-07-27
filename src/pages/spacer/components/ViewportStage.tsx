import type { ParentComponent } from "solid-js";
import { createContext, useContext, createSignal } from "solid-js";
import { Bounds, createElementBounds } from "@solid-primitives/bounds";

const MeasuredWrapperCtx = createContext<Bounds>();

export const ViewportStage: ParentComponent = (props) => {
  const [target, setTarget] = createSignal<HTMLElement>();
  const bounds = createElementBounds(target);

  return (
    <div class="flex-grow" ref={setTarget}>
      <MeasuredWrapperCtx.Provider value={bounds}>
        {props.children}
      </MeasuredWrapperCtx.Provider>
    </div>
  );
};

export const useViewportBounds = (): Bounds => useContext(MeasuredWrapperCtx);
