import { Arbitrary, tuple } from "fast-check";
import { Action } from "../actions";
import { arbitraryAction } from "../actions/testing";
import { ControlsState } from "../controls";
import { arbitraryControlState } from "../controls/testing";
import { SceneReader } from "../scene";
import { arbitrarySceneFromAction } from "../scene/testing";

if (import.meta.env.PROD) {
  console.warn("testing file was required in a PROD build");
}

interface FullViewportState {
  scene: SceneReader;
  controls: ControlsState;
  action: Action;
}

export const arbitraryFullViewportState = (): Arbitrary<FullViewportState> =>
  tuple(arbitraryAction(), arbitraryControlState()).chain(
    ([action, controls]) =>
      arbitrarySceneFromAction(action).map((scene) => ({
        action,
        scene,
        controls,
      }))
  );
