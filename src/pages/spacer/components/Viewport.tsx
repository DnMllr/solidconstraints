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
import { InteractionCtrl } from "../lib/interactor";

export interface ViewportProps {
  padding?: number;
  scene: SceneCtl;
  controls: ControlsCtrl;
  interactor: InteractionCtrl;
}

export const Viewport: ParentComponent<ViewportProps> = ({
  scene,
  controls,
  interactor,
}) => {
  const [el, setEl] = createSignal<HTMLCanvasElement>();
  const bounds = useViewportBounds();

  createEffect(() => {
    interactor.debug();
    render(scene, interactor.action(), el(), bounds.width, bounds.height);
  });

  createEffect(() => {
    scene.applyGrid(controls.controls.grid);
  });

  createEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        batch(() => {
          controls.exitMode();
          interactor.keyboard.onEscape();
        });
      }
    };

    document.addEventListener("keyup", listener);
    onCleanup(() => document.removeEventListener("keyup", listener));
  });

  const onMouseDown = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        interactor.viewport.onMouseDown(e),
        controls.controls.grid
      );
    });
  };

  const onMouseUp = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        interactor.viewport.onMouseUp(e),
        controls.controls.grid
      );
    });
  };

  const onMouseEnter = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        interactor.viewport.onMouseEnter(e),
        controls.controls.grid
      );
    });
  };

  const onMouseLeave = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        interactor.viewport.onMouseLeave(),
        controls.controls.grid
      );
    });
  };

  const onMouseMove = (e: MouseEvent) => {
    batch(() => {
      scene.updateWithAction(
        interactor.viewport.onMouseMove(e),
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
