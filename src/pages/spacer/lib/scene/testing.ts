import Flatten from "@flatten-js/core";
import {
  Arbitrary,
  constantFrom,
  double,
  nat,
  oneof,
  tuple,
  uuid,
} from "fast-check";
import { nanoid } from "nanoid";
import { createSceneReader, Position, SceneReader } from ".";
import { Action, allReferencedElementsByKind } from "../actions";
import {
  Kind,
  Line,
  Intersection,
  Direction,
  AbstractGeometry,
} from "./abstractGeometry";
import { concretizeLine } from "./concretion";
import { GeoLine, GeoPoint } from "./geometry";
import { toRecord } from "./utilities";

if (import.meta.env.PROD) {
  console.warn("testing file was required in a PROD build");
}

const { point } = Flatten;

export const arbitraryElementID = (): Arbitrary<string> => uuid();

export const arbitraryDirection = (): Arbitrary<Direction> =>
  constantFrom(Direction.Horizontal, Direction.Vertical);

export const arbitraryPosition = (): Arbitrary<Position> =>
  tuple(
    double({ noDefaultInfinity: true, noNaN: true }),
    double({ noDefaultInfinity: true, noNaN: true })
  ).map(([x, y]) => ({ x, y }));

const arbitraryAbstractGeometryWithID = (
  id: string
): Arbitrary<AbstractGeometry> =>
  oneof(arbitraryLineWithID(id), arbitraryPointWithID(id));

const arbitraryLineWithID = (id: string): Arbitrary<Line> =>
  oneof(arbitraryHorizontalLineWithID(id), arbitraryVerticalLineWithID(id));

const arbitraryHorizontalLineWithID = (id: string): Arbitrary<Line> =>
  nat().map((v) => ({
    id,
    kind: Kind.Line,
    v,
    direction: Direction.Horizontal,
  }));

const arbitraryVerticalLineWithID = (id: string): Arbitrary<Line> =>
  nat().map((v) => ({
    id,
    kind: Kind.Line,
    v,
    direction: Direction.Vertical,
  }));

const arbitraryLineWithDirection = (direction: Direction): Arbitrary<Line> =>
  tuple(arbitraryElementID(), nat()).map(([id, v]) => ({
    kind: Kind.Line,
    id,
    direction,
    v,
  }));

export const arbitraryHorizontalLine = (): Arbitrary<Line> =>
  arbitraryLineWithDirection(Direction.Horizontal);

export const arbitraryVerticalLine = (): Arbitrary<Line> =>
  arbitraryLineWithDirection(Direction.Vertical);

export const arbitraryLine = (): Arbitrary<Line> =>
  arbitraryDirection().chain(arbitraryLineWithDirection);

export const arbitraryGeoLine = (): Arbitrary<GeoLine> =>
  arbitraryLine().map(concretizeLine);

export const arbitraryVerticalGeoLine = (): Arbitrary<GeoLine> =>
  arbitraryVerticalLine().map(concretizeLine);

export const arbitraryHorizontalGeoLine = (): Arbitrary<GeoLine> =>
  arbitraryHorizontalLine().map(concretizeLine);

export const arbitraryPoint = (): Arbitrary<Intersection> =>
  arbitraryElementID().chain(arbitraryPointWithID);

export const arbitraryPointWithID = (id: string): Arbitrary<Intersection> =>
  tuple(arbitraryElementID(), arbitraryElementID()).map(([x, y]) => ({
    id,
    x,
    y,
    kind: Kind.Point,
  }));

export const arbitraryGeoPoint = (): Arbitrary<GeoPoint> =>
  tuple(arbitraryPoint(), nat(), nat()).map(([p, x, y]) => ({
    ...p,
    geom: point(x, y),
  }));

export const arbitrarySceneFromAction = (
  action: Action
): Arbitrary<SceneReader> => {
  const elements = allReferencedElementsByKind(action);

  const actionPoints = Array.from(elements[Kind.Point]).map(
    arbitraryPointWithID
  );

  const actionLines = Array.from(elements[Kind.Line]).map(arbitraryLineWithID);

  return tuple(
    ...Array.from(elements.unknown).map(arbitraryAbstractGeometryWithID)
  ).chain((geometry) => {
    const arbitraryPoints = actionPoints.concat(
      geometry
        .filter((g) => g.kind === Kind.Point)
        .map((g) => arbitraryPointWithID(g.id))
    );

    return tuple(...arbitraryPoints).chain((points) => {
      const arbitraryLines = actionLines
        .concat(points.map((p) => arbitraryHorizontalLineWithID(p.x)))
        .concat(points.map((p) => arbitraryVerticalLineWithID(p.y)));

      return tuple(...arbitraryLines).map((lines) =>
        makeSceneWithPointsAndLines(points, lines)
      );
    });
  });
};

const makeSceneWithPointsAndLines = (
  points: Intersection[],
  lines: Line[]
): SceneReader => {
  return createSceneReader({
    id: nanoid(),
    all: { ...toRecord(points), ...toRecord(lines) },
    grid: {
      xs: lines
        .filter((l) => l.direction === Direction.Horizontal)
        .map((l) => l.id),
      ys: lines
        .filter((l) => l.direction === Direction.Vertical)
        .map((l) => l.id),
    },
    intersections: toRecord(points),
    lines: toRecord(lines),
  });
};
