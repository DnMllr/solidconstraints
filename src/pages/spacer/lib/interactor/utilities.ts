import { ControlsState } from "../controls";
import { Position } from "../scene";

//TODO(Dan) rename to apply grid to event
export const computePosition = (
  controls: ControlsState,
  e: Pick<MouseEvent, "offsetX" | "offsetY">
): Position => {
  let x = e.offsetX;
  let y = e.offsetY;
  if (controls.grid != null) {
    x /= controls.grid.x;
    x = Math.round(x);
    x *= controls.grid.x;

    y /= controls.grid.y;
    y = Math.round(y);
    y *= controls.grid.y;
  }

  return { x, y };
};
