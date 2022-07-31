import Flatten from "@flatten-js/core";

const { point } = Flatten;

const squaredPolar = (point: Flatten.Point, center: Flatten.Point) => {
  return [
    Math.atan2(point.y - center.y, point.x - center.x),
    (point.x - center.x) ** 2 + (point.y - center.y) ** 2,
  ];
};

export const polySort = (points: Flatten.Point[]): Flatten.Point[] => {
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
