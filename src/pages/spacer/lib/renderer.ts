import { Direction, Kind, Position, SceneReader } from "./scene";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import {
  Action,
  ActionKind,
  getXPosition,
  getYPosition,
  HasSelections,
  selectedElements,
} from "./actions";
import Flatten from "@flatten-js/core";

interface Theme {
  padding: number;
  base: Options;
  line: BaseGeoTheme;
  point: PointTheme;
}

interface BaseGeoTheme<T = Options> {
  rest: T;
  hovering: T;
  insert: T;
  dragging: T;
  selected: T;
  hoveringSelected: T;
}

interface PointTheme {
  radius: BaseGeoTheme<number>;
  options: BaseGeoTheme;
}

const padding = 10;
const opts: Options = { bowing: 0 };
const solid: Options = { fillStyle: "solid" };
const lessRough: Options = { roughness: 0.6 };
const basePoint: Options = { ...opts, ...solid, ...lessRough };
const dashed: Options = {
  strokeLineDash: [5, 13],
  strokeLineDashOffset: 10,
};

const theme: Theme = {
  padding,
  base: opts,
  line: {
    rest: {
      ...opts,
      ...dashed,
      stroke: "gainsboro",
    },
    insert: {
      ...opts,
      stroke: "linen",
    },
    hovering: {
      ...opts,
      stroke: "lavender",
    },
    dragging: {
      ...opts,
      stroke: "lightblue",
    },
    selected: {
      ...opts,
      ...dashed,
      stroke: "palevioletred",
    },
    hoveringSelected: {
      ...opts,
      stroke: "violet",
    },
  },
  point: {
    radius: {
      rest: 7,
      hovering: 10,
      dragging: 5,
      insert: 10,
      selected: 10,
      hoveringSelected: 11,
    },
    options: {
      rest: {
        ...basePoint,
        stroke: "grey",
        fill: "grey",
      },
      insert: {
        ...basePoint,
        stroke: "black",
        fill: "aliceblue",
      },
      hovering: {
        ...basePoint,
        stroke: "black",
        fill: "grey",
      },
      dragging: {
        ...basePoint,
        stroke: "black",
        fill: "lightblue",
      },
      selected: {
        ...basePoint,
        fill: "violet",
        stroke: "red",
      },
      hoveringSelected: {
        ...basePoint,
        fill: "red",
        stroke: "black",
      },
    },
  },
};

