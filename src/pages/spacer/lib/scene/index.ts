import Flatten from "@flatten-js/core";
import { nanoid } from "nanoid";
import { createMemo } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";

import { Action, ActionKind, HasSelections } from "../actions";
import { RecordOf } from "../../../../lib/utilities";
import {
  BaseScene,
  Direction,
  Grid,
  Intersection,
  Kind,
  Line,
} from "./abstractGeometry";
import {
  GeometricRecordOf,
  createXLines,
  createYLines,
  createIntersections,
} from "./concretion";
import { Geometry, GeoLine, Position } from "./geometry";
import { Identifier } from "./id";
import { toRecord } from "./utilities";

export type { Position } from "./geometry";

const buffer = 7;
const { point } = Flatten;

const makeBaseScene = (): BaseScene => ({
  id: nanoid(),
  all: {},
  grid: {
    xs: [],
    ys: [],
  },
  lines: {},
  intersections: {},
});

export interface SceneReader {
  grid(): Grid;
  lines(): GeometricRecordOf<Line, Flatten.Segment>;
  points(): GeometricRecordOf<Intersection, Flatten.Point>;
  hit(x: number, y: number): Geometry[];
  lookup(id: string): Geometry | undefined;
}

export interface SceneWriter {
  updateWithAction(action: Action, grid?: Position): void;
  applyGrid(grid?: Position): void;
}

export type SceneCtl = SceneReader & SceneWriter;

const createSceneReader = (
  scene: ReturnType<typeof createStore<BaseScene>>[0]
): SceneReader => {
  const xLines = createMemo(() => createXLines(scene));
  const yLines = createMemo(() => createYLines(scene));
  const lines = createMemo(() => toRecord(xLines().concat(yLines())));
  const points = createMemo(() =>
    createIntersections(lines(), scene.intersections)
  );

  const all = createMemo(() => {
    return {
      ...lines(),
      ...points(),
    };
  });

  const planarset = createMemo(() =>
    Object.values(all()).reduce(
      (m, o) => m.add(o.geom),
      new Flatten.PlanarSet()
    )
  );
  const lookup = (id: string): Geometry | undefined => all()[id];
  const hit = (x: number, y: number): Geometry[] => {
    const shapes = all();
    const find = (shape: Flatten.IndexableElement): Geometry => {
      for (const key in shapes) {
        if (shapes[key].geom === shape) {
          return shapes[key];
        }
      }
      throw new Error("couldn't find geometry");
    };
    const objects = planarset()
      .search(new Flatten.Box(x - buffer, y - buffer, x + buffer, y + buffer))
      .map(find);
    objects.sort(
      (a, b) =>
        a.geom.distanceTo(point(x, y))[0] - b.geom.distanceTo(point(x, y))[0]
    );
    return objects;
  };

  return {
    lookup,
    hit,
    grid: () => scene.grid,
    lines: () => lines(),
    points: () => points(),
  };
};

