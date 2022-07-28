import { Direction, Position } from "./scene";

export enum ActionKind {
  None,
  Interacting,
  Selecting,
  CreateLine,
  CreateIntersection,
  PlacingLine,
  HoveringLine,
  HoveringLineWhileSelecting,
  TouchingLine,
  DraggingLine,
  PlacingIntersection,
  PlacingIntersectionAtIntersection,
  PlacingIntersectionAlongLine,
  HoveringIntersection,
  TouchingIntersection,
  HoveringIntersectionWhileSelecting,
  DraggingIntersection,
}

interface HasActionKind<T extends ActionKind> {
  kind: T;
}

interface HasSelections<T = HasLines & HasPoints> {
  selected: T;
}

interface HasHovered<T> {
  hovered: T;
}

interface HasDragged<T> {
  dragged: T;
}

interface HasDirection {
  direction: Direction;
}

interface HasX {
  x: number;
}

interface HasY {
  y: number;
}

interface HasLines {
  lines: string[];
}

interface HasLine {
  line: string;
}

interface HasPoints {
  points: string[];
}

interface HasPoint {
  point: string;
}

type HasCoordinates = HasX & HasY;

interface NonInteractingAction extends HasActionKind<ActionKind.None> {}

interface InteractingAction
  extends HasActionKind<ActionKind.Interacting>,
    HasCoordinates {}

interface SelectingAction
  extends HasActionKind<ActionKind.Selecting>,
    HasSelections,
    HasCoordinates {}

interface PlacingLineAction
  extends HasActionKind<ActionKind.PlacingLine>,
    HasDirection,
    HasCoordinates {}

interface HoveringLineAction
  extends HasActionKind<ActionKind.HoveringLine>,
    HasHovered<HasLine>,
    HasCoordinates {}

interface HoveringLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

interface HoveringIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

interface TouchingLineAction
  extends HasActionKind<ActionKind.TouchingLine>,
    HasHovered<HasLine> {}

interface DraggingLineAction
  extends HasActionKind<ActionKind.DraggingLine>,
    HasDragged<HasLine>,
    HasCoordinates {}

interface PlacingIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersection>,
    HasCoordinates {}

interface PlacingIntersectionAlongLineAction
  extends HasActionKind<ActionKind.PlacingIntersectionAlongLine>,
    HasHovered<HasLine>,
    HasCoordinates {}

interface HoveringIntersectionAction
  extends HasActionKind<ActionKind.HoveringIntersection>,
    HasHovered<HasPoint>,
    HasCoordinates {}

interface TouchingIntersectionAction
  extends HasActionKind<ActionKind.TouchingIntersection>,
    HasHovered<HasPoint> {}

interface DraggingIntersectionAction
  extends HasActionKind<ActionKind.DraggingIntersection>,
    HasDragged<HasPoint & HasLines>,
    HasCoordinates {}

interface CreateLineAction
  extends HasActionKind<ActionKind.CreateLine>,
    HasDirection,
    HasCoordinates {}

interface CreateIntersectionAction
  extends HasActionKind<ActionKind.CreateIntersection>,
    HasCoordinates {}

interface PlacingIntersectionAtIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersectionAtIntersection>,
    HasHovered<HasLines>,
    HasCoordinates {}

export type Action =
  | NonInteractingAction
  | InteractingAction
  | SelectingAction
  | CreateLineAction
  | HoveringLineWhileSelectingAction
  | HoveringIntersectionWhileSelectingAction
  | TouchingLineAction
  | HoveringLineAction
  | TouchingIntersectionAction
  | PlacingLineAction
  | PlacingIntersectionAction
  | PlacingIntersectionAlongLineAction
  | PlacingIntersectionAtIntersectionAction
  | HoveringIntersectionAction
  | DraggingLineAction
  | DraggingIntersectionAction
  | CreateIntersectionAction;

export const getXPosition = (action: Action): number | undefined => {
  if ("x" in action) {
    return action.x;
  }
};

export const getYPosition = (action: Action): number | undefined => {
  if ("y" in action) {
    return action.y;
  }
};

export const getPosition = (action: Action): Position | undefined => {
  const x = getXPosition(action);
  const y = getYPosition(action);
  if (x != null && y != null) {
    return { x, y };
  }
};

export const lookupActionKind = (action: ActionKind): string => {
  return ActionKind[action];
};
