import {
  createEffect,
  ParentComponent,
  createSignal,
  batch,
  onCleanup,
} from "solid-js";

import { useViewportBounds } from "./ViewportStage";
import { SceneCtl } from "../lib/scene";
import { render } from "../lib/renderer";
import { ControlsCtrl } from "../lib/controls";
import * as Interactions from "../lib/interactor";
import { Action, ActionKind } from "../lib/actions";

export interface ViewportProps {
  padding?: number;
  scene: SceneCtl;
  controls: ControlsCtrl;
}

export const Viewport: ParentComponent<ViewportProps> = ({
  scene,
  controls,
}) => {
  const [el, setEl] = createSignal<HTMLCanvasElement>();
  const [action, setAction] = createSignal<Action>({ kind: ActionKind.None });
  const bounds = useViewportBounds();

  createEffect(() => {
    render(scene, action(), el(), bounds.width, bounds.height);
  });

  createEffect(() => {
    scene.applyGrid(controls.controls.grid);
  });

  createEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        batch(() => {
          controls.exitMode();
          setAction((a) => Interactions.onEscape(a, scene, controls.controls));
        });
      }
    };

    document.addEventListener("keyup", listener);
    onCleanup(() => document.removeEventListener("keyup", listener));
  });

  const onMouseDown = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        setAction(Interactions.onMouseDown),
        controls.controls.grid
      );
    });
  };

  const onMouseUp = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        setAction((a) =>
          Interactions.onMouseUp(a, scene, controls.controls, e)
        ),
        controls.controls.grid
      );
    });
  };

  const onMouseEnter = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        setAction((a) =>
          Interactions.onMouseEnter(a, scene, controls.controls, e)
        ),
        controls.controls.grid
      );
    });
  };

  const onMouseLeave = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        setAction(Interactions.onMouseLeave),
        controls.controls.grid
      );
    });
  };

  const onMouseMove = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        setAction((a) =>
          Interactions.onMouseMove(a, scene, controls.controls, e)
        ),
        controls.controls.grid
      );
    });
  };

  return (
    <canvas
      width={bounds.width}
      height={bounds.height}
      ref={setEl}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    />
  );
};
