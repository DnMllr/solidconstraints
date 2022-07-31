import { RecordOf } from "../../../../lib/utilities";
import { HasID } from "./id";

export enum Kind {
  Point,
  Line,
}

export interface HasKind<T extends Kind> {
  kind: T;
}

export interface Intersection extends HasID, HasKind<Kind.Point> {
  x: string;
  y: string;
}

export enum Direction {
  Horizontal,
  Vertical,
}

export interface Line extends HasID, HasKind<Kind.Line> {
  direction: Direction;
  v: number;
}

export interface Grid {
  xs: string[];
  ys: string[];
}

export interface BaseScene extends HasID {
  grid: Grid;
  all: RecordOf<AbstractGeometry>;
  lines: RecordOf<Line>;
  intersections: RecordOf<Intersection>;
}

export type AbstractGeometry = Line | Intersection;
