import { describe, test, expect } from "vitest";
import { assert, property } from "fast-check";
import { arbitraryActionKind, arbitraryAction } from "./testing";
import { getXPosition, getYPosition, lookupActionKind } from ".";

describe("lookupActionKind", () => {
  test("all action kinds are supported", () => {
    assert(
      property(arbitraryActionKind(), (kind) => {
        return (lookupActionKind(kind) as unknown) !== undefined;
      })
    );
  });
});

describe("getXPosition", () => {
  test("returns the x position of the action if one is present", () => {
    assert(
      property(arbitraryAction(), (action) => {
        if ("x" in action) {
          expect(getXPosition(action)).toBe(action.x);
        } else {
          expect(getXPosition(action)).toBe(undefined);
        }
      })
    );
  });
});

describe("getYPosition", () => {
  test("returns the y position of the action if one is present", () => {
    assert(
      property(arbitraryAction(), (action) => {
        if ("y" in action) {
          expect(getYPosition(action)).toBe(action.y);
        } else {
          expect(getYPosition(action)).toBe(undefined);
        }
      })
    );
  });
});
