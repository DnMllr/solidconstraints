import Flatten from "@flatten-js/core";
import nanoid from "nanoid";
import { createMemo } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { Action, ActionKind, HasSelections } from "../actions";

const ArbitrarilyBig = 9999999999999;
const buffer = 7;

type RecordOf<T> = Record<string, T>;
type WithGeometry<T, G> = T & GeoObject<G>;
type GeometricRecordOf<T, G> = RecordOf<WithGeometry<T, G>>;

export interface Position {
  x: number;
  y: number;
}

class Identifier {
  cache: RecordOf<string | undefined> = {};

  next(key: string): string {
    let id = this.cache[key];
    if (id !== undefined) {
      return id;
    }

    id = nanoid.nanoid(6);
    this.cache[key] = id;

    return id;
  }
}

export enum Kind {
  Point,
  Line,
  Segment,
  Ring,
  Poly,
}

interface HasKind<T extends Kind> {
  kind: T;
}

export interface HasID {
  id: string;
}

interface Intersection extends HasID, HasKind<Kind.Point> {
  x: string;
  y: string;
}

export enum Direction {
  Horizontal,
  Vertical,
}

interface Line extends HasID, HasKind<Kind.Line> {
  direction: Direction;
  v: number;
}

interface Segment extends HasID, HasKind<Kind.Segment> {
  a: string;
  b: string;
}

interface Ring extends HasID, HasKind<Kind.Ring> {
  points: string[];
}

interface Poly extends HasID, HasKind<Kind.Poly> {
  exterior: string;
  holes: string[];
}

interface Grid {
  xs: string[];
  ys: string[];
}

interface BaseScene extends HasID {
  grid: Grid;
  all: RecordOf<AbstractGeometry>;
  lines: RecordOf<Line>;
  intersections: RecordOf<Intersection>;
  segments: RecordOf<Segment>;
  rings: RecordOf<Ring>;
  polys: RecordOf<Poly>;
}

export type AbstractGeometry = Poly | Ring | Segment | Line | Intersection;
export type Geometry =
  | WithGeometry<Poly, Flatten.Polygon>
  | WithGeometry<Segment, Flatten.Segment>
  | WithGeometry<Ring, Flatten.Polygon>
  | WithGeometry<Line, Flatten.Segment>
  | WithGeometry<Intersection, Flatten.Point>;

interface GeoObject<T> {
  geom: T;
}

const makeBaseScene = (): BaseScene => ({
  id: nanoid.nanoid(),
  all: {},
  grid: {
    xs: [],
    ys: [],
  },
  lines: {},
  intersections: {},
  segments: {},
  rings: {},
  polys: {},
});

const { point, segment } = Flatten;

const createXLines = (
  scene: BaseScene
): WithGeometry<Line, Flatten.Segment>[] =>
  scene.grid.xs.map((key) => ({
    ...scene.lines[key],
    geom: segment(
      point(0, scene.lines[key].v),
      point(ArbitrarilyBig, scene.lines[key].v)
    ),
  }));

const createYLines = (
  scene: BaseScene
): WithGeometry<Line, Flatten.Segment>[] =>
  scene.grid.ys.map((key) => ({
    ...scene.lines[key],
    geom: segment(
      point(scene.lines[key].v, 0),
      point(scene.lines[key].v, ArbitrarilyBig)
    ),
  }));

const assertSingle = <T>(list: T[]): T => {
  if (list.length !== 1) {
    throw new Error("expected only a single element in array");
  }

  return list[0];
};

const toRecord = <T extends HasID>(list: T[]): RecordOf<T> =>
  list.reduce((m, i) => {
    m[i.id] = i;
    return m;
  }, {});

const mapGeoObject = <T extends HasID, G>(
  obj: RecordOf<T>,
  f: (x: T) => G
): GeometricRecordOf<T, G> =>
  toRecord(
    Object.values(obj).map((i) => ({
      ...i,
      geom: f(i),
    }))
  );

const createIntersections = (
  lines: GeometricRecordOf<Line, Flatten.Segment>,
  intersections: RecordOf<Intersection>
): GeometricRecordOf<Intersection, Flatten.Point> =>
  mapGeoObject(intersections, (i) =>
    assertSingle(lines[i.x].geom.intersect(lines[i.y].geom))
  );

const squaredPolar = (point: Flatten.Point, center: Flatten.Point) => {
  return [
    Math.atan2(point.y - center.y, point.x - center.x),
    (point.x - center.x) ** 2 + (point.y - center.y) ** 2,
  ];
};

const polySort = (points: Flatten.Point[]): Flatten.Point[] => {
  const center = point(
    points.reduce((sum, p) => sum + p.x, 0) / points.length,
    points.reduce((sum, p) => sum + p.y, 0) / points.length
  );
  const withPolarAngleAndDistance = points.map((point) => ({
    point,
    squaredPolar: squaredPolar(point, center),
  }));
  withPolarAngleAndDistance.sort(
    (a, b) =>
      a.squaredPolar[0] - b.squaredPolar[0] ||
      a.squaredPolar[1] - b.squaredPolar[1]
  );
  return withPolarAngleAndDistance.map(({ point }) => point);
};

const createRings = (
  points: GeometricRecordOf<Intersection, Flatten.Point>,
  rings: RecordOf<Ring>
): GeometricRecordOf<Ring, Flatten.Polygon> =>
  mapGeoObject(rings, (r) => {
    return new Flatten.Polygon(polySort(r.points.map((p) => points[p].geom)));
  });

const createSegments = (
  points: GeometricRecordOf<Intersection, Flatten.Point>,
  segments: RecordOf<Segment>
): GeometricRecordOf<Segment, Flatten.Segment> =>
  mapGeoObject(segments, (s) => segment(points[s.a].geom, points[s.b].geom));

const createPolys = (
  points: GeometricRecordOf<Intersection, Flatten.Point>,
  rings: GeometricRecordOf<Ring, Flatten.Polygon>,
  polys: RecordOf<Poly>
): GeometricRecordOf<Poly, Flatten.Polygon> =>
  mapGeoObject(polys, (p) => {
    const poly = new Flatten.Polygon(
      polySort(rings[p.exterior].points.map((p) => points[p].geom))
    );
    for (const holeID of p.holes) {
      poly.addFace(polySort(rings[holeID].points.map((p) => points[p].geom)));
    }
    return poly;
  });

export type GeoLine = WithGeometry<Line, Flatten.Segment>;
export type GeoPoint = WithGeometry<Intersection, Flatten.Point>;

export interface SceneReader {
  grid(): Grid;
  lines(): GeometricRecordOf<Line, Flatten.Segment>;
  points(): GeometricRecordOf<Intersection, Flatten.Point>;
  segments(): GeometricRecordOf<Segment, Flatten.Segment>;
  polygons(): GeometricRecordOf<Poly, Flatten.Polygon>;
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
  const segments = createMemo(() => createSegments(points(), scene.segments));
  const rings = createMemo(() => createRings(points(), scene.rings));
  const polygons = createMemo(() =>
    createPolys(points(), rings(), scene.polys)
  );
  const all = createMemo(() => {
    return {
      ...lines(),
      ...points(),
      ...rings(),
      ...segments(),
      ...polygons(),
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
    segments: () => segments(),
    polygons: () => polygons(),
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
