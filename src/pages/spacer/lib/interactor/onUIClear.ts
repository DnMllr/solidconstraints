import { Action, ActionKind } from "../actions";

export const onUIHoverElement = (
  currentAction: Action,
  target: string
): Action => {
  if (
    currentAction.kind === ActionKind.Selecting ||
    currentAction.kind === ActionKind.UIHoveringElementWhileSelecting
  ) {
    return {
      ...currentAction,
      kind: ActionKind.UIHoveringElementWhileSelecting,
      hovered: target,
    };
  }

  return {
    kind: ActionKind.UIHoveringElement,
    hovered: target,
  };
};
