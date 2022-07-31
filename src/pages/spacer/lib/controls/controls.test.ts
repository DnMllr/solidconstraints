import { assert, integer, nat, property } from "fast-check";
import { describe, test, expect } from "vitest";
import {
  createControls,
  isInHorizontalLineMode,
  isInIntersectionMode,
  isInNoneMode,
  isInVerticalLineMode,
  Mode,
} from ".";
import { arbitraryMode } from "./testing";

describe("initial store state", () => {
  test("begins with inspector closed", () => {
    const controls = createControls();
    expect(controls.controls.inspectorOpen).toBe(false);
  });

  test("begins with no grid set", () => {
    const controls = createControls();
    expect(controls.controls.grid).toBe(undefined);
  });

  test("begins in no mode", () => {
    const controls = createControls();
    expect(controls.controls.mode).toBe(Mode.None);
  });
});

describe("grid", () => {
  describe("setGrid", () => {
    test("setting a grid should define the grid with the passed in params", () => {
      assert(
        property(nat(), nat(), (x, y) => {
          const controls = createControls();
          controls.setGrid(x, y);
          expect(controls.controls.grid).toEqual({ x, y });
        })
      );
    });

    test("setting a grid to negative numbers should throw an error", () => {
      assert(
        property(integer(), integer(), (x, y) => {
          const controls = createControls();
          if (x < 0 || y < 0) {
            expect(() => {
              controls.setGrid(x, y);
            }).toThrow();
          } else {
            expect(() => {
              controls.setGrid(x, y);
            }).not.toThrow();
          }
        })
      );
    });
  });

  describe("unsetGrid", () => {
    test("unsetting a grid should set the grid to undefined", () => {
      const controls = createControls();
      controls.setGrid(1, 5);
      controls.unsetGrid();
      expect(controls.controls.grid).toBe(undefined);
    });
  });
});

describe("inspector", () => {
  describe("openInspector", () => {
    test("should set inspectorOpen to true", () => {
      const controls = createControls();
      controls.openInspector();
      expect(controls.controls.inspectorOpen).toBe(true);
    });

    test("should be idempotent", () => {
      const controls = createControls();
      property(nat({ max: 5 }), (count) => {
        while (count--) {
          controls.openInspector();
          expect(controls.controls.inspectorOpen).toBe(true);
        }
      });
    });
  });

  describe("closeInspector", () => {
    test("should set inspectorOpen to false", () => {
      const controls = createControls();
      controls.openInspector();
      controls.closeInspector();
      expect(controls.controls.inspectorOpen).toBe(false);
    });

    test("should do nothing if already false", () => {
      const controls = createControls();
      controls.closeInspector();
      expect(controls.controls.inspectorOpen).toBe(false);
    });

    test("should be idempotent", () => {
      const controls = createControls();
      property(nat({ max: 5 }), (count) => {
        controls.openInspector();
        while (count--) {
          controls.closeInspector();
          expect(controls.controls.inspectorOpen).toBe(false);
        }
      });
    });
  });

  describe("toggleInspector", () => {
    test("should set inspectorOpen to true if the inspector is closed", () => {
      let controls = createControls();
      controls.toggleInspector();
      expect(controls.controls.inspectorOpen).toBe(true);

      controls = createControls();
      controls.openInspector();
      controls.closeInspector();
      controls.toggleInspector();
      expect(controls.controls.inspectorOpen).toBe(true);
    });

    test("should set inspectorOpen to false if the inspector is open", () => {
      const controls = createControls();
      controls.openInspector();
      controls.toggleInspector();
      expect(controls.controls.inspectorOpen).toBe(false);
    });
  });
});

