import Flatten from "@flatten-js/core";
import { Action, ActionKind } from "./actions";
import { ControlsState, Mode } from "./controls";
import {
  Direction,
  GeoLine,
  Geometry,
  GeoPoint,
  Kind,
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
    case ActionKind.PlacingIntersectionAtIntersection:
    case ActionKind.PlacingIntersectionAlongHorizontalLine:
    case ActionKind.HoveringIntersection:
    case ActionKind.HoveringHorizontalLine:
    case ActionKind.HoveringVerticalLine: {
      return computeEnterAction(currentAction, scene, controls, { x, y });
    }

    case ActionKind.TouchingVerticalLine: {
      return {
        kind: ActionKind.DraggingVerticalLine,
        dragged: {
          ...currentAction.hovered,
        },
        x,
      };
    }

    case ActionKind.DraggingVerticalLine: {
      return { ...currentAction, x };
    }

    case ActionKind.TouchingHorizontalLine: {
      return {
        kind: ActionKind.DraggingHorizontalLine,
        dragged: {
          ...currentAction.hovered,
        },
        y,
      };
    }

    case ActionKind.DraggingHorizontalLine: {
      return { ...currentAction, y };
    }

    case ActionKind.TouchingIntersection: {
      return {
        kind: ActionKind.DraggingIntersection,
        dragged: {
          ...currentAction.hovered,
        },
        x,
        y,
      };
    }

    case ActionKind.DraggingIntersection: {
      return { ...currentAction, x, y };
    }

    case ActionKind.HoveringHorizontalLineWhileSelecting:
    case ActionKind.HoveringVerticalLineWhileSelecting:
    case ActionKind.HoveringIntersectionWhileSelecting:
    case ActionKind.Selecting: {
      const hit = highestPriorityElement(scene.hit(x, y));
      if (hit != null) {
        switch (hit.kind) {
          case Kind.Line: {
            switch (hit.direction) {
              case Direction.Vertical:
                return {
                  ...currentAction,
                  kind: ActionKind.HoveringVerticalLineWhileSelecting,
                  hovered: {
                    lines: {
                      vertical: [hit.id],
                    },
                  },
                };

              case Direction.Horizontal:
                return {
                  ...currentAction,
                  kind: ActionKind.HoveringHorizontalLineWhileSelecting,
                  hovered: {
                    lines: {
                      horizontal: [hit.id],
                    },
                  },
                };
            }
          }

          case Kind.Point: {
            return {
              ...currentAction,
              kind: ActionKind.HoveringIntersectionWhileSelecting,
              hovered: {
                points: [hit.id],
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

const computeMouseDownAction = (currentAction: Action): Action => {
  switch (currentAction.kind) {
    case ActionKind.HoveringHorizontalLine: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingHorizontalLine,
      };
    }

    case ActionKind.HoveringVerticalLine: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingVerticalLine,
      };
    }

    case ActionKind.HoveringIntersection: {
      return {
        ...currentAction,
        kind: ActionKind.TouchingIntersection,
      };
    }
  }

  return currentAction;
};

const computeMouseUpAction = (
  currentAction: Action,
  { x, y }: Position
): Action => {
  switch (currentAction.kind) {
    case ActionKind.TouchingVerticalLine: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringVerticalLineWhileSelecting,
        selected: {
          lines: {
            vertical: currentAction.hovered.lines.vertical,
            horizontal: [],
          },
          points: [],
        },
      };
    }

    case ActionKind.TouchingHorizontalLine: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringHorizontalLineWhileSelecting,
        selected: {
          lines: {
            horizontal: currentAction.hovered.lines.horizontal,
            vertical: [],
          },
          points: [],
        },
      };
    }

    case ActionKind.TouchingIntersection: {
      return {
        ...currentAction,
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        selected: {
          lines: {
            horizontal: [],
            vertical: [],
          },
          points: currentAction.hovered.points,
        },
      };
    }

    case ActionKind.PlacingHorizontalLine: {
      return {
        kind: ActionKind.CreateHorizontalLine,
        y,
      };
    }

    case ActionKind.PlacingVerticalLine: {
      return {
        kind: ActionKind.CreateVerticalLine,
        x,
      };
    }

    case ActionKind.PlacingIntersection: {
      return {
        kind: ActionKind.CreateIntersection,
        x,
        y,
      };
    }

    case ActionKind.DraggingHorizontalLine: {
      return {
        kind: ActionKind.HoveringHorizontalLine,
        hovered: {
          lines: {
            horizontal: currentAction.dragged.lines.horizontal,
          },
        },
        x,
        y,
      };
    }

    case ActionKind.DraggingVerticalLine: {
      return {
        kind: ActionKind.HoveringVerticalLine,
        hovered: {
          lines: {
            vertical: currentAction.dragged.lines.vertical,
          },
        },
        x,
        y,
      };
    }

    case ActionKind.DraggingIntersection: {
      return {
        kind: ActionKind.HoveringIntersection,
        hovered: {
          points: currentAction.dragged.points,
        },
        x,
        y,
      };
    }

    case ActionKind.HoveringHorizontalLineWhileSelecting: {
      const obj = {};

      for (let key of currentAction.hovered.lines.horizontal) {
        if (!obj[key]) {
          obj[key] = 0;
        }
        obj[key]++;
      }

      for (let key of currentAction.selected.lines.horizontal) {
        if (!obj[key]) {
          obj[key] = 0;
        }
        obj[key]++;
      }

      return {
        kind: ActionKind.HoveringHorizontalLineWhileSelecting,
        hovered: {
          ...currentAction.hovered,
        },
        selected: {
          ...currentAction.selected,
          lines: {
            ...currentAction.selected.lines,
            horizontal: Object.entries(obj)
              .filter(([_, v]) => v === 1)
              .map(([k, _]) => k),
          },
        },
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
              points: [target.id],
            },
          };
        }

        case Kind.Line: {
          switch (target.direction) {
            case Direction.Horizontal: {
              return {
                ...currentAction,
                kind: ActionKind.HoveringHorizontalLineWhileSelecting,
                hovered: {
                  lines: {
                    horizontal: [target.id],
                  },
                },
              };
            }

            case Direction.Vertical: {
              return {
                ...currentAction,
                kind: ActionKind.HoveringVerticalLineWhileSelecting,
                hovered: {
                  lines: {
                    vertical: [target.id],
                  },
                },
              };
            }
          }
        }
      }
    } else {
      switch (target.kind) {
        case Kind.Point: {
          return {
            kind: ActionKind.HoveringIntersection,
            hovered: {
              points: [target.id],
            },
            x,
            y,
          };
        }

        case Kind.Line: {
          switch (target.direction) {
            case Direction.Horizontal: {
              return {
                kind: ActionKind.HoveringHorizontalLine,
                hovered: {
                  lines: {
                    horizontal: [target.id],
                  },
                },
                x,
                y,
              };
            }

            case Direction.Vertical: {
              return {
                kind: ActionKind.HoveringVerticalLine,
                hovered: {
                  lines: {
                    vertical: [target.id],
                  },
                },
                x,
                y,
              };
            }
          }
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
        hovered: {
          lines: {
            horizontal: [target.id],
          },
        },
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringHorizontalLine,
      hovered: {
        lines: {
          horizontal: [target.id],
        },
      },
      x,
      y,
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
        hovered: {
          lines: {
            vertical: [target.id],
          },
        },
      };
    }

    return { ...currentAction, x, y };
  }

  if (target) {
    return {
      kind: ActionKind.HoveringVerticalLine,
      hovered: {
        lines: {
          vertical: [target.id],
        },
      },
      x,
      y,
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
        hovered: {
          points: [target.id],
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
          points: [target.id],
        },
        x,
        y,
      };
    } else {
      const [h, v] = target;
      if (!v) {
        return {
          x,
          y,
          hovered: {
            lines: {
              horizontal: [h.id],
            },
          },
          kind: ActionKind.PlacingIntersectionAlongHorizontalLine,
        };
      } else if (!h) {
        return {
          x,
          y,
          hovered: {
            lines: {
              vertical: [v.id],
            },
          },
          kind: ActionKind.PlacingIntersectionAlongVerticalLine,
        };
      } else {
        return {
          x,
          y,
          hovered: {
            lines: {
              horizontal: [h.id],
              vertical: [v.id],
            },
          },
          kind: ActionKind.PlacingIntersectionAtIntersection,
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

const intersectionHits = (
  elements: Geometry[]
): GeoPoint | [GeoLine | undefined, GeoLine | undefined] | undefined => {
  const fp = firstPoint(elements);
  if (fp != null) {
    return fp;
  }

  const h = firstHorizontalLine(elements);
  const v = firstVerticalLine(elements);

  if (!h && !v) {
    return undefined;
  }

  return [h, v];
};
