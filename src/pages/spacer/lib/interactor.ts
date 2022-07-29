import { createSignal } from "solid-js";
import {
  Action,
  ActionKind,
  isElementSelected,
  lookupActionKind,
} from "./actions";
import { ControlsCtrl, ControlsState, Mode } from "./controls";
import {
  Direction,
  GeoLine,
  Geometry,
  GeoPoint,
  Kind,
  Position,
  SceneReader,
} from "./scene";

export const createInteractor = (
  scene: SceneReader,
  controls: ControlsCtrl
): InteractionCtrl => {
  const [action, setAction] = createSignal<Action>({ kind: ActionKind.None });

  return {
    action,
    debug() {
      const a = action();
      console.log({ ...a, kind: lookupActionKind(a.kind) });
    },

    viewport: {
      onMouseDown(e: MouseEvent) {
        return setAction((a) => onMouseDown(a, scene, e));
      },

      onMouseUp(e: MouseEvent) {
        return setAction((a) => onMouseUp(a, scene, controls.controls, e));
      },

      onMouseMove(e: MouseEvent) {
        return setAction((a) => onMouseMove(a, scene, controls.controls, e));
      },

      onMouseEnter(e: MouseEvent) {
        return setAction((a) => onMouseEnter(a, scene, controls.controls, e));
      },

      onMouseLeave() {
        return setAction(onMouseLeave);
      },
    },

    keyboard: {
      onEscape() {
        return setAction((a) => onEscape(a, scene, controls.controls));
      },
    },

    ui: {
      hoverElement(id) {
        return setAction((a) => onUIHoverElement(a, id));
      },

      clear() {
        return setAction((a) => onUIClear(a));
      },
    },
  };
};

export interface InteractionCtrl {
  action(): Action;
  debug(): void;
  viewport: ViewportInteractions;
  keyboard: KeyboardInteractions;
  ui: UIInteractions;
}

export interface KeyboardInteractions {
  onEscape(): Action;
}

export interface ViewportInteractions {
  onMouseDown(e: MouseEvent): Action;
  onMouseUp(e: MouseEvent): Action;
  onMouseMove(e: MouseEvent): Action;
  onMouseEnter(e: MouseEvent): Action;
  onMouseLeave(): Action;
}

export interface UIInteractions {
  hoverElement(id: string): Action;
  clear(): Action;
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

const onEscape = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState
): Action => computeEscapeAction(currentAction, scene, controls);

const onMouseDown = (
  currentAction: Action,
  scene: SceneReader,
  position: Position
): Action => computeMouseDownAction(currentAction, scene, position);

const onMouseUp = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  e: MouseEvent
): Action =>
  computeMouseUpAction(
    currentAction,
    scene,
    controls,
    computePosition(controls, e)
  );

