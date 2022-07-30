import { Action, ActionKind } from "../actions";

export const onMouseDown = (currentAction: Action): Action =>
  computeMouseDownAction(currentAction);

const computeMouseDownAction = (currentAction: Action): Action => {
  switch (currentAction.kind) {
    case ActionKind.HoveringLine: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingLine,
      };
    }

    case ActionKind.HoveringLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingLineWhileSelecting,
      };
    }

    case ActionKind.HoveringSelectedLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingSelectedLineWhileSelecting,
      };
    }

    case ActionKind.HoveringIntersection: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingIntersection,
      };
    }

    case ActionKind.HoveringIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingIntersectionWhileSelecting,
      };
    }

    case ActionKind.HoveringSelectedIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingSelectedIntersectionWhileSelecting,
      };
    }
  }

  return currentAction;
};
