import { assert, property } from "fast-check";
import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import { onMouseEnter } from "./onMouseEnter";
import { arbitraryFullViewportState } from "./testing";

describe("onMouseDown", () => {
  test("should always return an action", () => {
    createRoot((d) => {
      assert(
        property(arbitraryFullViewportState(), (state) => {
          expect(
            onMouseEnter(state.action, state.scene, state.controls, {
              offsetX: 0,
              offsetY: 0,
            })
          ).toBeDefined();
        })
      );
      d();
    });
  });
});
