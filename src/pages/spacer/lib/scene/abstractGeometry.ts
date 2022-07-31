import { RecordOf } from "../../../../lib/utilities";
import { HasID } from "./id";

export enum Kind {
  Point,
  Line,
  Segment,
  Ring,
  Poly,
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

export interface Segment extends HasID, HasKind<Kind.Segment> {
  a: string;
  b: string;
}

export interface Ring extends HasID, HasKind<Kind.Ring> {
  points: string[];
}

export interface Poly extends HasID, HasKind<Kind.Poly> {
  exterior: string;
  holes: string[];
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
  segments: RecordOf<Segment>;
  rings: RecordOf<Ring>;
  polys: RecordOf<Poly>;
}

export type AbstractGeometry = Poly | Ring | Segment | Line | Intersection;
