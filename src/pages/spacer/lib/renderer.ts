import { SceneReader } from "./scene";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import { Action, ActionKind, getXPosition, getYPosition } from "./actions";
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
      stroke: "lavenderblush",
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
      rest: 3,
      hovering: 4,
      dragging: 3,
      insert: 5,
      selected: 4,
      hoveringSelected: 5,
    },
    options: {
      rest: {
        stroke: "lightgrey",
      },
      insert: {
        stroke: "linen",
      },
      hovering: {
        stroke: "grey",
      },
      dragging: {
        stroke: "black",
      },
      selected: {
        stroke: "violet",
      },
      hoveringSelected: {
        stroke: "red",
      },
    },
  },
};

interface Position {
  x: number;
  y: number;
}

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
  switch (action.kind) {
    case ActionKind.None: {
      // TODO(Dan) polygons
      draw.point.all(rc, scene);
      return;
    }

    case ActionKind.CreateHorizontalLine:
    case ActionKind.CreateVerticalLine:
    case ActionKind.CreateIntersection:
    case ActionKind.Interacting: {
      finishScene(rc, scene, width, height);
      return;
    }

    case ActionKind.Selecting: {
      const drawn = new Set<string>();
      const allLines = action.selected.lines.vertical.concat(
        action.selected.lines.horizontal
      );

      const lines = scene.lines();
      for (const id of allLines) {
        drawn.add(id);
        draw.lines.selected(rc, lines[id].geom, width, height);
      }

      const points = scene.points();
      for (const id of action.selected.points) {
        drawn.add(id);
        draw.point.selected(rc, points[id].geom);
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.PlacingVerticalLine: {
      draw.lines.insert.vertical(rc, action, height);
      finishScene(rc, scene, width, height);
      return;
    }

    case ActionKind.PlacingHorizontalLine: {
      draw.lines.insert.horizontal(rc, action, width);
      finishScene(rc, scene, width, height);
      return;
    }

    case ActionKind.TouchingVerticalLine:
    case ActionKind.HoveringVerticalLine: {
      const drawn = new Set<string>();
      const lines = scene.lines();

      for (const id of action.hovered.lines.vertical) {
        drawn.add(id);
        draw.lines.hovering(rc, lines[id].geom, width, height);
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.TouchingHorizontalLine:
    case ActionKind.HoveringHorizontalLine: {
      const drawn = new Set<string>();
      const lines = scene.lines();

      for (const id of action.hovered.lines.horizontal) {
        drawn.add(id);
        draw.lines.hovering(rc, lines[id].geom, width, height);
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.HoveringHorizontalLineWhileSelecting:
    case ActionKind.HoveringVerticalLineWhileSelecting: {
      const drawn = new Set<string>();

      const allHoveredLineIDs = Object.values(action.hovered.lines).reduce(
        (m, l) => m.concat(l),
        []
      );

      const hovered = new Set<string>(allHoveredLineIDs);
      const lines = scene.lines();

      for (const ids of Object.values(action.selected.lines)) {
        for (const id of ids) {
          drawn.add(id);
          if (hovered.has(id)) {
            draw.lines.hoveringSelected(rc, lines[id].geom, width, height);
          } else {
            draw.lines.selected(rc, lines[id].geom, width, height);
          }
        }
      }

      for (const id of allHoveredLineIDs) {
        if (drawn.has(id)) {
          continue;
        }

        drawn.add(id);
        draw.lines.hovering(rc, lines[id].geom, width, height);
      }

      const points = scene.points();
      for (const id of action.selected.points) {
        drawn.add(id);
        draw.point.selected(rc, points[id].geom);
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.DraggingHorizontalLine:
    case ActionKind.DraggingVerticalLine: {
      const drawn = new Set<string>();
      const lines = scene.lines();

      for (const ids of Object.values(action.dragged.lines)) {
        for (const id of ids) {
          drawn.add(id);
          draw.lines.dragging(rc, lines[id].geom, width, height);
        }
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.PlacingIntersection: {
      draw.lines.insert.vertical(rc, action, height);
      draw.lines.insert.horizontal(rc, action, width);
      draw.point.insert(rc, action);

      finishScene(rc, scene, width, height);
      return;
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      const drawn = new Set<string>();
      const lines = scene.lines();
      const v = lines[action.hovered.lines.vertical[0]];
      const h = lines[action.hovered.lines.horizontal[0]];

      drawn.add(v.id);
      draw.lines.hovering(rc, v.geom, width, height);

      drawn.add(h.id);
      draw.lines.hovering(rc, h.geom, width, height);

      draw.point.insert(rc, { x: v.geom.start.x, y: h.geom.start.y });

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.PlacingIntersectionAlongVerticalLine: {
      const drawn = new Set<string>();
      const lines = scene.lines();
      const v = lines[action.hovered.lines.vertical[0]];

      drawn.add(v.id);
      draw.lines.hovering(rc, v.geom, width, height);

      draw.point.insert(rc, { x: v.geom.start.x, y: action.y });

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.PlacingIntersectionAlongHorizontalLine: {
      const drawn = new Set<string>();
      const lines = scene.lines();
      const h = lines[action.hovered.lines.horizontal[0]];

      drawn.add(h.id);
      draw.lines.hovering(rc, h.geom, width, height);

      draw.point.insert(rc, { x: action.x, y: h.geom.start.y });

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.TouchingIntersection:
    case ActionKind.HoveringIntersection: {
      const drawn = new Set<string>();
      const points = scene.points();
      for (const id of action.hovered.points) {
        drawn.add(id);
        draw.point.hovering(rc, points[id].geom);
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.HoveringIntersectionWhileSelecting: {
      const drawn = new Set<string>();
      const hovered = new Set<string>(action.hovered.points);
      const points = scene.points();
      const lines = scene.lines();

      for (const ids of Object.values(action.selected.lines)) {
        for (const id of ids) {
          drawn.add(id);
          draw.lines.selected(rc, lines[id].geom, width, height);
        }
      }

      for (const id of action.selected.points) {
        drawn.add(id);
        if (hovered.has(id)) {
          draw.point.hoveringSelected(rc, points[id].geom);
        } else {
          draw.point.selected(rc, points[id].geom);
        }
      }

      for (const id of action.hovered.points) {
        if (drawn.has(id)) {
          continue;
        }

        drawn.add(id);
        draw.point.hovering(rc, points[id].geom);
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }

    case ActionKind.DraggingIntersection: {
      const drawn = new Set<string>();
      const points = scene.points();
      for (const id of action.dragged.points) {
        drawn.add(id);
        draw.point.dragging(rc, points[id].geom);
      }

      finishScene(rc, scene, width, height, drawn);
      return;
    }
  }
};

const finishScene = (
  rc: RoughCanvas,
  scene: SceneReader,
  width: number,
  height: number,
  except?: Set<string>
) => {
  draw.lines.all(rc, scene, width, height, except);
  draw.point.all(rc, scene, except);
};
