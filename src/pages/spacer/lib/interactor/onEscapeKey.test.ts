import { assert, property } from "fast-check";
import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import { onEscape } from "./onEscapeKey";
import { arbitraryFullViewportState } from "./testing";

describe("onEscapeKey", () => {
  test("should always return an action", () => {
    createRoot((d) => {
      assert(
        property(arbitraryFullViewportState(), (state) => {
          expect(
            onEscape(state.action, state.scene, state.controls)
          ).toBeDefined();
        })
      );
      d();
    });
  });
});