const draw = {
  canvas: {
    axis(rc: RoughCanvas, width: number, height: number) {
      rc.line(
        theme.padding,
        theme.padding * 2,
        theme.padding,
        height - theme.padding * 2,
        theme.base
      );
      rc.line(
        padding * 2,
        height - theme.padding,
        width - theme.padding * 2,
        height - theme.padding,
        theme.base
      );
    },

    mouseTicks(rc: RoughCanvas, action: Action, height: number) {
      const y = getYPosition(action);
      if (y != null) {
        rc.line(padding / 2, y, padding * 1.5 + 4, y, opts);
      }

      const x = getXPosition(action);
      if (x != null) {
        rc.line(
          x,
          height - (theme.padding * 1.5 + 4),
          x,
          height - theme.padding / 2,
          theme.base
        );
      }
    },
  },

  all: {
    selections(
      rc: RoughCanvas,
      scene: SceneReader,
      action: HasSelections,
      width: number,
      height: number
    ) {
      const points = scene.points();
      for (const point of action.selected.points) {
        draw.point.selected(rc, points[point].geom);
      }

      const lines = scene.lines();
      for (const id of action.selected.lines) {
        draw.lines.selected(rc, lines[id].geom, width, height);
      }
    },

    all(
      rc: RoughCanvas,
      scene: SceneReader,
      width: number,
      height: number,
      except?: Set<string>
    ) {
      draw.lines.all(rc, scene, width, height, except);
      draw.point.all(rc, scene, except);
    },
  },

  lines: {
    all(
      rc: RoughCanvas,
      scene: SceneReader,
      width: number,
      height: number,
      except?: Set<string>
    ) {
      for (const line of Object.values(scene.lines())) {
        if (except && except.has(line.id)) {
          continue;
        }

        draw.lines.rest(rc, line.geom, width, height);
      }
    },

    insert: {
      horizontal(rc: RoughCanvas, { x, y }: Position, width: number) {
        rc.line(
          Math.max(x - 500, theme.padding * 3),
          y,
          Math.min(x + 500, width - theme.padding * 3),
          y,
          theme.line.insert
        );
      },

      vertical(rc: RoughCanvas, { x, y }: Position, height: number) {
        rc.line(
          x,
          Math.max(y - 500, theme.padding * 3),
          x,
          Math.min(y + 500, height - theme.padding * 3),
          theme.line.insert
        );
      },
    },

    rest(
      rc: RoughCanvas,
      geom: Flatten.Segment,
      width: number,
      height: number
    ) {
      drawLineWithOpts(rc, geom, width, height, theme.line.rest);
    },

    dragging(
      rc: RoughCanvas,
      geom: Flatten.Segment,
      width: number,
      height: number
    ) {
      drawLineWithOpts(rc, geom, width, height, theme.line.dragging);
    },

    hovering(
      rc: RoughCanvas,
      geom: Flatten.Segment,
      width: number,
      height: number
    ) {
      drawLineWithOpts(rc, geom, width, height, theme.line.hovering);
    },

    selected(
      rc: RoughCanvas,
      geom: Flatten.Segment,
      width: number,
      height: number
    ) {
      drawLineWithOpts(rc, geom, width, height, theme.line.selected);
    },

    hoveringSelected(
      rc: RoughCanvas,
      geom: Flatten.Segment,
      width: number,
      height: number
    ) {
      drawLineWithOpts(rc, geom, width, height, theme.line.hoveringSelected);
    },
  },
  point: {
    all(rc: RoughCanvas, scene: SceneReader, except?: Set<string>) {
      for (const point of Object.values(scene.points())) {
        if (except && except.has(point.id)) {
          continue;
        }

        draw.point.rest(rc, point.geom);
      }
    },

    insert(rc: RoughCanvas, { x, y }: Position) {
      rc.circle(x, y, theme.point.radius.insert, theme.point.options.insert);
    },

    rest(rc: RoughCanvas, geom: Flatten.Point) {
      rc.circle(
        geom.x,
        geom.y,
        theme.point.radius.rest,
        theme.point.options.rest
      );
    },

    selected(rc: RoughCanvas, geom: Flatten.Point) {
      rc.circle(
        geom.x,
        geom.y,
        theme.point.radius.selected,
        theme.point.options.selected
      );
    },

    dragging(rc: RoughCanvas, geom: Flatten.Point) {
      rc.circle(
        geom.x,
        geom.y,
        theme.point.radius.dragging,
        theme.point.options.dragging
      );
    },

    hovering(rc: RoughCanvas, geom: Flatten.Point) {
      rc.circle(
        geom.x,
        geom.y,
        theme.point.radius.hovering,
        theme.point.options.hovering
      );
    },

    hoveringSelected(rc: RoughCanvas, geom: Flatten.Point) {
      rc.circle(
        geom.x,
        geom.y,
        theme.point.radius.hoveringSelected,
        theme.point.options.hoveringSelected
      );
    },
  },
};

const drawLineWithOpts = (
  rc: RoughCanvas,
  geom: Flatten.Segment,
  width: number,
  height: number,
  options: Options
) => {
  rc.line(
    Math.max(geom.start.x, theme.padding),
    Math.max(geom.start.y, theme.padding),
    Math.min(geom.end.x, width),
    Math.min(geom.end.y, height),
    options
  );
};

export const render = (
  scene: SceneReader,
  action: Action,
  el: HTMLCanvasElement,
  width: number,
  height: number
) => {
  el.getContext("2d").clearRect(0, 0, width, height);
  const rc = rough.canvas(el);
  draw.canvas.axis(rc, width, height);
  draw.canvas.mouseTicks(rc, action, height);
  renderAction(rc, scene, action, width, height);
};

