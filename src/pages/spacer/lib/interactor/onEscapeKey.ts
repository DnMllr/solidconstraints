import { Action, ActionKind } from "../actions";
import { ControlsState, Mode } from "../controls";
import { SceneReader } from "../scene";
import { computeEnterAction } from "./onMouseEnter";

export const onEscape = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState
): Action => computeEscapeAction(currentAction, scene, controls);

const computeEscapeAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState
): Action => {
  if ("x" in currentAction && "y" in currentAction) {
    return computeEnterAction(
      { kind: ActionKind.None },
      scene,
      {
        ...controls,
        mode: Mode.None,
      },
      currentAction
    );
  }
  return { kind: ActionKind.None };
};
