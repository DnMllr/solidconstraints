import Flatten from "@flatten-js/core";
import { batch, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Action, ActionKind } from "./actions";
import { ControlsCtrl, ControlsState, Mode } from "./controls";
import {
  Direction,
  GeoLine,
  Geometry,
  GeoPoint,
  Kind,
  SceneCtl,
  SceneReader,
} from "./scene";

interface Position {
  x: number;
  y: number;
}

export interface InteractionCtrl {
  mouseDown(e: MouseEvent): void;
  mouseUp(e: MouseEvent): void;
  mouseMove(e: MouseEvent): void;
  mouseEnter(e: MouseEvent): void;
  mouseLeave(): void;
}

export enum MouseEvents {
  Enter,
  Leave,
  Down,
  Up,
  Move,
}

export interface MouseAction {
  event: MouseEvents;
  position: Flatten.Point;
}

const computePosition = (controls: ControlsState, e: MouseEvent): Position => {
  let x = e.offsetX;
  let y = e.offsetY;
  if (controls.grid != null) {
    x /= controls.grid.x;
    x = Math.round(x);
    x *= controls.grid.x;

    y /= controls.grid.y;
    y = Math.round(y);
    y *= controls.grid.y;
  }

  return { x, y };
};

export const onMouseDown = (currentAction: Action): Action =>
  computeMouseDownAction(currentAction);

export const onMouseUp = (
  currentAction: Action,
  controls: ControlsState,
  e: MouseEvent
): Action => computeMouseUpAction(currentAction, computePosition(controls, e));

export const onMouseEnter = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  e: MouseEvent
): Action =>
  computeEnterAction(
    currentAction,
    scene,
    controls,
    computePosition(controls, e)
  );

export const onMouseLeave = (currentAction: Action): Action =>
  currentAction.kind === ActionKind.Selecting
    ? currentAction
    : { kind: ActionKind.None };

