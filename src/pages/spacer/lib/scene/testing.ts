import Flatten from "@flatten-js/core";
import { Arbitrary, constantFrom, double, nat, tuple, uuid } from "fast-check";
import { Position } from ".";
import { Kind, Line, Intersection, Direction } from "./abstractGeometry";
import { concretizeLine } from "./concretion";
import { GeoLine, GeoPoint } from "./geometry";

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
  tuple(arbitraryElementID(), arbitraryElementID(), arbitraryElementID()).map(
    ([id, x, y]) => ({ id, x, y, kind: Kind.Point })
  );

export const arbitraryGeoPoint = (): Arbitrary<GeoPoint> =>
  tuple(arbitraryPoint(), nat(), nat()).map(([p, x, y]) => ({
    ...p,
    geom: point(x, y),
  }));
