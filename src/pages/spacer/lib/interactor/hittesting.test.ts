import { Arbitrary, array, assert, property } from "fast-check";
import { describe, test, expect } from "vitest";
import { Direction } from "../scene/abstractGeometry";
import { GeoLine, Geometry } from "../scene/geometry";
import {
  arbitraryGeoLine,
  arbitraryVerticalGeoLine,
  arbitraryHorizontalGeoLine,
  arbitraryGeoPoint,
} from "../scene/testing";
import {
  firstHorizontalLine,
  firstLine,
  firstPoint,
  firstVerticalLine,
  highestPriorityElement,
  intersectionHits,
} from "./hittesting";

const shuffle = <T>(arr: T[]) => {
  let j: number;
  let x: T;
  let index: number;
  for (index = arr.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1));
    x = arr[index];
    arr[index] = arr[j];
    arr[j] = x;
  }
};

const geoArray = <T extends Geometry>(
  thing: Arbitrary<T>
): Arbitrary<Geometry[]> => array(thing, { maxLength: 5 });

describe("highestPriorityElement", () => {
  test("should get a point in a list of geometry when present", () => {
    assert(
      property(
        geoArray(arbitraryGeoLine()),
        arbitraryGeoPoint(),
        (lines, point) => {
          lines.push(point);
          shuffle(lines);
          expect(highestPriorityElement(lines)).toBe(point);
        }
      )
    );
  });

  test("should get a line when no point is present", () => {
    assert(
      property(geoArray(arbitraryGeoLine()), (lines) => {
        expect(highestPriorityElement(lines)).toBe(lines[0]);
      })
    );
  });

  test("should return undefined if the array is empty", () => {
    expect(highestPriorityElement([])).toBeUndefined();
  });
});

describe("intersectionHits", () => {
  test("should get a point in a list of geometry when present", () => {
    assert(
      property(
        geoArray(arbitraryGeoLine()),
        arbitraryGeoPoint(),
        (lines, point) => {
          lines.push(point);
          shuffle(lines);
          expect(intersectionHits(lines)).toBe(point);
        }
      )
    );
  });

  test("should return an array with at most one line of each direction if only lines are present", () => {
    assert(
      property(geoArray(arbitraryGeoLine()), (lines) => {
        if (lines.length === 0) {
          expect(intersectionHits(lines)).toBeUndefined();
        } else {
          const hits = intersectionHits(lines);
          if (Array.isArray(hits)) {
            expect(hits.length).toBeLessThan(3);
            expect(hits.length).toBeGreaterThan(0);
            const obj = { [Direction.Horizontal]: 0, [Direction.Vertical]: 0 };
            for (const hit of hits) {
              obj[hit.direction]++;
            }
            expect(obj[Direction.Horizontal]).toBeLessThanOrEqual(1);
            expect(obj[Direction.Vertical]).toBeLessThanOrEqual(1);
          }
        }
      })
    );
  });
});

// TODO(Dan): the tests below this point have the following bad things.
// 1. Copy and pasted code (pull out to function)
// 2. Mysterious error where if an error is thrown after the call the shuffle in
//    a property test it appears to cause some sort of infinite loop.
// 3. These tests are questionably valuable to begin with as the code they are testing is very simple

describe("firstPoint", () => {
  test("should get a point in a list of geometry when present", () => {
    assert(
      property(
        geoArray(arbitraryGeoLine()),
        arbitraryGeoPoint(),
        (lines, point) => {
          lines.push(point);
          shuffle(lines);
          expect(firstPoint(lines)).toBe(point);
        }
      )
    );
  });

  test("should get the first point in a list of geometry when multiple points are present", () => {
    assert(
      property(
        geoArray(arbitraryGeoLine()),
        geoArray(arbitraryGeoPoint()),
        arbitraryGeoPoint(),
        (lines, points, point) => {
          expect(firstPoint(points)).toBe(points[0]);
          const all = lines.concat(points);
          expect(firstPoint(all)).toBe(points[0]);
          shuffle(all);
          all.unshift(point);
          expect(firstPoint(all)).toBe(point);
        }
      )
    );
  });

  test("should return undefined when no points are present", () => {
    assert(
      property(geoArray(arbitraryGeoLine()), (lines) => {
        expect(firstPoint(lines)).toBe(undefined);
      })
    );
  });
});

