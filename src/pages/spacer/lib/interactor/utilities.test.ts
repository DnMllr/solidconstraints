import { describe, test, expect } from "vitest";
import { nat, assert, pre, property } from "fast-check";
import { arbitraryControlState } from "../controls/testing";
import { computePosition } from "./utilities";

describe("computePosition", () => {
  test("should return the mouse position if the grid is not set", () => {
    assert(
      property(arbitraryControlState(), nat(), nat(), (controls, x, y) => {
        pre(controls.grid === undefined);
        const position = computePosition(controls, { offsetX: x, offsetY: y });
        expect(position.x).toBe(x);
        expect(position.y).toBe(y);
      })
    );
  });

  test("should return a number divisible by the grid if the grid is set", () => {
    assert(
      property(arbitraryControlState(), nat(), nat(), (controls, x, y) => {
        pre(controls.grid !== undefined);
        const position = computePosition(controls, { offsetX: x, offsetY: y });
        // the following ?? stuff is because typescript doesn't understand the pre() fast-check precondition above
        expect(position.x % (controls.grid?.x ?? 1)).toBe(0);
        expect(position.y % (controls.grid?.y ?? 1)).toBe(0);
      })
    );
  });
});
