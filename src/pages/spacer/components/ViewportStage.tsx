import { ParentComponent } from "solid-js";
import { createContext, useContext } from "solid-js";
import { Bounds, createElementBounds } from "@solid-primitives/bounds";

const MeasuredWrapperCtx = createContext<Bounds>();

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment -- solidjs' compiler takes care of the weird let */
export const ViewportStage: ParentComponent = (props) => {
  let target;
  const bounds = createElementBounds(target);

  return (
    <div class="flex-grow" ref={target}>
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
