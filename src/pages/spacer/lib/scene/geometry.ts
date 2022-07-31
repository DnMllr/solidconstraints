import Flatten from "@flatten-js/core";
import { Intersection, Line, Poly, Ring, Segment } from "./abstractGeometry";
import { WithGeometry } from "./concretion";

export interface Position {
  x: number;
  y: number;
}

export type Geometry =
  | WithGeometry<Poly, Flatten.Polygon>
  | WithGeometry<Line, Flatten.Segment>
  | WithGeometry<Ring, Flatten.Polygon>
  | WithGeometry<Segment, Flatten.Segment>
  | WithGeometry<Intersection, Flatten.Point>;

export type GeoLine = WithGeometry<Line, Flatten.Segment>;
export type GeoPoint = WithGeometry<Intersection, Flatten.Point>;
