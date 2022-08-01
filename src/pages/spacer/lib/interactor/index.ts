import { createSignal } from "solid-js";
import { Action, ActionKind, lookupActionKind } from "../actions";
import { ControlsCtrl } from "../controls";
import { SceneReader } from "../scene";
import { onEscape } from "./onEscapeKey";
import { onMouseDown } from "./onMouseDown";
import { onMouseEnter } from "./onMouseEnter";
import { onMouseLeave } from "./onMouseLeave";
import { onMouseMove } from "./onMouseMove";
import { onMouseUp } from "./onMouseUp";
import { onUIHoverElement } from "./onUIHover";
import { onUIClear } from "./onUIClear";

export interface InteractionCtrl {
  action(): Action;
  debug(): void;
  viewport: ViewportInteractions;
  keyboard: KeyboardInteractions;
  ui: UIInteractions;
}

export interface KeyboardInteractions {
  onEscape(): Action;
}

export interface ViewportInteractions {
  onMouseDown(e: MouseEvent): Action;
  onMouseUp(e: MouseEvent): Action;
  onMouseMove(e: MouseEvent): Action;
  onMouseEnter(e: MouseEvent): Action;
  onMouseLeave(): Action;
}

export interface UIInteractions {
  hoverElement(id: string): Action;
  clear(): Action;
}

export const createInteractor = (
  scene: SceneReader,
  controls: ControlsCtrl
): InteractionCtrl => {
  const [action, setAction] = createSignal<Action>({ kind: ActionKind.None });

  return {
    action,

    debug() {
      const a = action();
      console.log({ ...a, kind: lookupActionKind(a.kind) });
    },

    viewport: {
      onMouseDown() {
        return setAction((a) => onMouseDown(a));
      },

      onMouseUp(e: MouseEvent) {
        return setAction((a) => onMouseUp(a, scene, controls.controls, e));
      },

      onMouseMove(e: MouseEvent) {
        return setAction((a) => onMouseMove(a, scene, controls.controls, e));
      },

      onMouseEnter(e: MouseEvent) {
        return setAction((a) => onMouseEnter(a, scene, controls.controls, e));
      },

      onMouseLeave() {
        return setAction(onMouseLeave);
      },
    },

    keyboard: {
      onEscape() {
        return setAction((a) => onEscape(a, scene, controls.controls));
      },
    },

    ui: {
      hoverElement(id) {
        return setAction((a) => onUIHoverElement(a, id));
      },

      clear() {
        return setAction((a) => onUIClear(a));
      },
    },
  };
};