export const onMouseMove = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  e: MouseEvent
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
    case ActionKind.PlacingVerticalLine:
    case ActionKind.PlacingHorizontalLine:
    case ActionKind.HoveringVerticalLine:
    case ActionKind.PlacingIntersection:
    case ActionKind.CreateIntersection:
    case ActionKind.CreateHorizontalLine:
    case ActionKind.CreateVerticalLine:
    case ActionKind.PlacingIntersectionAlongVerticalLine:
    case ActionKind.PlacingIntersectionAlongHorizontalLine:
    case ActionKind.HoveringIntersection:
    case ActionKind.HoveringHorizontalLine:
    case ActionKind.HoveringVerticalLine:
      return computeEnterAction(currentAction, scene, controls, { x, y });
    case ActionKind.TouchingVerticalLine:
    case ActionKind.DraggingVerticalLine: {
      return {
        kind: ActionKind.DraggingVerticalLine,
        target: currentAction.target,
        x,
      };
    }
    case ActionKind.TouchingHorizontalLine:
    case ActionKind.DraggingHorizontalLine: {
      return {
        kind: ActionKind.DraggingHorizontalLine,
        target: currentAction.target,
        y,
      };
    }
    case ActionKind.TouchingIntersection:
    case ActionKind.DraggingIntersection:
      return {
        kind: ActionKind.DraggingIntersection,
        target: currentAction.target,
        x,
        y,
      };
    case ActionKind.HoveringHorizontalLineWhileSelecting:
    case ActionKind.HoveringVerticalLineWhileSelecting:
    case ActionKind.HoveringIntersectionWhileSelecting:
    case ActionKind.Selecting: {
      const hit = highestPriorityElement(scene.hit(x, y));
      if (hit != null) {
        switch (hit.kind) {
          case Kind.Line:
            switch (hit.direction) {
              case Direction.Vertical:
                return {
                  ...currentAction,
                  kind: ActionKind.HoveringVerticalLineWhileSelecting,
                  target: hit.id,
                };
              case Direction.Horizontal:
                return {
                  ...currentAction,
                  kind: ActionKind.HoveringHorizontalLineWhileSelecting,
                  target: hit.id,
                };
            }
          case Kind.Point:
            return {
              ...currentAction,
              kind: ActionKind.HoveringIntersectionWhileSelecting,
              target: hit.id,
            };
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

const computeMouseDownAction = (currentAction: Action): Action => {
  switch (currentAction.kind) {
    case ActionKind.HoveringHorizontalLine:
      return {
        kind: ActionKind.TouchingHorizontalLine,
        target: currentAction.target,
      };
    case ActionKind.HoveringVerticalLine:
      return {
        kind: ActionKind.TouchingVerticalLine,
        target: currentAction.target,
      };
    case ActionKind.HoveringIntersection:
      return {
        kind: ActionKind.TouchingIntersection,
        target: currentAction.target,
      };
  }

  return currentAction;
};

const computeMouseUpAction = (
  currentAction: Action,
  { x, y }: Position
): Action => {
  switch (currentAction.kind) {
    case ActionKind.TouchingVerticalLine:
      return {
        kind: ActionKind.HoveringVerticalLineWhileSelecting,
        target: currentAction.target,
        selections: [currentAction.target],
      };
    case ActionKind.TouchingHorizontalLine:
      return {
        kind: ActionKind.HoveringHorizontalLineWhileSelecting,
        target: currentAction.target,
        selections: [currentAction.target],
      };
    case ActionKind.TouchingIntersection:
      return {
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        target: currentAction.target,
        selections: [currentAction.target],
      };
    case ActionKind.PlacingHorizontalLine:
      return {
        kind: ActionKind.CreateHorizontalLine,
        y,
      };
    case ActionKind.PlacingVerticalLine:
      return {
        kind: ActionKind.CreateVerticalLine,
        x,
      };
    case ActionKind.PlacingIntersection:
      return {
        kind: ActionKind.CreateIntersection,
        x,
        y,
      };
    case ActionKind.DraggingHorizontalLine:
      return {
        kind: ActionKind.HoveringHorizontalLine,
        target: currentAction.target,
      };
    case ActionKind.DraggingVerticalLine:
      return {
        kind: ActionKind.HoveringVerticalLine,
        target: currentAction.target,
      };
    case ActionKind.DraggingIntersection:
      return {
        kind: ActionKind.HoveringIntersection,
        target: currentAction.target,
      };
  }

  return currentAction;
};

const computeEnterAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  position: Position
): Action => {
  switch (true) {
    case isInNoneMode(controls):
      return enterInNoneMode(currentAction, scene, position);

    case isInHorizontalLineMode(controls):
      return enterInHorizontalLineMode(currentAction, scene, position);

    case isInVerticalLineMode(controls):
      return enterInVerticalLineMode(currentAction, scene, position);

    case isInIntersectionMode(controls):
      return enterInIntersectionMode(currentAction, scene, position);

    default:
      throw new Error("unknown mode");
  }
};

const enterInNoneMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  const target = highestPriorityElement(scene.hit(x, y));
  if (target) {
    if (currentAction.kind === ActionKind.Selecting) {
      switch (target.kind) {
        case Kind.Point:
          return {
            ...currentAction,
            kind: ActionKind.HoveringIntersectionWhileSelecting,
            target: target.id,
          };
        case Kind.Line:
          switch (target.direction) {
            case Direction.Horizontal:
              return {
                ...currentAction,
                kind: ActionKind.HoveringHorizontalLineWhileSelecting,
                target: target.id,
              };
            case Direction.Vertical:
              return {
                ...currentAction,
                kind: ActionKind.HoveringVerticalLineWhileSelecting,
                target: target.id,
              };
          }
      }
    } else {
      switch (target.kind) {
        case Kind.Point:
          return { kind: ActionKind.HoveringIntersection, target: target.id };
        case Kind.Line:
          switch (target.direction) {
            case Direction.Horizontal:
              return {
                kind: ActionKind.HoveringHorizontalLine,
                target: target.id,
              };
            case Direction.Vertical:
              return {
                kind: ActionKind.HoveringVerticalLine,
                target: target.id,
              };
          }
      }
    }
  }
  return { kind: ActionKind.Interacting, x, y };
};

const enterInHorizontalLineMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  const target = firstHorizontalLine(scene.hit(x, y));

  if (currentAction.kind === ActionKind.Selecting) {
    if (target) {
      return {
        ...currentAction,
        kind: ActionKind.HoveringHorizontalLineWhileSelecting,
        target: target.id,
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringHorizontalLine,
      target: target.id,
    };
  }

  return {
    x,
    y,
    kind: ActionKind.PlacingHorizontalLine,
  };
};

const enterInVerticalLineMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  const target = firstVerticalLine(scene.hit(x, y));

  if (currentAction.kind === ActionKind.Selecting) {
    if (target) {
      return {
        ...currentAction,
        kind: ActionKind.HoveringVerticalLineWhileSelecting,
        target: target.id,
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringVerticalLine,
      target: target.id,
    };
  }

  return {
    x,
    y,
    kind: ActionKind.PlacingVerticalLine,
  };
};

const enterInIntersectionMode = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
  if (currentAction.kind === ActionKind.Selecting) {
    const target = firstPoint(scene.hit(x, y));
    if (target) {
      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        target: target.id,
      };
    }
    return { ...currentAction, x, y };
  }

  const target = highestPriorityElement(scene.hit(x, y));

  if (target) {
    switch (target.kind) {
      case Kind.Point:
        return {
          kind: ActionKind.HoveringIntersection,
          target: target.id,
        };
      case Kind.Line:
        switch (target.direction) {
          case Direction.Vertical:
            return {
              x,
              y,
              target: target.id,
              kind: ActionKind.PlacingIntersectionAlongVerticalLine,
            };
          case Direction.Horizontal:
            return {
              x,
              y,
              target: target.id,
              kind: ActionKind.PlacingIntersectionAlongHorizontalLine,
            };
        }
    }
  }

  return {
    x,
    y,
    kind: ActionKind.PlacingIntersection,
  };
};

const isInVerticalLineMode = ({ mode }: ControlsState) =>
  mode === Mode.VerticalLine;
const isInHorizontalLineMode = ({ mode }: ControlsState) =>
  mode === Mode.HorizontalLine;
const isInIntersectionMode = ({ mode }: ControlsState) => mode === Mode.Point;
const isInNoneMode = ({ mode }: ControlsState) => mode === Mode.None;

const firstPoint = (elements: Geometry[]): GeoPoint | undefined => {
  for (let el of elements) {
    if (el.kind === Kind.Point) {
      return el;
    }
  }
};

const firstLine = (elements: Geometry[]): GeoLine | undefined => {
  for (let el of elements) {
    if (el.kind === Kind.Line) {
      return el;
    }
  }
};

const firstVerticalLine = (elements: Geometry[]): GeoLine | undefined => {
  for (let el of elements) {
    if (el.kind === Kind.Line && el.direction === Direction.Vertical) {
      return el;
    }
  }
};

const firstHorizontalLine = (elements: Geometry[]): GeoLine | undefined => {
  for (let el of elements) {
    if (el.kind === Kind.Line && el.direction === Direction.Horizontal) {
      return el;
    }
  }
};

const highestPriorityElement = (elements: Geometry[]): Geometry | undefined => {
  return firstPoint(elements) || firstLine(elements);
};
