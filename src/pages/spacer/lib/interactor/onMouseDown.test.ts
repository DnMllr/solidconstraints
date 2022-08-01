import { describe, test, expect } from "vitest";
import { assert, property } from "fast-check";
import { createRoot } from "solid-js";
import { arbitraryAction } from "../actions/testing";
import { onMouseDown } from "./onMouseDown";

describe("onMouseDown", () => {
  test("should always return an action", () => {
    createRoot((d) => {
      assert(
        property(arbitraryAction(), (action) => {
          expect(onMouseDown(action)).toBeDefined();
        })
      );
      d();
    });
  });
});
