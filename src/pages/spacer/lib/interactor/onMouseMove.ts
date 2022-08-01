import { Action, ActionKind } from "../actions";
import { ControlsState } from "../controls";
import { Position, SceneReader } from "../scene";
import { computePosition } from "./utilities";
import { computeEnterAction } from "./onMouseEnter";
import { highestPriorityElement } from "./hittesting";
import { Kind } from "../scene/abstractGeometry";

export const onMouseMove = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  e: Pick<MouseEvent, "offsetX" | "offsetY">
): Action =>
  computeMouseMoveAction(
    currentAction,
    scene,
    controls,
    computePosition(controls, e)
  );

const computeMouseMoveAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  { x, y }: Position
): Action => {
  switch (currentAction.kind) {
    case ActionKind.None:
    case ActionKind.Interacting:
    case ActionKind.PlacingLine:
    case ActionKind.HoveringLine:
    case ActionKind.PlacingIntersection:
    case ActionKind.CreateIntersection:
    case ActionKind.CreateIntersectionAlongLine:
    case ActionKind.CreateIntersectionAtIntersection:
    case ActionKind.CreateLine:
    case ActionKind.PlacingIntersectionAlongLine:
    case ActionKind.PlacingIntersectionAtIntersection:
    case ActionKind.HoveringIntersection: {
      return computeEnterAction(currentAction, scene, controls, { x, y });
    }

    case ActionKind.TouchingLine: {
      return {
        kind: ActionKind.DraggingLine,
        dragged: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.TouchingLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingLineWhileSelecting,
        dragged: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.TouchingSelectedLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingSelectionByLine,
        x,
        y,
      };
    }

    case ActionKind.TouchingSelectedIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingSelectionByPoint,
        x,
        y,
      };
    }

    case ActionKind.TouchingIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingIntersectionWhileSelecting,
        dragged: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.TouchingIntersection: {
      const point = scene.points()[currentAction.hovered.point];

      return {
        kind: ActionKind.DraggingIntersection,
        dragged: {
          ...currentAction.hovered,
          lines: [point.x, point.y],
        },
        x,
        y,
      };
    }

    case ActionKind.DraggingLine:
    case ActionKind.DraggingLineWhileSelecting:
    case ActionKind.DraggingSelectionByLine:
    case ActionKind.DraggingSelectionByPoint:
    case ActionKind.DraggingIntersectionWhileSelecting:
    case ActionKind.DraggingIntersection: {
      return { ...currentAction, x, y };
    }

    case ActionKind.HoveringLineWhileSelecting:
    case ActionKind.HoveringSelectedLineWhileSelecting:
    case ActionKind.HoveringSelectedIntersectionWhileSelecting:
    case ActionKind.HoveringIntersectionWhileSelecting:
    case ActionKind.Selecting: {
      const hit = highestPriorityElement(scene.hit(x, y));
      if (hit != null) {
        switch (hit.kind) {
          case Kind.Line: {
            if (currentAction.selected.lines.includes(hit.id)) {
              return {
                ...currentAction,
                kind: ActionKind.HoveringSelectedLineWhileSelecting,
                hovered: {
                  line: hit.id,
                },
              };
            }

            return {
              ...currentAction,
              kind: ActionKind.HoveringLineWhileSelecting,
              hovered: {
                line: hit.id,
              },
            };
          }

          case Kind.Point: {
            if (currentAction.selected.points.includes(hit.id)) {
              return {
                ...currentAction,
                kind: ActionKind.HoveringSelectedIntersectionWhileSelecting,
                hovered: {
                  point: hit.id,
                },
              };
            }

            return {
              ...currentAction,
              kind: ActionKind.HoveringIntersectionWhileSelecting,
              hovered: {
                point: hit.id,
              },
            };
          }
        }
      }

      return {
        ...currentAction,
        kind: ActionKind.Selecting,
        x,
        y,
      };
    }
  }

  return currentAction;
};
