import { Direction, GeoLine, Geometry, GeoPoint, Kind } from "../scene";

export const firstPoint = (elements: Geometry[]): GeoPoint | undefined => {
  for (const el of elements) {
    if (el.kind === Kind.Point) {
      return el;
    }
  }
};

export const firstLine = (elements: Geometry[]): GeoLine | undefined => {
  for (const el of elements) {
    if (el.kind === Kind.Line) {
      return el;
    }
  }
};

export const firstVerticalLine = (
  elements: Geometry[]
): GeoLine | undefined => {
  for (const el of elements) {
    if (el.kind === Kind.Line && el.direction === Direction.Vertical) {
      return el;
    }
  }
};

export const firstHorizontalLine = (
  elements: Geometry[]
): GeoLine | undefined => {
  for (const el of elements) {
    if (el.kind === Kind.Line && el.direction === Direction.Horizontal) {
      return el;
    }
  }
};

export const highestPriorityElement = (
  elements: Geometry[]
): Geometry | undefined => {
  return firstPoint(elements) ?? firstLine(elements);
};

export const intersectionHits = (
  elements: Geometry[]
): GeoPoint | GeoLine[] | undefined => {
  const fp = firstPoint(elements);
  if (fp != null) {
    return fp;
  }

  const h = firstHorizontalLine(elements);
  const v = firstVerticalLine(elements);

  if (!h && !v) {
    return undefined;
  }

  const result: GeoLine[] = [];

  if (v != null) {
    result.push(v);
  }

  if (h != null) {
    result.push(h);
  }

  return result;
};