const onMouseEnter = (
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

const onMouseLeave = (currentAction: Action): Action => {
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

const onMouseMove = (
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

const computeEscapeAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState
): Action => {
  if ("x" in currentAction && "y" in currentAction) {
    return computeEnterAction(
      { kind: ActionKind.None },
      scene,
      {
        ...controls,
        mode: Mode.None,
      },
      currentAction
    );
  }
  return { kind: ActionKind.None };
};

const computeMouseMoveAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  { x, y }: Position
): Action => {
  switch (currentAction.kind) {
    case ActionKind.None:
    case ActionKind.Interacting:
    case ActionKind.PlacingLine:
    case ActionKind.HoveringLine:
    case ActionKind.PlacingIntersection:
    case ActionKind.CreateIntersection:
    case ActionKind.CreateIntersectionAlongLine:
    case ActionKind.CreateIntersectionAtIntersection:
    case ActionKind.CreateLine:
    case ActionKind.PlacingIntersectionAlongLine:
    case ActionKind.PlacingIntersectionAtIntersection:
    case ActionKind.HoveringIntersection: {
      return computeEnterAction(currentAction, scene, controls, { x, y });
    }

    case ActionKind.TouchingLine: {
      return {
        kind: ActionKind.DraggingLine,
        dragged: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.TouchingLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingLineWhileSelecting,
        dragged: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.TouchingSelectedLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingSelectionByLine,
        x,
        y,
      };
    }

    case ActionKind.TouchingSelectedIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingSelectionByPoint,
        x,
        y,
      };
    }

    case ActionKind.TouchingIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.DraggingIntersectionWhileSelecting,
        dragged: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.TouchingIntersection: {
      const point = scene.points()[currentAction.hovered.point];

      return {
        kind: ActionKind.DraggingIntersection,
        dragged: {
          ...currentAction.hovered,
          lines: [point.x, point.y],
        },
        x,
        y,
      };
    }

    case ActionKind.DraggingLine:
    case ActionKind.DraggingLineWhileSelecting:
    case ActionKind.DraggingSelectionByLine:
    case ActionKind.DraggingSelectionByPoint:
    case ActionKind.DraggingIntersectionWhileSelecting:
    case ActionKind.DraggingIntersection: {
      return { ...currentAction, x, y };
    }

    case ActionKind.HoveringLineWhileSelecting:
    case ActionKind.HoveringSelectedLineWhileSelecting:
    case ActionKind.HoveringSelectedIntersectionWhileSelecting:
    case ActionKind.HoveringIntersectionWhileSelecting:
    case ActionKind.Selecting: {
      const hit = highestPriorityElement(scene.hit(x, y));
      if (hit != null) {
        switch (hit.kind) {
          case Kind.Line: {
            if (currentAction.selected.lines.includes(hit.id)) {
              return {
                ...currentAction,
                kind: ActionKind.HoveringSelectedLineWhileSelecting,
                hovered: {
                  line: hit.id,
                },
              };
            }

            return {
              ...currentAction,
              kind: ActionKind.HoveringLineWhileSelecting,
              hovered: {
                line: hit.id,
              },
            };
          }

          case Kind.Point: {
            if (currentAction.selected.points.includes(hit.id)) {
              return {
                ...currentAction,
                kind: ActionKind.HoveringSelectedIntersectionWhileSelecting,
                hovered: {
                  point: hit.id,
                },
              };
            }

            return {
              ...currentAction,
              kind: ActionKind.HoveringIntersectionWhileSelecting,
              hovered: {
                point: hit.id,
              },
            };
          }
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

const computeMouseDownAction = (
  currentAction: Action,
  scene: SceneReader,
  { x, y }: Position
): Action => {
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

const computeMouseUpAction = (
  currentAction: Action,
  scene: SceneReader,
  controls: ControlsState,
  { x, y }: Position
): Action => {
  switch (currentAction.kind) {
    case ActionKind.TouchingLine: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedLineWhileSelecting,
        selected: {
          lines: [currentAction.hovered.line],
          points: [],
        },
      };
    }

    case ActionKind.TouchingIntersection: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        selected: {
          lines: [],
          points: [currentAction.hovered.point],
        },
      };
    }

    case ActionKind.TouchingIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedIntersectionWhileSelecting,
        selected: {
          ...currentAction.selected,
          points: [
            ...currentAction.selected.points,
            currentAction.hovered.point,
          ],
        },
      };
    }

    case ActionKind.TouchingLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedLineWhileSelecting,
        selected: {
          ...currentAction.selected,
          lines: [...currentAction.selected.lines, currentAction.hovered.line],
        },
      };
    }

    case ActionKind.TouchingSelectedIntersectionWhileSelecting: {
      if (
        currentAction.selected.lines.length === 0 &&
        currentAction.selected.points.length === 1
      ) {
        return {
          kind: ActionKind.HoveringIntersection,
          hovered: currentAction.hovered,
          x,
          y,
        };
      }

      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        selected: {
          ...currentAction.selected,
          points: currentAction.selected.points.filter(
            (p) => p !== currentAction.hovered.point
          ),
        },
      };
    }

    case ActionKind.TouchingSelectedLineWhileSelecting: {
      if (
        currentAction.selected.lines.length === 1 &&
        currentAction.selected.points.length === 0
      ) {
        return {
          kind: ActionKind.HoveringLine,
          hovered: currentAction.hovered,
          x,
          y,
        };
      }

      return {
        ...currentAction,
        kind: ActionKind.HoveringLineWhileSelecting,
        selected: {
          ...currentAction.selected,
          lines: currentAction.selected.lines.filter(
            (p) => p !== currentAction.hovered.line
          ),
        },
      };
    }

    case ActionKind.PlacingLine: {
      return {
        ...currentAction,
        kind: ActionKind.CreateLine,
        x,
        y,
      };
    }

    case ActionKind.PlacingIntersection: {
      return {
        kind: ActionKind.CreateIntersection,
        x,
        y,
      };
    }

    case ActionKind.PlacingIntersectionAlongLine: {
      return {
        kind: ActionKind.CreateIntersectionAlongLine,
        hovered: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      return {
        kind: ActionKind.CreateIntersectionAtIntersection,
        hovered: {
          ...currentAction.hovered,
        },
      };
    }

    case ActionKind.CreateIntersectionAlongLine:
    case ActionKind.CreateIntersectionAtIntersection:
    case ActionKind.CreateIntersection: {
      return computeEnterAction(currentAction, scene, controls, { x, y });
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      return createCreateIntersectionAction(
        scene,
        { x, y },
        currentAction.hovered.lines
      );
    }

    case ActionKind.DraggingIntersectionWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        hovered: {
          point: currentAction.dragged.point,
        },
      };
    }

    case ActionKind.DraggingSelectionByPoint: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedIntersectionWhileSelecting,
      };
    }

    case ActionKind.DraggingSelectionByLine: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringSelectedLineWhileSelecting,
      };
    }

    case ActionKind.DraggingLineWhileSelecting: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringLineWhileSelecting,
        hovered: {
          line: currentAction.dragged.line,
        },
      };
    }

    case ActionKind.DraggingLine: {
      return {
        kind: ActionKind.HoveringLine,
        hovered: {
          line: currentAction.dragged.line,
        },
        x,
        y,
      };
    }

    case ActionKind.DraggingIntersection: {
      return {
        kind: ActionKind.HoveringIntersection,
        hovered: {
          ...currentAction.dragged,
        },
        x,
        y,
      };
    }
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
        case Kind.Point: {
          return {
            ...currentAction,
            kind: ActionKind.HoveringIntersectionWhileSelecting,
            hovered: {
              point: target.id,
            },
          };
        }

        case Kind.Line: {
          return {
            ...currentAction,
            kind: ActionKind.HoveringLineWhileSelecting,
            hovered: {
              line: target.id,
            },
          };
        }
      }
    } else {
      switch (target.kind) {
        case Kind.Point: {
          return {
            kind: ActionKind.HoveringIntersection,
            hovered: {
              point: target.id,
            },
            x,
            y,
          };
        }

        case Kind.Line: {
          return {
            kind: ActionKind.HoveringLine,
            hovered: {
              line: target.id,
            },
            x,
            y,
          };
        }
      }
    }
  } else if (currentAction.kind === ActionKind.Selecting) {
    return { ...currentAction, x, y };
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
        kind: ActionKind.HoveringLineWhileSelecting,
        hovered: {
          line: target.id,
        },
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringLine,
      hovered: {
        line: target.id,
      },
      x,
      y,
    };
  }

  return {
    kind: ActionKind.PlacingLine,
    direction: Direction.Horizontal,
    x,
    y,
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
        kind: ActionKind.HoveringLineWhileSelecting,
        hovered: {
          line: target.id,
        },
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringLine,
      hovered: {
        line: target.id,
      },
      x,
      y,
    };
  }

  return {
    direction: Direction.Vertical,
    kind: ActionKind.PlacingLine,
    x,
    y,
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
        hovered: {
          point: target.id,
        },
      };
    }
    return { ...currentAction, x, y };
  }

  const target = intersectionHits(scene.hit(x, y));

  if (target) {
    if (!Array.isArray(target)) {
      return {
        kind: ActionKind.HoveringIntersection,
        hovered: {
          point: target.id,
        },
        x,
        y,
      };
    } else {
      if (target.length === 1) {
        return {
          kind: ActionKind.PlacingIntersectionAlongLine,
          hovered: {
            line: target[0].id,
          },
          x,
          y,
        };
      }
      return {
        kind: ActionKind.PlacingIntersectionAtIntersection,
        hovered: {
          lines: target.map((t) => t.id),
        },
        x,
        y,
      };
    }
  }

  return {
    x,
    y,
    kind: ActionKind.PlacingIntersection,
  };
};

const onUIHoverElement = (currentAction: Action, target: string): Action => {
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

const onUIClear = (currentAction: Action): Action => {
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

const intersectionHits = (
  elements: Geometry[]
): GeoPoint | GeoLine[] | undefined => {
  const fp = firstPoint(elements);
  if (fp != null) {
    return fp;
  }

  const h = firstHorizontalLine(elements);
  const v = firstVerticalLine(elements);

  if (!h && !v) {
    return undefined;
  }

  const result = [];

  if (v != null) {
    result.push(v);
  }

  if (h != null) {
    result.push(h);
  }

  return result;
};

const createCreateIntersectionAction = (
  scene: SceneReader,
  { x, y }: Position,
  lineIDs: string[]
): Action => {
  const action: Action = { kind: ActionKind.CreateIntersection, x, y };
  const lines = scene.lines();

  for (const lineID of lineIDs) {
    const line = lines[lineID];
    switch (line.direction) {
      case Direction.Horizontal: {
        action.y = line.v;
        break;
      }

      case Direction.Vertical: {
        action.x = line.v;
        break;
      }
    }
  }

  return action;
};
