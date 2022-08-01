import { describe, test, expect } from "vitest";
import { assert, property } from "fast-check";
import { createRoot } from "solid-js";
import { arbitraryAction } from "../actions/testing";
import { onMouseLeave } from "./onMouseLeave";

describe("onMouseLeave", () => {
  test("should always return an action", () => {
    createRoot((d) => {
      assert(
        property(arbitraryAction(), (action) => {
          expect(onMouseLeave(action)).toBeDefined();
        })
      );
      d();
    });
  });
});