import { Action, ActionKind } from "../actions";

export const onMouseLeave = (currentAction: Action): Action => {
  switch (currentAction.kind) {
    case ActionKind.Selecting:
    case ActionKind.HoveringIntersectionWhileSelecting:
    case ActionKind.HoveringSelectedIntersectionWhileSelecting:
    case ActionKind.HoveringSelectedLineWhileSelecting:
    case ActionKind.DraggingIntersectionWhileSelecting:
    case ActionKind.DraggingSelectionByLine:
    case ActionKind.DraggingSelectionByPoint:
    case ActionKind.DraggingLineWhileSelecting:
    case ActionKind.HoveringLineWhileSelecting: {
      return {
        kind: ActionKind.Selecting,
        selected: {
          ...currentAction.selected,
        },
        x: "x" in currentAction ? currentAction.x : 0,
        y: "y" in currentAction ? currentAction.y : 0,
      };
    }
  }

  return { kind: ActionKind.None };
};
