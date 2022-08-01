import { describe, test, expect } from "vitest";
import { assert, property } from "fast-check";
import { createRoot } from "solid-js";
import { arbitraryAction } from "../actions/testing";
import { onUIHoverElement } from "./onUIHover";
import { arbitraryElementID } from "../scene/testing";

describe("onUIHover", () => {
  test("should always return an action", () => {
    createRoot((d) => {
      assert(
        property(arbitraryAction(), arbitraryElementID(), (action, id) => {
          expect(onUIHoverElement(action, id)).toBeDefined();
        })
      );
      d();
    });
  });
});