const renderAction = (
  rc: RoughCanvas,
  scene: SceneReader,
  action: Action,
  width: number,
  height: number
) => {
  const points = scene.points();
  const lines = scene.lines();
  switch (action.kind) {
    case ActionKind.None: {
      // TODO(Dan) polygons
      draw.point.all(rc, scene);
      return;
    }

    case ActionKind.CreateLine:
    case ActionKind.CreateIntersection:
    case ActionKind.CreateIntersectionAlongLine:
    case ActionKind.CreateIntersectionAtIntersection:
    case ActionKind.Interacting: {
      draw.all.all(rc, scene, width, height);
      return;
    }

    case ActionKind.Selecting: {
      const except = new Set<string>([
        ...action.selected.lines,
        ...action.selected.points,
      ]);

      draw.all.all(rc, scene, width, height, except);
      draw.all.selections(rc, scene, action, width, height);
      return;
    }

    case ActionKind.PlacingLine: {
      draw.all.all(rc, scene, width, height);

      switch (action.direction) {
        case Direction.Horizontal: {
          draw.lines.insert.horizontal(rc, action, width);
          break;
        }

        case Direction.Vertical: {
          draw.lines.insert.vertical(rc, action, height);
          break;
        }
      }

      return;
    }

    case ActionKind.TouchingLine:
    case ActionKind.HoveringLine: {
      const drawn = new Set<string>(action.hovered.line);

      draw.all.all(rc, scene, width, height, drawn);
      draw.lines.hovering(rc, lines[action.hovered.line].geom, width, height);
      return;
    }

    case ActionKind.TouchingSelectedLineWhileSelecting:
    case ActionKind.HoveringSelectedLineWhileSelecting:
    case ActionKind.TouchingLineWhileSelecting:
    case ActionKind.HoveringLineWhileSelecting: {
      const except = new Set<string>([
        ...action.selected.points,
        ...action.selected.lines,
        action.hovered.line,
      ]);

      draw.all.all(rc, scene, width, height, except);
      draw.all.selections(rc, scene, action, width, height);

      if (action.kind === ActionKind.HoveringLineWhileSelecting) {
        draw.lines.hovering(rc, lines[action.hovered.line].geom, width, height);
      } else {
        draw.lines.hoveringSelected(
          rc,
          lines[action.hovered.line].geom,
          width,
          height
        );
      }

      return;
    }

    case ActionKind.DraggingLine: {
      draw.all.all(
        rc,
        scene,
        width,
        height,
        new Set<string>([action.dragged.line])
      );

      draw.lines.dragging(rc, lines[action.dragged.line].geom, width, height);
      return;
    }

    case ActionKind.DraggingLineWhileSelecting: {
      draw.all.all(
        rc,
        scene,
        width,
        height,
        new Set<string>([
          ...action.selected.points,
          ...action.selected.lines,
          action.dragged.line,
        ])
      );

      draw.all.selections(rc, scene, action, width, height);
      draw.lines.dragging(rc, lines[action.dragged.line].geom, width, height);
      return;
    }

    case ActionKind.DraggingIntersectionWhileSelecting: {
      draw.all.all(
        rc,
        scene,
        width,
        height,
        new Set<string>([
          ...action.selected.points,
          ...action.selected.lines,
          action.dragged.point,
        ])
      );

      draw.all.selections(rc, scene, action, width, height);
      draw.point.dragging(rc, points[action.dragged.point].geom);
      return;
    }

    case ActionKind.DraggingSelectionByLine: {
      draw.all.all(
        rc,
        scene,
        width,
        height,
        new Set<string>([
          ...action.selected.points,
          ...action.selected.lines,
          action.hovered.line,
        ])
      );

      draw.all.selections(rc, scene, action, width, height);
      draw.lines.dragging(rc, lines[action.hovered.line].geom, width, height);
      return;
    }

    case ActionKind.DraggingSelectionByPoint: {
      draw.all.all(
        rc,
        scene,
        width,
        height,
        new Set<string>([
          ...action.selected.points,
          ...action.selected.lines,
          action.hovered.point,
        ])
      );

      draw.all.selections(rc, scene, action, width, height);
      draw.point.dragging(rc, points[action.hovered.point].geom);
      return;
    }

    case ActionKind.PlacingIntersection: {
      draw.all.all(rc, scene, width, height);
      draw.lines.insert.vertical(rc, action, height);
      draw.lines.insert.horizontal(rc, action, width);
      draw.point.insert(rc, action);
      return;
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      const drawn = new Set<string>();
      const axis = {};

      for (const id of action.hovered.lines) {
        const line = lines[id];
        axis[line.direction] = line;
        drawn.add(line.id);
        draw.lines.hovering(rc, line.geom, width, height);
      }

      draw.point.insert(rc, {
        x: axis[Direction.Vertical].geom.start.x,
        y: axis[Direction.Horizontal].geom.start.y,
      });

      draw.all.all(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.PlacingIntersectionAlongLine: {
      const drawn = new Set<string>();
      const lines = scene.lines();
      const line = lines[action.hovered.line];

      drawn.add(line.id);
      draw.lines.hovering(rc, line.geom, width, height);

      switch (line.direction) {
        case Direction.Vertical: {
          draw.point.insert(rc, { x: line.geom.start.x, y: action.y });
          break;
        }

        case Direction.Horizontal: {
          draw.point.insert(rc, { x: action.x, y: line.geom.start.y });
          break;
        }
      }

      draw.all.all(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.TouchingIntersection:
    case ActionKind.HoveringIntersection: {
      const drawn = new Set<string>([action.hovered.point]);
      draw.all.all(rc, scene, width, height, drawn);

      draw.point.hovering(rc, points[action.hovered.point].geom);
      return;
    }

    case ActionKind.TouchingSelectedIntersectionWhileSelecting:
    case ActionKind.HoveringSelectedIntersectionWhileSelecting:
    case ActionKind.TouchingIntersectionWhileSelecting:
    case ActionKind.HoveringIntersectionWhileSelecting: {
      const except = new Set<string>([
        ...action.selected.points,
        ...action.selected.lines,
        action.hovered.point,
      ]);

      draw.all.all(rc, scene, width, height, except);
      draw.all.selections(rc, scene, action, width, height);

      const points = scene.points();
      if (action.kind === ActionKind.HoveringIntersectionWhileSelecting) {
        draw.point.hovering(rc, points[action.hovered.point].geom);
      } else {
        draw.point.hoveringSelected(rc, points[action.hovered.point].geom);
      }
      return;
    }

    case ActionKind.DraggingIntersection: {
      const drawn = new Set<string>();
      draw.point.dragging(rc, points[action.dragged.point].geom);

      draw.all.all(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.UIHoveringElement: {
      const drawn = new Set<string>([action.hovered]);
      draw.point.all(rc, scene, drawn);

      const el = scene.lookup(action.hovered);

      switch (el.kind) {
        case Kind.Line: {
          draw.lines.hovering(rc, el.geom, width, height);
          break;
        }

        case Kind.Point: {
          draw.point.hovering(rc, el.geom);
          break;
        }
      }

      return;
    }

    case ActionKind.UIHoveringElementWhileSelecting: {
      const drawn = new Set<string>([action.hovered]);
      const el = scene.lookup(action.hovered);

      switch (el.kind) {
        case Kind.Line: {
          if (action.selected.lines.includes(el.id)) {
            draw.lines.hoveringSelected(rc, el.geom, width, height);
          } else {
            draw.lines.selected(rc, el.geom, width, height);
          }
          break;
        }

        case Kind.Point: {
          if (action.selected.points.includes(el.id)) {
            draw.point.hoveringSelected(rc, el.geom);
          } else {
            draw.point.selected(rc, el.geom);
          }
          break;
        }
      }

      for (const id of selectedElements(action)) {
        if (!drawn.has(id)) {
          drawn.add(id);
          const el = scene.lookup(id);

          switch (el.kind) {
            case Kind.Line: {
              draw.lines.selected(rc, el.geom, width, height);
              break;
            }

            case Kind.Point: {
              draw.point.selected(rc, el.geom);
              break;
            }
          }
        }
      }

      draw.all.all(rc, scene, width, height, drawn);

      return;
    }
  }
};
