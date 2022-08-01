import Flatten from "@flatten-js/core";

import { BaseScene, Direction, Intersection, Line } from "./abstractGeometry";
import { RecordOf } from "../../../../lib/utilities";
import { HasID } from "./id";
import { toRecord } from "./utilities";

const ArbitrarilyBig = 9999999999999;

const { point, segment } = Flatten;

interface GeoObject<T> {
  geom: T;
}

export type WithGeometry<T, G> = T & GeoObject<G>;
export type GeometricRecordOf<T, G> = RecordOf<WithGeometry<T, G>>;

export const concretizeLine = (
  line: Line
): WithGeometry<Line, Flatten.Segment> => {
  switch (line.direction) {
    case Direction.Horizontal: {
      return {
        ...line,
        geom: segment(point(0, line.v), point(ArbitrarilyBig, line.v)),
      };
    }

    case Direction.Vertical: {
      return {
        ...line,
        geom: segment(point(line.v, 0), point(line.v, ArbitrarilyBig)),
      };
    }
  }
};

export const createXLines = (
  scene: BaseScene
): WithGeometry<Line, Flatten.Segment>[] =>
  scene.grid.xs.map((key) => concretizeLine(scene.lines[key]));

export const createYLines = (
  scene: BaseScene
): WithGeometry<Line, Flatten.Segment>[] =>
  scene.grid.ys.map((key) => concretizeLine(scene.lines[key]));

const assertSingle = <T>(list: T[]): T => {
  if (list.length !== 1) {
    throw new Error("expected only a single element in array");
  }

  return list[0];
};

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

export const createIntersections = (
  lines: GeometricRecordOf<Line, Flatten.Segment>,
  intersections: RecordOf<Intersection>
): GeometricRecordOf<Intersection, Flatten.Point> =>
  mapGeoObject(intersections, (i) =>
    assertSingle(lines[i.x].geom.intersect(lines[i.y].geom))
  );