describe("mode", () => {
  describe("enterHorizontalLineMode", () => {
    test("should set the mode to Mode.HorizontalLine", () => {
      const controls = createControls();
      controls.enterHorizontalLineMode();
      expect(controls.controls.mode).toBe(Mode.HorizontalLine);

      controls.enterVerticalLineMode();
      controls.enterHorizontalLineMode();
      expect(controls.controls.mode).toBe(Mode.HorizontalLine);
    });
  });

  describe("enterVerticalLineMode", () => {
    test("should set the mode to Mode.VerticalLine", () => {
      const controls = createControls();
      controls.enterVerticalLineMode();
      expect(controls.controls.mode).toBe(Mode.VerticalLine);

      controls.enterHorizontalLineMode();
      controls.enterVerticalLineMode();
      expect(controls.controls.mode).toBe(Mode.VerticalLine);
    });
  });

  describe("enterPointMode", () => {
    test("should set the mode to Mode.Point", () => {
      const controls = createControls();
      controls.enterPointMode();
      expect(controls.controls.mode).toBe(Mode.Point);

      controls.enterHorizontalLineMode();
      controls.enterPointMode();
      expect(controls.controls.mode).toBe(Mode.Point);
    });
  });

  describe("toggleHorizontalLineMode", () => {
    test("should set the mode to Mode.HorizontalLine if not already in that mode", () => {
      const controls = createControls();
      controls.toggleHorizontalLineMode();
      expect(controls.controls.mode).toBe(Mode.HorizontalLine);

      controls.enterPointMode();
      controls.toggleHorizontalLineMode();
      expect(controls.controls.mode).toBe(Mode.HorizontalLine);
    });

    test("should set the mode to Mode.None if already in HorizontalLine mode", () => {
      const controls = createControls();
      controls.enterHorizontalLineMode();
      controls.toggleHorizontalLineMode();
      expect(controls.controls.mode).toBe(Mode.None);

      controls.toggleHorizontalLineMode();
      controls.toggleHorizontalLineMode();
      expect(controls.controls.mode).toBe(Mode.None);
    });
  });

  describe("toggleVerticalLineMode", () => {
    test("should set the mode to Mode.VerticalLine if not already in that mode", () => {
      const controls = createControls();
      controls.toggleVerticalLineMode();
      expect(controls.controls.mode).toBe(Mode.VerticalLine);

      controls.enterPointMode();
      controls.toggleVerticalLineMode();
      expect(controls.controls.mode).toBe(Mode.VerticalLine);
    });

    test("should set the mode to Mode.None if already in VerticalLine mode", () => {
      const controls = createControls();
      controls.enterVerticalLineMode();
      controls.toggleVerticalLineMode();
      expect(controls.controls.mode).toBe(Mode.None);

      controls.toggleVerticalLineMode();
      controls.toggleVerticalLineMode();
      expect(controls.controls.mode).toBe(Mode.None);
    });
  });

  describe("togglePointMode", () => {
    test("should set the mode to Mode.Point if not already in that mode", () => {
      const controls = createControls();
      controls.togglePointMode();
      expect(controls.controls.mode).toBe(Mode.Point);

      controls.enterVerticalLineMode();
      controls.togglePointMode();
      expect(controls.controls.mode).toBe(Mode.Point);
    });

    test("should set the mode to Mode.None if already in Point mode", () => {
      const controls = createControls();
      controls.enterPointMode();
      controls.togglePointMode();
      expect(controls.controls.mode).toBe(Mode.None);

      controls.togglePointMode();
      controls.togglePointMode();
      expect(controls.controls.mode).toBe(Mode.None);
    });
  });

  describe("exitMode", () => {
    test("should set the mode to none regardless of what mode we are in", () => {
      assert(
        property(arbitraryMode(), (m) => {
          const controls = createControls();
          switch (m) {
            case Mode.None: {
              controls.exitMode();
              break;
            }

            case Mode.HorizontalLine: {
              controls.enterHorizontalLineMode();
              break;
            }

            case Mode.VerticalLine: {
              controls.enterVerticalLineMode();
              break;
            }

            case Mode.Point: {
              controls.enterPointMode();
              break;
            }
          }

          controls.exitMode();
          expect(controls.controls.mode).toBe(Mode.None);
        })
      );
    });
  });

  describe("isInVerticalLineMode", () => {
    test("returns true if the controls are in Mode.VerticalLine and false otherwise", () => {
      const controls = createControls();
      expect(isInVerticalLineMode(controls.controls)).toBe(false);

      controls.enterVerticalLineMode();
      expect(isInVerticalLineMode(controls.controls)).toBe(true);

      controls.exitMode();
      expect(isInVerticalLineMode(controls.controls)).toBe(false);
    });
  });

  describe("isInHorizontalLineMode", () => {
    test("returns true if the controls are in Mode.HorizontalLine and false otherwise", () => {
      const controls = createControls();
      expect(isInHorizontalLineMode(controls.controls)).toBe(false);

      controls.enterHorizontalLineMode();
      expect(isInHorizontalLineMode(controls.controls)).toBe(true);

      controls.exitMode();
      expect(isInHorizontalLineMode(controls.controls)).toBe(false);
    });
  });

  describe("isInIntersectionMode", () => {
    test("returns true if the controls are in Mode.Point and false otherwise", () => {
      const controls = createControls();
      expect(isInIntersectionMode(controls.controls)).toBe(false);

      controls.enterPointMode();
      expect(isInIntersectionMode(controls.controls)).toBe(true);

      controls.exitMode();
      expect(isInIntersectionMode(controls.controls)).toBe(false);
    });
  });

  describe("isInNoneMode", () => {
    test("returns true if the controls are in Mode.None and false otherwise", () => {
      const controls = createControls();
      expect(isInNoneMode(controls.controls)).toBe(true);

      controls.enterPointMode();
      expect(isInNoneMode(controls.controls)).toBe(false);

      controls.exitMode();
      expect(isInNoneMode(controls.controls)).toBe(true);
    });
  });
});
