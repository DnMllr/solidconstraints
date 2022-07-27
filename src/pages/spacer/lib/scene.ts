import Flatten from "@flatten-js/core";
import { nanoid } from "nanoid";
import { batch, createMemo } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { Action, ActionKind } from "./actions";

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
  cache: RecordOf<string> = {};

  next(key: string): string {
    if (this.cache[key] != null) {
      return this.cache[key];
    }

    this.cache[key] = nanoid();

    return this.cache[key];
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

interface HasID {
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
  | WithGeometry<Line, Flatten.Segment>
  | WithGeometry<Intersection, Flatten.Point>;

interface GeoObject<T> {
  geom: T;
}

const makeBaseScene = (): BaseScene => ({
  id: nanoid(),
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

interface FlattenScene extends HasID {
  grid: Grid;
  lines: GeometricRecordOf<Line, Flatten.Line>;
  intersections: GeometricRecordOf<Intersection, Flatten.Point>;
  segments: GeometricRecordOf<Segment, Flatten.Segment>;
  polys: GeometricRecordOf<Poly, Flatten.Polygon>;
  set: Flatten.PlanarSet;
}

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

const createRings = (
  points: GeometricRecordOf<Intersection, Flatten.Point>,
  rings: RecordOf<Ring>
): GeometricRecordOf<Ring, Flatten.Point[]> =>
  mapGeoObject(rings, (r) => r.points.map((p) => points[p].geom));

const createSegments = (
  points: GeometricRecordOf<Intersection, Flatten.Point>,
  segments: RecordOf<Segment>
): GeometricRecordOf<Segment, Flatten.Segment> =>
  mapGeoObject(segments, (s) => segment(points[s.a].geom, points[s.b].geom));

const createPolys = (
  rings: GeometricRecordOf<Ring, Flatten.Point[]>,
  polys: RecordOf<Poly>
): GeometricRecordOf<Poly, Flatten.Polygon> =>
  mapGeoObject(polys, (p) => {
    const poly = new Flatten.Polygon(rings[p.exterior].geom);
    for (let holeID of p.holes) {
      poly.addFace(rings[holeID].geom);
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
  const polygons = createMemo(() => createPolys(rings(), scene.polys));
  const all = createMemo(() => {
    return {
      ...lines(),
      ...points(),
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
      for (let key in shapes) {
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
    if (reader.lines()[id] != null) {
      return id;
    }

    const line: Line = {
      id,
      v,
      direction: Direction.Horizontal,
      kind: Kind.Line,
    };

    set(
      produce((s) => {
        s.lines[id] = line;
        s.grid.xs.push(id);
        s.grid.xs.sort((a, b) => s.lines[a].v - s.lines[b].v);
      })
    );

    return id;
  };

  const dragHorizontalLine = (id: string, y: number) => {
    set("lines", id, "v", y);
  };

  const createVerticalLine = (value: number): string => {
    const v = Math.round(value);
    const key = `line:y:${v}`;
    const id = ids.next(key);
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
      produce((s) => {
        s.lines[id] = line;
        s.grid.ys.push(id);
        s.grid.ys.sort((a, b) => s.lines[a].v - s.lines[b].v);
      })
    );

    return id;
  };

  const dragVerticalLine = (id: string, x: number) => {
    set("lines", id, "v", x);
  };

  const createIntersection = (x: string, y: string): string => {
    const key = `intersection:${x}:${y}`;
    const id = ids.next(key);
    if (reader.points()[id] != null) {
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

  const dragIntersection = (id: string, x: number, y: number) => {
    const point = reader.points()[id];
    batch(() => {
      dragHorizontalLine(point.x, y);
      dragVerticalLine(point.y, x);
    });
  };

  return {
    updateWithAction(action: Action, grid?: Position) {
      switch (action.kind) {
        case ActionKind.CreateHorizontalLine:
          createHorizontalLine(action.y);
          return;
        case ActionKind.CreateVerticalLine:
          createVerticalLine(action.x);
          return;
        case ActionKind.CreateIntersection:
          createIntersection(
            createHorizontalLine(action.y),
            createVerticalLine(action.x)
          );
          return;
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