const createSceneWriter = (
  reader: SceneReader,
  set: SetStoreFunction<BaseScene>
): SceneWriter => {
  const ids = new Identifier();

  const createHorizontalLine = (value: number): string => {
    const v = Math.round(value);
    const key = `line:x:${v}`;
    const id = ids.next(key);

    /* eslint-disable @typescript-eslint/no-unnecessary-condition -- typescript is being too generous here and the linter can't see that we may have a cache miss */
    if (reader.lines()[id]) {
      return id;
    }

    const line: Line = {
      id,
      v,
      direction: Direction.Horizontal,
      kind: Kind.Line,
    };

    set(
      produce((s: BaseScene) => {
        s.lines[id] = line;
        s.grid.xs.push(id);
        s.grid.xs.sort((a, b) => s.lines[a].v - s.lines[b].v);
      })
    );

    return id;
  };

  const dragHorizontalLine = (id: string, y: number, grid?: Position) => {
    set(
      "lines",
      produce((lines: RecordOf<Line>) => {
        const offset = grid?.y ?? 1;
        const linesInOrder = reader.grid().xs.map((id) => lines[id]);
        const index = linesInOrder.findIndex((l) => l.id === id);
        let dependentLines = linesInOrder.slice(0, index);
        dependentLines.reverse();

        let currentY = y;
        lines[id].v = currentY;
        currentY -= offset;

        for (const line of dependentLines) {
          if (line.v > currentY) {
            lines[line.id].v = currentY;
            currentY -= offset;
          }
        }

        dependentLines = linesInOrder.slice(index + 1);

        currentY = y + offset;

        for (const line of dependentLines) {
          if (line.v < currentY) {
            lines[line.id].v = currentY;
            currentY += offset;
          }
        }
      })
    );
  };

  const createVerticalLine = (value: number): string => {
    const v = Math.round(value);
    const key = `line:y:${v}`;
    const id = ids.next(key);

    /* eslint-disable @typescript-eslint/no-unnecessary-condition -- typescript is being too generous here and the linter can't see that we may have a cache miss */
    if (reader.lines()[id] != null) {
      return id;
    }

    const line: Line = {
      id,
      v,
      direction: Direction.Vertical,
      kind: Kind.Line,
    };

    set(
      produce((s: BaseScene) => {
        s.lines[id] = line;
        s.grid.ys.push(id);
        s.grid.ys.sort((a, b) => s.lines[a].v - s.lines[b].v);
      })
    );

    return id;
  };

  const dragVerticalLine = (id: string, x: number, grid?: Position) => {
    set(
      "lines",
      produce((lines: RecordOf<Line>) => {
        const offset = grid?.x ?? 1;
        const linesInOrder = reader.grid().ys.map((id) => lines[id]);
        const index = linesInOrder.findIndex((l) => l.id === id);
        let dependentLines = linesInOrder.slice(0, index);
        dependentLines.reverse();

        let currentX = x;
        lines[id].v = currentX;
        currentX -= offset;

        for (const line of dependentLines) {
          if (line.v > currentX) {
            lines[line.id].v = currentX;
            currentX -= offset;
          }
        }

        dependentLines = linesInOrder.slice(index + 1);

        currentX = x + offset;

        for (const line of dependentLines) {
          if (line.v < currentX) {
            lines[line.id].v = currentX;
            currentX += offset;
          }
        }
      })
    );
  };

  const createIntersection = (x: string, y: string): string => {
    const key = `intersection:${x}:${y}`;
    const id = ids.next(key);
    /* eslint-disable @typescript-eslint/no-unnecessary-condition -- typescript is being too generous here and the linter can't see that we may have a cache miss */
    if (reader.points()[id]) {
      return id;
    }

    const point: Intersection = {
      id,
      x,
      y,
      kind: Kind.Point,
    };

    set("intersections", id, point);

    return id;
  };

  const applyGrid = ({ x, y }: Position) => {
    set(
      "lines",
      produce((lines: RecordOf<Line>) => {
        let min = 0;
        for (const id of reader.grid().xs) {
          const el = lines[id];
          el.v /= y;
          el.v = Math.round(el.v);
          el.v *= y;
          el.v = Math.max(min, el.v);
          min = el.v + y;
        }

        min = 0;
        for (const id of reader.grid().ys) {
          const el = lines[id];
          el.v /= x;
          el.v = Math.round(el.v);
          el.v *= x;
          el.v = Math.max(min, el.v);
          min = el.v + x;
        }
      })
    );
  };

  const dragSelectionByDelta = (
    delta: Flatten.Point,
    action: HasSelections,
    grid?: Position
  ) => {
    const points = reader.points();
    const lines = reader.lines();
    const lineSet = new Set(action.selected.lines);
    for (const id of action.selected.points) {
      const point = points[id];
      lineSet.add(point.x);
      lineSet.add(point.y);
    }

    const selectedLines = Array.from(lineSet).map((id) => lines[id]);
    const linePositions = selectedLines.map((l) => {
      if (l.direction === Direction.Vertical) {
        return l.v + delta.x;
      } else {
        return l.v + delta.y;
      }
    });

    for (let i = 0; i < selectedLines.length; i++) {
      const line = selectedLines[i];
      const p = linePositions[i];

      if (line.direction === Direction.Vertical) {
        dragVerticalLine(line.id, p, grid);
      } else {
        dragHorizontalLine(line.id, p, grid);
      }
    }
  };

  return {
    updateWithAction(action: Action, grid?: Position) {
      switch (action.kind) {
        case ActionKind.CreateLine: {
          switch (action.direction) {
            case Direction.Horizontal: {
              createHorizontalLine(action.y);
              return;
            }

            case Direction.Vertical: {
              createVerticalLine(action.x);
              return;
            }
          }
        }

        case ActionKind.CreateIntersection: {
          createIntersection(
            createHorizontalLine(action.y),
            createVerticalLine(action.x)
          );
          return;
        }

        case ActionKind.CreateIntersectionAlongLine: {
          const line = reader.lines()[action.hovered.line];

          switch (line.direction) {
            case Direction.Vertical: {
              createIntersection(createHorizontalLine(action.y), line.id);
              return;
            }

            case Direction.Horizontal: {
              createIntersection(line.id, createVerticalLine(action.x));
              return;
            }
          }
        }

        case ActionKind.CreateIntersectionAtIntersection: {
          const lines: Partial<{ [key in Direction]: GeoLine }> = {};

          for (const lineID of action.hovered.lines) {
            const line = reader.lines()[lineID];
            lines[line.direction] = line;
          }

          const x = lines[Direction.Horizontal]?.id;
          const y = lines[Direction.Vertical]?.id;

          if (x === undefined || y === undefined) {
            console.error(
              "malformed action: CreateIntersectionAtIntersection was missing both a horizontal and vertical line"
            );
            return;
          }

          createIntersection(x, y);
          return;
        }

        case ActionKind.DraggingLineWhileSelecting:
        case ActionKind.DraggingLine: {
          const line = reader.lines()[action.dragged.line];
          switch (line.direction) {
            case Direction.Vertical: {
              dragVerticalLine(line.id, action.x, grid);
              return;
            }

            case Direction.Horizontal: {
              dragHorizontalLine(line.id, action.y, grid);
              return;
            }
          }
        }

        case ActionKind.DraggingIntersectionWhileSelecting:
        case ActionKind.DraggingIntersection: {
          const points = reader.points();
          const intersection = points[action.dragged.point];
          dragVerticalLine(intersection.y, action.x, grid);
          dragHorizontalLine(intersection.x, action.y, grid);
          return;
        }

        case ActionKind.DraggingSelectionByLine: {
          const lines = reader.lines();
          const line = lines[action.hovered.line];
          const delta =
            line.direction === Direction.Vertical
              ? point(action.x - line.v, 0)
              : point(0, action.y - line.v);
          dragSelectionByDelta(delta, action, grid);
          return;
        }

        case ActionKind.DraggingSelectionByPoint: {
          const points = reader.points();
          const lines = reader.lines();
          const p = points[action.hovered.point];
          const xLine = lines[p.x];
          const yLine = lines[p.y];
          const delta = point(action.x - xLine.v, action.y - yLine.v);
          dragSelectionByDelta(delta, action, grid);
          return;
        }
      }
    },
    applyGrid(grid?: Position) {
      if (grid) {
        applyGrid(grid);
      }
    },
  };
};

const createSceneCtl = ([scene, setScene]: ReturnType<
  typeof createStore<BaseScene>
>): SceneCtl => {
  const reader = createSceneReader(scene);
  const writer = createSceneWriter(reader, setScene);
  return {
    ...reader,
    ...writer,
  };
};

export function createScene(): SceneCtl {
  return createSceneCtl(createStore(makeBaseScene()));
}
