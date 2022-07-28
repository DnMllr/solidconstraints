import { Position } from "./scene";

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
  PlacingIntersection,
  PlacingIntersectionAtIntersection,
  PlacingIntersectionAlongVerticalLine,
  PlacingIntersectionAlongHorizontalLine,
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

interface HasX {
  x: number;
}

interface HasY {
  y: number;
}

interface VerticalLine<T = string[]> {
  vertical: T;
}

interface HorizontalLine<T = string[]> {
  horizontal: T;
}

interface HasLines<T = Lines> {
  lines: T;
}

interface HasPoints<T = string[]> {
  points: T;
}

type Lines = VerticalLine & HorizontalLine;

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
    HasHovered<HasLines<VerticalLine>>,
    HasCoordinates {}

interface HoveringHorizontalLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringHorizontalLineWhileSelecting>,
    HasHovered<HasLines<HorizontalLine>>,
    HasSelections {}

interface HoveringVerticalLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringVerticalLineWhileSelecting>,
    HasHovered<HasLines<VerticalLine>>,
    HasSelections {}

interface HoveringIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringIntersectionWhileSelecting>,
    HasHovered<HasPoints>,
    HasSelections {}

interface TouchingVerticalLineAction
  extends HasActionKind<ActionKind.TouchingVerticalLine>,
    HasHovered<HasLines<VerticalLine>> {}

interface TouchingHorizontalLineAction
  extends HasActionKind<ActionKind.TouchingHorizontalLine>,
    HasHovered<HasLines<HorizontalLine>> {}

interface HoveringHorizontalLineAction
  extends HasActionKind<ActionKind.HoveringHorizontalLine>,
    HasHovered<HasLines<HorizontalLine>>,
    HasCoordinates {}

interface DraggingVerticalLineAction
  extends HasActionKind<ActionKind.DraggingVerticalLine>,
    HasDragged<HasLines<VerticalLine>>,
    HasX {}

interface DraggingHorizontalLineAction
  extends HasActionKind<ActionKind.DraggingHorizontalLine>,
    HasDragged<HasLines<HorizontalLine>>,
    HasY {}

interface PlacingIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersection>,
    HasCoordinates {}

interface PlacingIntersectionAlongVerticalLineAction
  extends HasActionKind<ActionKind.PlacingIntersectionAlongVerticalLine>,
    HasHovered<HasLines<VerticalLine>>,
    HasCoordinates {}

interface PlacingIntersectionAlongHorizontalLineAction
  extends HasActionKind<ActionKind.PlacingIntersectionAlongHorizontalLine>,
    HasHovered<HasLines<HorizontalLine>>,
    HasCoordinates {}

interface HoveringIntersectionAction
  extends HasActionKind<ActionKind.HoveringIntersection>,
    HasHovered<HasPoints>,
    HasCoordinates {}

interface TouchingIntersectionAction
  extends HasActionKind<ActionKind.TouchingIntersection>,
    HasHovered<HasPoints> {}

interface DraggingIntersectionAction
  extends HasActionKind<ActionKind.DraggingIntersection>,
    HasDragged<HasPoints>,
    HasCoordinates {}

interface CreateHorizontalLineAction
  extends HasActionKind<ActionKind.CreateHorizontalLine>,
    HasY {}

interface CreateVerticalLineAction
  extends HasActionKind<ActionKind.CreateVerticalLine>,
    HasX {}

interface CreateIntersectionAction
  extends HasActionKind<ActionKind.CreateIntersection>,
    HasCoordinates {}

interface PlacingIntersectionAtIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersectionAtIntersection>,
    HasHovered<HasLines<Lines>>,
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
  | TouchingIntersectionAction
  | PlacingIntersectionAction
  | PlacingIntersectionAlongVerticalLineAction
  | PlacingIntersectionAlongHorizontalLineAction
  | PlacingIntersectionAtIntersectionAction
  | HoveringIntersectionAction
  | DraggingIntersectionAction
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

export const lookupActionKind = (action: ActionKind): string => {
  return ActionKind[action];
};
