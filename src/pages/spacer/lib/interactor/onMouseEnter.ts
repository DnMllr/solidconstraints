import { Action, ActionKind } from "../actions";
import {
  ControlsState,
  isInHorizontalLineMode,
  isInIntersectionMode,
  isInNoneMode,
  isInVerticalLineMode,
} from "../controls";
import { Position, SceneReader } from "../scene";
import { Direction, Kind } from "../scene/abstractGeometry";
import {
  firstHorizontalLine,
  firstPoint,
  firstVerticalLine,
  highestPriorityElement,
  intersectionHits,
} from "./hittesting";
import { computePosition } from "./utilities";

export const onMouseEnter = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  e: Pick<MouseEvent, "offsetX" | "offsetY">
): Action =>
  computeEnterAction(
    currentAction,
    scene,
    controls,
    computePosition(controls, e)
  );

export const computeEnterAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  position: Position
): Action => {
  switch (true) {
    case isInNoneMode(controls):
      return enterInNoneMode(currentAction, scene, position);

    case isInHorizontalLineMode(controls):
      return enterInHorizontalLineMode(currentAction, scene, position);

    case isInVerticalLineMode(controls):
      return enterInVerticalLineMode(currentAction, scene, position);

    case isInIntersectionMode(controls):
      return enterInIntersectionMode(currentAction, scene, position);

    default:
      throw new Error("unknown mode");
  }
};

const enterInNoneMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  const target = highestPriorityElement(scene.hit(x, y));
  if (target) {
    if (currentAction.kind === ActionKind.Selecting) {
      switch (target.kind) {
        case Kind.Point: {
          return {
            ...currentAction,
            kind: ActionKind.HoveringIntersectionWhileSelecting,
            hovered: {
              point: target.id,
            },
          };
        }

        case Kind.Line: {
          return {
            ...currentAction,
            kind: ActionKind.HoveringLineWhileSelecting,
            hovered: {
              line: target.id,
            },
          };
        }
      }
    } else {
      switch (target.kind) {
        case Kind.Point: {
          return {
            kind: ActionKind.HoveringIntersection,
            hovered: {
              point: target.id,
            },
            x,
            y,
          };
        }

        case Kind.Line: {
          return {
            kind: ActionKind.HoveringLine,
            hovered: {
              line: target.id,
            },
            x,
            y,
          };
        }
      }
    }
  } else if (currentAction.kind === ActionKind.Selecting) {
    return { ...currentAction, x, y };
  }

  return { kind: ActionKind.Interacting, x, y };
};

const enterInHorizontalLineMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  const target = firstHorizontalLine(scene.hit(x, y));

  if (currentAction.kind === ActionKind.Selecting) {
    if (target) {
      return {
        ...currentAction,
        kind: ActionKind.HoveringLineWhileSelecting,
        hovered: {
          line: target.id,
        },
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringLine,
      hovered: {
        line: target.id,
      },
      x,
      y,
    };
  }

  return {
    kind: ActionKind.PlacingLine,
    direction: Direction.Horizontal,
    x,
    y,
  };
};

const enterInVerticalLineMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  const target = firstVerticalLine(scene.hit(x, y));

  if (currentAction.kind === ActionKind.Selecting) {
    if (target) {
      return {
        ...currentAction,
        kind: ActionKind.HoveringLineWhileSelecting,
        hovered: {
          line: target.id,
        },
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringLine,
      hovered: {
        line: target.id,
      },
      x,
      y,
    };
  }

  return {
    direction: Direction.Vertical,
    kind: ActionKind.PlacingLine,
    x,
    y,
  };
};

const enterInIntersectionMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  if (currentAction.kind === ActionKind.Selecting) {
    const target = firstPoint(scene.hit(x, y));
    if (target) {
      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        hovered: {
          point: target.id,
        },
      };
    }
    return { ...currentAction, x, y };
  }

  const target = intersectionHits(scene.hit(x, y));

  if (target) {
    if (!Array.isArray(target)) {
      return {
        kind: ActionKind.HoveringIntersection,
        hovered: {
          point: target.id,
        },
        x,
        y,
      };
    } else {
      if (target.length === 1) {
        return {
          kind: ActionKind.PlacingIntersectionAlongLine,
          hovered: {
            line: target[0].id,
          },
          x,
          y,
        };
      }
      return {
        kind: ActionKind.PlacingIntersectionAtIntersection,
        hovered: {
          lines: target.map((t) => t.id),
        },
        x,
        y,
      };
    }
  }

  return {
    x,
    y,
    kind: ActionKind.PlacingIntersection,
  };
};
