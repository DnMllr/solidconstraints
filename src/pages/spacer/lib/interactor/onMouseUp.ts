import { Action, ActionKind } from "../actions";
import { ControlsState } from "../controls";
import { Position, SceneReader } from "../scene";
import { Direction } from "../scene/abstractGeometry";
import { computeEnterAction } from "./onMouseEnter";
import { computePosition } from "./utilities";

export const onMouseUp = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  e: MouseEvent
): Action =>
  computeMouseUpAction(
    currentAction,
    scene,
    controls,
    computePosition(controls, e)
  );

const computeMouseUpAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  { x, y }: Position
): Action => {
  switch (currentAction.kind) {
    case ActionKind.TouchingLine: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedLineWhileSelecting,
        selected: {
          lines: [currentAction.hovered.line],
          points: [],
        },
      };
    }

    case ActionKind.TouchingIntersection: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        selected: {
          lines: [],
          points: [currentAction.hovered.point],
        },
      };
    }

    case ActionKind.TouchingIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedIntersectionWhileSelecting,
        selected: {
          ...currentAction.selected,
          points: [
            ...currentAction.selected.points,
            currentAction.hovered.point,
          ],
        },
      };
    }

    case ActionKind.TouchingLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedLineWhileSelecting,
        selected: {
          ...currentAction.selected,
          lines: [...currentAction.selected.lines, currentAction.hovered.line],
        },
      };
    }

    case ActionKind.TouchingSelectedIntersectionWhileSelecting: {
      if (
        currentAction.selected.lines.length === 0 &&
        currentAction.selected.points.length === 1
      ) {
        return {
          kind: ActionKind.HoveringIntersection,
          hovered: currentAction.hovered,
          x,
          y,
        };
      }

      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        selected: {
          ...currentAction.selected,
          points: currentAction.selected.points.filter(
            (p) => p !== currentAction.hovered.point
          ),
        },
      };
    }

    case ActionKind.TouchingSelectedLineWhileSelecting: {
      if (
        currentAction.selected.lines.length === 1 &&
        currentAction.selected.points.length === 0
      ) {
        return {
          kind: ActionKind.HoveringLine,
          hovered: currentAction.hovered,
          x,
          y,
        };
      }

      return {
        ...currentAction,
        kind: ActionKind.HoveringLineWhileSelecting,
        selected: {
          ...currentAction.selected,
          lines: currentAction.selected.lines.filter(
            (p) => p !== currentAction.hovered.line
          ),
        },
      };
    }

    case ActionKind.PlacingLine: {
      return {
        ...currentAction,
        kind: ActionKind.CreateLine,
        x,
        y,
      };
    }

    case ActionKind.PlacingIntersection: {
      return {
        kind: ActionKind.CreateIntersection,
        x,
        y,
      };
    }

    case ActionKind.PlacingIntersectionAlongLine: {
      return {
        kind: ActionKind.CreateIntersectionAlongLine,
        hovered: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      return {
        kind: ActionKind.CreateIntersectionAtIntersection,
        hovered: {
          ...currentAction.hovered,
        },
      };
    }

    case ActionKind.CreateIntersectionAlongLine:
    case ActionKind.CreateIntersectionAtIntersection:
    case ActionKind.CreateIntersection: {
      return computeEnterAction(currentAction, scene, controls, { x, y });
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      return createCreateIntersectionAction(
        scene,
        { x, y },
        currentAction.hovered.lines
      );
    }

    case ActionKind.DraggingIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        hovered: {
          point: currentAction.dragged.point,
        },
      };
    }

    case ActionKind.DraggingSelectionByPoint: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedIntersectionWhileSelecting,
      };
    }

    case ActionKind.DraggingSelectionByLine: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedLineWhileSelecting,
      };
    }

    case ActionKind.DraggingLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringLineWhileSelecting,
        hovered: {
          line: currentAction.dragged.line,
        },
      };
    }

    case ActionKind.DraggingLine: {
      return {
        kind: ActionKind.HoveringLine,
        hovered: {
          line: currentAction.dragged.line,
        },
        x,
        y,
      };
    }

    case ActionKind.DraggingIntersection: {
      return {
        kind: ActionKind.HoveringIntersection,
        hovered: {
          ...currentAction.dragged,
        },
        x,
        y,
      };
    }
  }

  return currentAction;
};

const createCreateIntersectionAction = (
  scene: SceneReader,
  { x, y }: Position,
  lineIDs: string[]
): Action => {
  const action: Action = { kind: ActionKind.CreateIntersection, x, y };
  const lines = scene.lines();

  for (const lineID of lineIDs) {
    const line = lines[lineID];
    switch (line.direction) {
      case Direction.Horizontal: {
        action.y = line.v;
        break;
      }

      case Direction.Vertical: {
        action.x = line.v;
        break;
      }
    }
  }

  return action;
};
