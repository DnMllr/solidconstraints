import Flatten from "@flatten-js/core";
import rough from "roughjs";
import { Options } from "roughjs/bin/core";
import { Position } from "../scene";
import { Theme, defaultTheme } from "./theme";

export interface DrawCommands {
  clear(): void;
  canvas: CanvasCommands;
  lines: LineCommands;
  points: PointCommands;
}

interface CanvasCommands {
  axis(): void;
  mouseTicks(position: Partial<Position>): void;
}

interface StandardCommands<T> {
  rest(segment: T): void;
  dragging(segment: T): void;
  hovering(segment: T): void;
  selected(segment: T): void;
  hoveringSelected(segment: T): void;
}

interface LineCommands extends StandardCommands<Flatten.Segment> {
  insert: LineInsertCommands;
}

interface LineInsertCommands {
  horizontal(position: Position): void;
  vertical(position: Position): void;
}

interface PointCommands extends StandardCommands<Position> {
  insert(point: Position): void;
}

export interface DrawOptions {
  el: HTMLCanvasElement;
  width: number;
  height: number;
  theme?: Theme;
}

export const pen = (options: DrawOptions): DrawCommands => {
  const { el, width, height } = options;
  const rc = rough.canvas(el);
  const theme = options.theme ?? defaultTheme;

  const drawLineWithOpts = (geom: Flatten.Segment, options: Options) => {
    rc.line(
      Math.max(geom.start.x, theme.padding),
      Math.max(geom.start.y, theme.padding),
      Math.min(geom.end.x, width),
      Math.min(geom.end.y, height),
      options
    );
  };

  return {
    clear() {
      const ctx = el.getContext("2d");
      if (!ctx) {
        throw new Error("browser is too old");
      }

      ctx.clearRect(0, 0, width, height);
    },

    canvas: {
      axis() {
        rc.line(
          theme.padding,
          theme.padding * 2,
          theme.padding,
          height - theme.padding * 2,
          theme.base
        );
        rc.line(
          theme.padding * 2,
          height - theme.padding,
          width - theme.padding * 2,
          height - theme.padding,
          theme.base
        );
      },

      mouseTicks({ x, y }: Partial<Position>) {
        if (y != null) {
          rc.line(theme.padding / 2, y, theme.padding * 1.5 + 4, y, theme.base);
        }

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
      insert: {
        horizontal({ x, y }: Position) {
          rc.line(
            Math.max(x - 500, theme.padding * 3),
            y,
            Math.min(x + 500, width - theme.padding * 3),
            y,
            theme.line.insert
          );
        },

        vertical({ x, y }: Position) {
          rc.line(
            x,
            Math.max(y - 500, theme.padding * 3),
            x,
            Math.min(y + 500, height - theme.padding * 3),
            theme.line.insert
          );
        },
      },

      rest(geom: Flatten.Segment) {
        drawLineWithOpts(geom, theme.line.rest);
      },

      dragging(geom: Flatten.Segment) {
        drawLineWithOpts(geom, theme.line.dragging);
      },

      hovering(geom: Flatten.Segment) {
        drawLineWithOpts(geom, theme.line.hovering);
      },

      selected(geom: Flatten.Segment) {
        drawLineWithOpts(geom, theme.line.selected);
      },

      hoveringSelected(geom: Flatten.Segment) {
        drawLineWithOpts(geom, theme.line.hoveringSelected);
      },
    },
    points: {
      insert({ x, y }: Position) {
        rc.circle(x, y, theme.point.radius.insert, theme.point.options.insert);
      },

      rest(geom: Position) {
        rc.circle(
          geom.x,
          geom.y,
          theme.point.radius.rest,
          theme.point.options.rest
        );
      },

      selected(geom: Position) {
        rc.circle(
          geom.x,
          geom.y,
          theme.point.radius.selected,
          theme.point.options.selected
        );
      },

      dragging(geom: Position) {
        rc.circle(
          geom.x,
          geom.y,
          theme.point.radius.dragging,
          theme.point.options.dragging
        );
      },

      hovering(geom: Position) {
        rc.circle(
          geom.x,
          geom.y,
          theme.point.radius.hovering,
          theme.point.options.hovering
        );
      },

      hoveringSelected(geom: Position) {
        rc.circle(
          geom.x,
          geom.y,
          theme.point.radius.hoveringSelected,
          theme.point.options.hoveringSelected
        );
      },
    },
  };
};