describe("firstLine", () => {
  test("should get a line in a list of geometry when present", () => {
    assert(
      property(
        geoArray(arbitraryGeoPoint()),
        arbitraryGeoLine(),
        (points, line) => {
          points.push(line);
          shuffle(points);
          expect(firstLine(points)).toBe(line);
        }
      )
    );
  });

  test("should get the first line in a list of geometry when multiple vertical lines are present", () => {
    assert(
      property(
        geoArray(arbitraryGeoLine()),
        geoArray(arbitraryGeoPoint()),
        arbitraryGeoLine(),
        (lines, points, line) => {
          expect(firstLine(lines)).toBe(lines[0]);
          const all = lines.concat(points);
          expect(firstLine(all)).toBe(lines[0]);
          shuffle(all);
          all.unshift(line);
          expect(firstLine(all)).toBe(line);
        }
      )
    );
  });

  test("should return undefined when no lines are present", () => {
    assert(
      property(geoArray(arbitraryGeoPoint()), (lines) => {
        expect(firstLine(lines)).toBe(undefined);
      })
    );
  });
});

describe("firstVerticalLine", () => {
  test("should get a vertical line in a list of geometry when present", () => {
    assert(
      property(
        geoArray(arbitraryGeoPoint()),
        arbitraryVerticalGeoLine(),
        (points, line) => {
          points.push(line);
          shuffle(points);
          expect(firstVerticalLine(points)).toBe(line);
        }
      )
    );
  });

  test("should get the first vertical line in a list of geometry when multiple lines are present", () => {
    assert(
      property(
        geoArray(arbitraryVerticalGeoLine()),
        geoArray(arbitraryGeoPoint()),
        arbitraryVerticalGeoLine(),
        (lines, points, line) => {
          expect(firstVerticalLine(lines)).toBe(lines[0]);
          const all = lines.concat(points);
          expect(firstVerticalLine(all)).toBe(lines[0]);
          shuffle(all);
          all.unshift(line);
          expect(firstVerticalLine(all)).toBe(line);
        }
      )
    );
  });

  test("should return undefined when no line are present", () => {
    assert(
      property(geoArray(arbitraryGeoPoint()), (lines) => {
        expect(firstVerticalLine(lines)).toBe(undefined);
      })
    );
  });

  test("if any line is returned it must be vertical", () => {
    property(geoArray(arbitraryGeoLine()), (lines) => {
      expect(firstVerticalLine(lines)).toSatisfy(
        (line: GeoLine | undefined) =>
          line === undefined || line.direction === Direction.Vertical
      );
    });
  });
});

describe("firstHorizontalLine", () => {
  test("should get a horizontal line in a list of geometry when present", () => {
    assert(
      property(
        geoArray(arbitraryGeoPoint()),
        arbitraryHorizontalGeoLine(),
        (points, line) => {
          points.push(line);
          shuffle(points);
          expect(firstHorizontalLine(points)).toBe(line);
        }
      )
    );
  });

  test("should get the first horizontal line in a list of geometry when multiple lines are present", () => {
    assert(
      property(
        geoArray(arbitraryHorizontalGeoLine()),
        geoArray(arbitraryGeoPoint()),
        arbitraryHorizontalGeoLine(),
        (lines, points, line) => {
          expect(firstHorizontalLine(lines)).toBe(lines[0]);
          const all = lines.concat(points);
          expect(firstHorizontalLine(all)).toBe(lines[0]);
          shuffle(all);
          all.unshift(line);
          expect(firstHorizontalLine(all)).toBe(line);
        }
      )
    );
  });

  test("should return undefined when no line are present", () => {
    assert(
      property(geoArray(arbitraryGeoPoint()), (lines) => {
        expect(firstHorizontalLine(lines)).toBe(undefined);
      })
    );
  });

  test("if any line is returned it must be vertical", () => {
    property(geoArray(arbitraryGeoLine()), (lines) => {
      expect(firstHorizontalLine(lines)).toSatisfy(
        (line: GeoLine | undefined) =>
          line === undefined || line.direction === Direction.Horizontal
      );
    });
  });
});
