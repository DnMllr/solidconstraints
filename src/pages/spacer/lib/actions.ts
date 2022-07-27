import { GeoLine, Geometry, GeoPoint, Position } from "./scene";

export enum ActionKind {
  None,
  Interacting,
  Selecting,
  CreateVerticalLine,
  CreateHorizontalLine,
  CreateIntersection,
  PlacingVerticalLine,
  PlacingHorizontalLine,
  HoveringVerticalLine,
  HoveringVerticalLineWhileSelecting,
  TouchingVerticalLine,
  TouchingHorizontalLine,
  HoveringHorizontalLine,
  HoveringHorizontalLineWhileSelecting,
  DraggingVerticalLine,
  DraggingHorizontalLine,
  SelectingVerticalLine,
  SelectingHorizontalLine,
  PlacingIntersection,
  PlacingIntersectionAlongVerticalLine,
  PlacingIntersectionAlongHorizontalLine,
  HoveringIntersection,
  TouchingIntersection,
  HoveringIntersectionWhileSelecting,
  DraggingIntersection,
  SelectingIntersection,
}

interface HasActionKind<T extends ActionKind> {
  kind: T;
}

interface HasTarget<T extends Geometry> {
  target: T;
}

interface HasSelections {
  selections: Geometry[];
}

interface HasX {
  x: number;
}

interface HasY {
  y: number;
}

interface HasCoordinates extends HasX, HasY {}

interface NonInteractingAction extends HasActionKind<ActionKind.None> {}

interface InteractingAction
  extends HasActionKind<ActionKind.Interacting>,
    HasCoordinates {}

interface SelectingAction
  extends HasActionKind<ActionKind.Selecting>,
    HasSelections,
    HasCoordinates {}

interface PlacingVerticalLineAction
  extends HasActionKind<ActionKind.PlacingVerticalLine>,
    HasCoordinates {}

interface PlacingHorizontalLineAction
  extends HasActionKind<ActionKind.PlacingHorizontalLine>,
    HasCoordinates {}

interface HoveringVerticalLineAction
  extends HasActionKind<ActionKind.HoveringVerticalLine>,
    HasTarget<GeoLine> {}

interface HoveringHorizontalLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringHorizontalLineWhileSelecting>,
    HasTarget<GeoLine>,
    HasSelections {}

interface HoveringVerticalLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringVerticalLineWhileSelecting>,
    HasTarget<GeoLine>,
    HasSelections {}

interface HoveringIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringIntersectionWhileSelecting>,
    HasTarget<GeoPoint>,
    HasSelections {}

interface TouchingVerticalLineAction
  extends HasActionKind<ActionKind.TouchingVerticalLine>,
    HasTarget<GeoLine> {}

interface TouchingHorizontalLineAction
  extends HasActionKind<ActionKind.TouchingHorizontalLine>,
    HasTarget<GeoLine> {}

interface HoveringHorizontalLineAction
  extends HasActionKind<ActionKind.HoveringHorizontalLine>,
    HasTarget<GeoLine> {}

interface DraggingVerticalLineAction
  extends HasActionKind<ActionKind.DraggingVerticalLine>,
    HasTarget<GeoLine> {}

interface DraggingHorizontalLineAction
  extends HasActionKind<ActionKind.DraggingHorizontalLine>,
    HasTarget<GeoLine> {}

interface SelectingVerticalLineAction
  extends HasActionKind<ActionKind.SelectingVerticalLine>,
    HasTarget<GeoLine>,
    HasSelections {}

interface SelectingHorizontalLineAction
  extends HasActionKind<ActionKind.SelectingHorizontalLine>,
    HasTarget<GeoLine>,
    HasSelections {}

interface PlacingIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersection>,
    HasCoordinates {}

interface PlacingIntersectionAlongVerticalLineAction
  extends HasActionKind<ActionKind.PlacingIntersectionAlongVerticalLine>,
    HasTarget<GeoLine>,
    HasCoordinates {}

interface PlacingIntersectionAlongHorizontalLineAction
  extends HasActionKind<ActionKind.PlacingIntersectionAlongHorizontalLine>,
    HasTarget<GeoLine>,
    HasCoordinates {}

interface HoveringIntersectionAction
  extends HasActionKind<ActionKind.HoveringIntersection>,
    HasTarget<GeoPoint> {}

interface TouchingIntersectionAction
  extends HasActionKind<ActionKind.TouchingIntersection>,
    HasTarget<GeoPoint> {}

interface DraggingIntersectionAction
  extends HasActionKind<ActionKind.DraggingIntersection>,
    HasTarget<GeoPoint> {}

interface SelectingIntersectionAction
  extends HasActionKind<ActionKind.SelectingIntersection>,
    HasTarget<GeoPoint>,
    HasSelections {}

interface CreateHorizontalLineAction
  extends HasActionKind<ActionKind.CreateHorizontalLine>,
    HasY {}

interface CreateVerticalLineAction
  extends HasActionKind<ActionKind.CreateVerticalLine>,
    HasX {}

interface CreateIntersectionAction
  extends HasActionKind<ActionKind.CreateIntersection>,
    HasCoordinates {}

export type Action =
  | NonInteractingAction
  | InteractingAction
  | SelectingAction
  | PlacingHorizontalLineAction
  | PlacingVerticalLineAction
  | HoveringVerticalLineAction
  | HoveringHorizontalLineWhileSelectingAction
  | HoveringVerticalLineWhileSelectingAction
  | HoveringIntersectionWhileSelectingAction
  | TouchingVerticalLineAction
  | TouchingHorizontalLineAction
  | HoveringHorizontalLineAction
  | DraggingVerticalLineAction
  | DraggingHorizontalLineAction
  | SelectingVerticalLineAction
  | TouchingIntersectionAction
  | SelectingHorizontalLineAction
  | PlacingIntersectionAction
  | PlacingIntersectionAlongVerticalLineAction
  | PlacingIntersectionAlongHorizontalLineAction
  | HoveringIntersectionAction
  | DraggingIntersectionAction
  | SelectingIntersectionAction
  | CreateHorizontalLineAction
  | CreateVerticalLineAction
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

export const getTarget = (action: Action): Geometry | undefined => {
  if ("target" in action) {
    return action.target;
  }
};

export const lookupActionKind = (action: ActionKind): string => {
  return ActionKind[action];
};
