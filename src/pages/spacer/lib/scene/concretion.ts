import Flatten from "@flatten-js/core";

import { BaseScene, Intersection, Line } from "./abstractGeometry";
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
