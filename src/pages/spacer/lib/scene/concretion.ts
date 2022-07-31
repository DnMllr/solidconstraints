import Flatten from "@flatten-js/core";

import {
  BaseScene,
  Intersection,
  Line,
  Poly,
  Ring,
  Segment,
} from "./abstractGeometry";
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

export const createXLines = (
  scene: BaseScene
): WithGeometry<Line, Flatten.Segment>[] =>
  scene.grid.xs.map((key) => ({
    ...scene.lines[key],
    geom: segment(
      point(0, scene.lines[key].v),
      point(ArbitrarilyBig, scene.lines[key].v)
    ),
  }));

export const createYLines = (
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

export const createRings = (
  points: GeometricRecordOf<Intersection, Flatten.Point>,
  rings: RecordOf<Ring>
): GeometricRecordOf<Ring, Flatten.Polygon> =>
  mapGeoObject(rings, (r) => {
    return new Flatten.Polygon(polySort(r.points.map((p) => points[p].geom)));
  });

export const createSegments = (
  points: GeometricRecordOf<Intersection, Flatten.Point>,
  segments: RecordOf<Segment>
): GeometricRecordOf<Segment, Flatten.Segment> =>
  mapGeoObject(segments, (s) => segment(points[s.a].geom, points[s.b].geom));

export const createPolys = (
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
