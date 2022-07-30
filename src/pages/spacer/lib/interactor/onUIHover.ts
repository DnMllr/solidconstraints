import { Action, ActionKind } from "../actions";

export const onUIClear = (currentAction: Action): Action => {
  switch (currentAction.kind) {
    case ActionKind.Selecting:
    case ActionKind.UIHoveringElementWhileSelecting: {
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
