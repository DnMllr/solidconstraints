import { Position } from "../scene";
import { Direction, Kind } from "../scene/abstractGeometry";

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
}

export interface HasActionKind<T extends ActionKind> {
  kind: T;
}

export interface HasSelections {
  selected: HasLines & HasPoints;
}

export interface HasHovered<T> {
  hovered: T;
}

export interface HasDragged<T> {
  dragged: T;
}

export interface HasDirection {
  direction: Direction;
}

export interface HasLines {
  lines: string[];
}

export interface HasLine {
  line: string;
}

export interface HasPoints {
  points: string[];
}

export interface HasPoint {
  point: string;
}

export type NonInteractingAction = HasActionKind<ActionKind.None>;

export interface InteractingAction
  extends HasActionKind<ActionKind.Interacting>,
    Position {}

export interface SelectingAction
  extends HasActionKind<ActionKind.Selecting>,
    HasSelections,
    Position {}

export interface PlacingLineAction
  extends HasActionKind<ActionKind.PlacingLine>,
    HasDirection,
    Position {}

export interface HoveringLineAction
  extends HasActionKind<ActionKind.HoveringLine>,
    HasHovered<HasLine>,
    Position {}

export interface HoveringLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

export interface HoveringSelectedLineWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringSelectedLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

export interface HoveringIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

export interface HoveringSelectedIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.HoveringSelectedIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

export interface TouchingLineAction
  extends HasActionKind<ActionKind.TouchingLine>,
    HasHovered<HasLine> {}

export interface TouchingLineWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

export interface DraggingLineAction
  extends HasActionKind<ActionKind.DraggingLine>,
    HasDragged<HasLine>,
    Position {}

export interface DraggingLineWhileSelectingAction
  extends HasActionKind<ActionKind.DraggingLineWhileSelecting>,
    HasDragged<HasLine>,
    HasSelections,
    Position {}

export interface DraggingIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.DraggingIntersectionWhileSelecting>,
    HasDragged<HasPoint>,
    HasSelections,
    Position {}

export interface PlacingIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersection>,
    Position {}

export interface PlacingIntersectionAlongLineAction
  extends HasActionKind<ActionKind.PlacingIntersectionAlongLine>,
    HasHovered<HasLine>,
    Position {}

export interface HoveringIntersectionAction
  extends HasActionKind<ActionKind.HoveringIntersection>,
    HasHovered<HasPoint>,
    Position {}

export interface TouchingIntersectionAction
  extends HasActionKind<ActionKind.TouchingIntersection>,
    HasHovered<HasPoint> {}

export interface DraggingIntersectionAction
  extends HasActionKind<ActionKind.DraggingIntersection>,
    HasDragged<HasPoint & HasLines>,
    Position {}

export interface CreateLineAction
  extends HasActionKind<ActionKind.CreateLine>,
    HasDirection,
    Position {}

export interface CreateIntersectionAction
  extends HasActionKind<ActionKind.CreateIntersection>,
    Position {}

export interface CreateIntersectionAlongLineAction
  extends HasActionKind<ActionKind.CreateIntersectionAlongLine>,
    HasHovered<HasLine>,
    Position {}

export interface CreateIntersectionAlongIntersectionAction
  extends HasActionKind<ActionKind.CreateIntersectionAtIntersection>,
    HasHovered<HasLines> {}

export interface PlacingIntersectionAtIntersectionAction
  extends HasActionKind<ActionKind.PlacingIntersectionAtIntersection>,
    HasHovered<HasLines>,
    Position {}

export interface TouchingSelectedIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingSelectedIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

export interface TouchingIntersectionWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingIntersectionWhileSelecting>,
    HasHovered<HasPoint>,
    HasSelections {}

export interface TouchingSelectedLineWhileSelectingAction
  extends HasActionKind<ActionKind.TouchingSelectedLineWhileSelecting>,
    HasHovered<HasLine>,
    HasSelections {}

export interface DraggingSelectionByLineAction
  extends HasActionKind<ActionKind.DraggingSelectionByLine>,
    HasSelections,
    HasHovered<HasLine>,
    Position {}

export interface DraggingSelectionByPointAction
  extends HasActionKind<ActionKind.DraggingSelectionByPoint>,
    HasSelections,
    HasHovered<HasPoint>,
    Position {}

export interface UIHoveringElementAction
  extends HasActionKind<ActionKind.UIHoveringElement>,
    HasHovered<string> {}

export interface UIHoveringElementWhileSelectingAction
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

// TODO(Dan) deprecate everything under this line.

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

interface ElementCollection {
  [Kind.Line]: Set<string>;
  [Kind.Point]: Set<string>;
  unknown: Set<string>;
}

export const allReferencedElementsByKind = (
  action: Action
): ElementCollection => {
  const result: ElementCollection = {
    [Kind.Point]: new Set(),
    [Kind.Line]: new Set(),
    unknown: new Set(),
  };

  if ("hovered" in action) {
    if (typeof action.hovered !== "string") {
      collectFromActivity(action.hovered, result);
    } else {
      result.unknown.add(action.hovered);
    }
  }

  if ("dragged" in action) {
    collectFromActivity(action.dragged, result);
  }

  if ("selected" in action) {
    collectFromActivity(action.selected, result);
  }

  return result;
};

const collectFromActivity = (
  a: HasLine | HasLines | HasPoint | HasPoints,
  collect: { [key in Kind]: Set<string> }
) => {
  if ("line" in a) {
    collect[Kind.Line].add(a.line);
  }

  if ("lines" in a) {
    for (const line of a.lines) {
      collect[Kind.Line].add(line);
    }
  }

  if ("point" in a) {
    collect[Kind.Point].add(a.point);
  }

  if ("points" in a) {
    for (const point of a.points) {
      collect[Kind.Point].add(point);
    }
  }
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

const keyWhitelist = ["point", "points", "line", "lines"];

const deepCollect = (validKeys: string[], obj: unknown): string[] => {
  if (!obj) {
    return [];
  }

  if (typeof obj === "string") {
    return [obj];
  }

  if (Array.isArray(obj)) {
    const results: string[] = [];
    for (const item of obj) {
      results.push(...deepCollect(validKeys, item as unknown));
    }
    return results;
  }

  if (typeof obj === "object") {
    const results: string[] = [];
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
  obj: unknown
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
