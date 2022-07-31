import Flatten from "@flatten-js/core";
import { Intersection, Line } from "./abstractGeometry";
import { WithGeometry } from "./concretion";

export interface Position {
  x: number;
  y: number;
}

export type Geometry =
  | WithGeometry<Line, Flatten.Segment>
  | WithGeometry<Intersection, Flatten.Point>;

export type GeoLine = WithGeometry<Line, Flatten.Segment>;
export type GeoPoint = WithGeometry<Intersection, Flatten.Point>;
