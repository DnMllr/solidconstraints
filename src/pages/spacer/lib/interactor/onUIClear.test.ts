import { describe, test, expect } from "vitest";
import { assert, property } from "fast-check";
import { createRoot } from "solid-js";
import { arbitraryAction } from "../actions/testing";
import { onUIClear } from "./onUIClear";

describe("onUIClear", () => {
  test("should always return an action", () => {
    createRoot((d) => {
      assert(
        property(arbitraryAction(), (action) => {
          expect(onUIClear(action)).toBeDefined();
        })
      );
      d();
    });
  });
});
