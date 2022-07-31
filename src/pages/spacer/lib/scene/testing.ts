import { Arbitrary, constantFrom, double, tuple, uuid } from "fast-check";
import { Direction, Position } from ".";

export const arbitraryElementID = (): Arbitrary<string> => uuid();

export const arbitraryDirection = (): Arbitrary<Direction> =>
  constantFrom(Direction.Horizontal, Direction.Vertical);

export const arbitraryPosition = (): Arbitrary<Position> =>
  tuple(
    double({ noDefaultInfinity: true, noNaN: true }),
    double({ noDefaultInfinity: true, noNaN: true })
  ).map(([x, y]) => ({ x, y }));
