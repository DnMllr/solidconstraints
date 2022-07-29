import { Direction, Position } from "./scene";

export enum ActionKind {
  None,
  Interacting,
  Selecting,
  CreateLine,
  CreateIntersection,
  CreateIntersectionAlongLine,
  CreateIntersectionAtIntersection,
  PlacingLine,
  HoveringLine,
  HoveringLineWhileSelecting,
  HoveringSelectedLineWhileSelecting,
  HoveringSelectedIntersectionWhileSelecting,
  TouchingLine,
  TouchingLineWhileSelecting,
  TouchingSelectedLineWhileSelecting,
  DraggingLine,
  DraggingLineWhileSelecting,
  DraggingIntersectionWhileSelecting,
  PlacingIntersection,
  PlacingIntersectionAtIntersection,
  PlacingIntersectionAlongLine,
  HoveringIntersection,
  TouchingIntersection,
  TouchingIntersectionWhileSelecting,
  TouchingSelectedIntersectionWhileSelecting,
  HoveringIntersectionWhileSelecting,
  DraggingIntersection,
  DraggingSelectionByPoint,
  DraggingSelectionByLine,

  UIHoveringElement,
  UIHoveringElementWhileSelecting,
  UIPlacingSegmentWhileSelecting,
}

interface HasActionKind<T extends ActionKind> {
  kind: T;
}

export interface HasSelections {
  selected: HasLines & HasPoints;
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

interface HoveringSelectedLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringSelectedLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

interface HoveringIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

interface HoveringSelectedIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringSelectedIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

interface TouchingLineAction
  extends HasActionKind<ActionKind.TouchingLine>,
    HasHovered<HasLine> {}

interface TouchingLineWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

interface DraggingLineAction
  extends HasActionKind<ActionKind.DraggingLine>,
    HasDragged<HasLine>,
    HasCoordinates {}

interface DraggingLineWhileSelectingAction
  extends HasActionKind<ActionKind.DraggingLineWhileSelecting>,
    HasDragged<HasLine>,
    HasSelections,
    HasCoordinates {}

interface DraggingIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.DraggingIntersectionWhileSelecting>,
    HasDragged<HasPoint>,
    HasSelections,
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

interface CreateIntersectionAlongLineAction
  extends HasActionKind<ActionKind.CreateIntersectionAlongLine>,
    HasHovered<HasLine>,
    HasCoordinates {}

interface CreateIntersectionAlongIntersectionAction
  extends HasActionKind<ActionKind.CreateIntersectionAtIntersection>,
    HasHovered<HasLines> {}

interface PlacingIntersectionAtIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersectionAtIntersection>,
    HasHovered<HasLines>,
    HasCoordinates {}

interface TouchingSelectedIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingSelectedIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

interface TouchingIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

interface TouchingSelectedLineWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingSelectedLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

interface TouchingLineWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

interface DraggingSelectionByLineAction
  extends HasActionKind<ActionKind.DraggingSelectionByLine>,
    HasSelections,
    HasHovered<HasLine>,
    HasCoordinates {}

interface DraggingSelectionByPointAction
  extends HasActionKind<ActionKind.DraggingSelectionByPoint>,
    HasSelections,
    HasHovered<HasPoint>,
    HasCoordinates {}

interface UIHoveringElementAction
  extends HasActionKind<ActionKind.UIHoveringElement>,
    HasHovered<string> {}

interface UIHoveringElementWhileSelectingAction
  extends HasActionKind<ActionKind.UIHoveringElementWhileSelecting>,
    HasHovered<string>,
    HasSelections {}

export type Action =
  | NonInteractingAction
  | InteractingAction
  | SelectingAction
  | CreateLineAction
  | CreateIntersectionAlongLineAction
  | CreateIntersectionAlongIntersectionAction
  | HoveringLineWhileSelectingAction
  | HoveringSelectedIntersectionWhileSelectingAction
  | HoveringSelectedLineWhileSelectingAction
  | HoveringIntersectionWhileSelectingAction
  | TouchingLineAction
  | TouchingLineWhileSelectingAction
  | TouchingIntersectionWhileSelectingAction
  | TouchingSelectedLineWhileSelectingAction
  | HoveringLineAction
  | TouchingIntersectionAction
  | TouchingSelectedIntersectionWhileSelectingAction
  | PlacingLineAction
  | PlacingIntersectionAction
  | PlacingIntersectionAlongLineAction
  | PlacingIntersectionAtIntersectionAction
  | HoveringIntersectionAction
  | DraggingLineAction
  | DraggingLineWhileSelectingAction
  | DraggingIntersectionAction
  | DraggingIntersectionWhileSelectingAction
  | DraggingSelectionByPointAction
  | DraggingSelectionByLineAction
  | CreateIntersectionAction
  | UIHoveringElementAction
  | UIHoveringElementWhileSelectingAction;

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

export const hoveredElements = (action: Action): string[] => {
  return collectByActionKey("hovered", action);
};

export const selectedElements = (action: Action): string[] => {
  return collectByActionKey("selected", action);
};

export const draggedElements = (action: Action): string[] => {
  return collectByActionKey("dragged", action);
};

export const isElementHovered = (id: string, action: Action): boolean => {
  return containsByActionKey("hovered", id, action);
};

export const isElementDragged = (id: string, action: Action): boolean => {
  return containsByActionKey("dragged", id, action);
};

export const isElementSelected = (id: string, action: Action): boolean => {
  return containsByActionKey("selected", id, action);
};

export const isReferencedByAction = (id: string, action: Action): boolean => {
  return deepContains(
    id,
    keyWhitelist.concat(["hovered", "dragged", "selected"]),
    action
  );
};

const collectByActionKey = (
  key: "hovered" | "dragged" | "selected",
  action: Action
): string[] => {
  if (key in action) {
    return deepCollect(keyWhitelist, action[key]);
  }

  return [];
};

const containsByActionKey = (
  key: "hovered" | "dragged" | "selected",
  target: string,
  action: Action
): boolean => {
  if (key in action) {
    return deepContains(target, keyWhitelist, action[key]);
  }

  return false;
};

const keyWhitelist = ["point", "points", "line", "lines"];

const deepCollect = (validKeys: string[], obj: any): string[] => {
  if (!obj) {
    return [];
  }

  if (typeof obj === "string") {
    return [obj];
  }

  if (Array.isArray(obj)) {
    const results = [];
    for (const item of obj) {
      results.push(...deepCollect(validKeys, item));
    }
    return results;
  }

  if (typeof obj === "object") {
    const results = [];
    for (const key of validKeys) {
      results.push(...deepCollect(validKeys, obj[key]));
    }
    return results;
  }

  return [];
};

const deepContains = (
  target: string,
  validKeys: string[],
  obj: any
): boolean => {
  if (!obj) {
    return false;
  }

  if (typeof obj === "string") {
    return obj === target;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (deepContains(target, validKeys, item)) {
        return true;
      }
    }
  }

  if (typeof obj === "object") {
    for (const key of validKeys) {
      if (deepContains(target, validKeys, obj[key])) {
        return true;
      }
    }
  }

  return false;
};
