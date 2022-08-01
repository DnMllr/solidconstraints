import { assert, integer, nat, property } from "fast-check";
import { createRoot } from "solid-js";
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
    createRoot((d) => {
      const controls = createControls();
      expect(controls.controls.inspectorOpen).toBe(false);
      d();
    });
  });

  test("begins with no grid set", () => {
    createRoot((d) => {
      const controls = createControls();
      expect(controls.controls.grid).toBe(undefined);
      d();
    });
  });

  test("begins in no mode", () => {
    createRoot((d) => {
      const controls = createControls();
      expect(controls.controls.mode).toBe(Mode.None);
      d();
    });
  });
});

describe("grid", () => {
  describe("setGrid", () => {
    test("setting a grid should define the grid with the passed in params", () => {
      assert(
        property(integer({ min: 1 }), integer({ min: 1 }), (x, y) => {
          createRoot((d) => {
            const controls = createControls();
            controls.setGrid(x, y);
            expect(controls.controls.grid).toEqual({ x, y });
            d();
          });
        })
      );
    });

    test("setting a grid to zero or negative numbers should throw an error", () => {
      assert(
        property(integer(), integer(), (x, y) => {
          createRoot((d) => {
            const controls = createControls();
            if (x <= 0 || y <= 0) {
              expect(() => {
                controls.setGrid(x, y);
              }).toThrow();
            } else {
              expect(() => {
                controls.setGrid(x, y);
              }).not.toThrow();
            }
            d();
          });
        })
      );
    });
  });

  describe("unsetGrid", () => {
    test("unsetting a grid should set the grid to undefined", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.setGrid(1, 5);
        controls.unsetGrid();
        expect(controls.controls.grid).toBeUndefined();
        d();
      });
    });
  });
});

describe("inspector", () => {
  describe("openInspector", () => {
    test("should set inspectorOpen to true", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.openInspector();
        expect(controls.controls.inspectorOpen).toBe(true);
        d();
      });
    });

    test("should be idempotent", () => {
      createRoot((d) => {
        const controls = createControls();
        property(nat({ max: 5 }), (count) => {
          while (count--) {
            controls.openInspector();
            expect(controls.controls.inspectorOpen).toBe(true);
          }
        });
        d();
      });
    });
  });

  describe("closeInspector", () => {
    test("should set inspectorOpen to false", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.openInspector();
        controls.closeInspector();
        expect(controls.controls.inspectorOpen).toBe(false);
        d();
      });
    });

    test("should do nothing if already false", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.closeInspector();
        expect(controls.controls.inspectorOpen).toBe(false);
        d();
      });
    });

    test("should be idempotent", () => {
      createRoot((d) => {
        const controls = createControls();
        property(nat({ max: 5 }), (count) => {
          controls.openInspector();
          while (count--) {
            controls.closeInspector();
            expect(controls.controls.inspectorOpen).toBe(false);
          }
        });
        d();
      });
    });
  });

  describe("toggleInspector", () => {
    test("should set inspectorOpen to true if the inspector is closed", () => {
      createRoot((d) => {
        let controls = createControls();
        controls.toggleInspector();
        expect(controls.controls.inspectorOpen).toBe(true);

        controls = createControls();
        controls.openInspector();
        controls.closeInspector();
        controls.toggleInspector();
        expect(controls.controls.inspectorOpen).toBe(true);
        d();
      });
    });

    test("should set inspectorOpen to false if the inspector is open", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.openInspector();
        controls.toggleInspector();
        expect(controls.controls.inspectorOpen).toBe(false);
        d();
      });
    });
  });
});

describe("mode", () => {
  describe("enterHorizontalLineMode", () => {
    test("should set the mode to Mode.HorizontalLine", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.enterHorizontalLineMode();
        expect(controls.controls.mode).toBe(Mode.HorizontalLine);

        controls.enterVerticalLineMode();
        controls.enterHorizontalLineMode();
        expect(controls.controls.mode).toBe(Mode.HorizontalLine);
        d();
      });
    });
  });

  describe("enterVerticalLineMode", () => {
    test("should set the mode to Mode.VerticalLine", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.enterVerticalLineMode();
        expect(controls.controls.mode).toBe(Mode.VerticalLine);

        controls.enterHorizontalLineMode();
        controls.enterVerticalLineMode();
        expect(controls.controls.mode).toBe(Mode.VerticalLine);
        d();
      });
    });
  });

  describe("enterPointMode", () => {
    test("should set the mode to Mode.Point", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.enterPointMode();
        expect(controls.controls.mode).toBe(Mode.Point);

        controls.enterHorizontalLineMode();
        controls.enterPointMode();
        expect(controls.controls.mode).toBe(Mode.Point);
        d();
      });
    });
  });

  describe("toggleHorizontalLineMode", () => {
    test("should set the mode to Mode.HorizontalLine if not already in that mode", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.toggleHorizontalLineMode();
        expect(controls.controls.mode).toBe(Mode.HorizontalLine);

        controls.enterPointMode();
        controls.toggleHorizontalLineMode();
        expect(controls.controls.mode).toBe(Mode.HorizontalLine);
        d();
      });
    });

    test("should set the mode to Mode.None if already in HorizontalLine mode", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.enterHorizontalLineMode();
        controls.toggleHorizontalLineMode();
        expect(controls.controls.mode).toBe(Mode.None);

        controls.toggleHorizontalLineMode();
        controls.toggleHorizontalLineMode();
        expect(controls.controls.mode).toBe(Mode.None);
        d();
      });
    });
  });

  describe("toggleVerticalLineMode", () => {
    test("should set the mode to Mode.VerticalLine if not already in that mode", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.toggleVerticalLineMode();
        expect(controls.controls.mode).toBe(Mode.VerticalLine);

        controls.enterPointMode();
        controls.toggleVerticalLineMode();
        expect(controls.controls.mode).toBe(Mode.VerticalLine);

        d();
      });
    });

    test("should set the mode to Mode.None if already in VerticalLine mode", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.enterVerticalLineMode();
        controls.toggleVerticalLineMode();
        expect(controls.controls.mode).toBe(Mode.None);

        controls.toggleVerticalLineMode();
        controls.toggleVerticalLineMode();
        expect(controls.controls.mode).toBe(Mode.None);
        d();
      });
    });
  });

  describe("togglePointMode", () => {
    test("should set the mode to Mode.Point if not already in that mode", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.togglePointMode();
        expect(controls.controls.mode).toBe(Mode.Point);

        controls.enterVerticalLineMode();
        controls.togglePointMode();
        expect(controls.controls.mode).toBe(Mode.Point);
        d();
      });
    });

    test("should set the mode to Mode.None if already in Point mode", () => {
      createRoot((d) => {
        const controls = createControls();
        controls.enterPointMode();
        controls.togglePointMode();
        expect(controls.controls.mode).toBe(Mode.None);

        controls.togglePointMode();
        controls.togglePointMode();
        expect(controls.controls.mode).toBe(Mode.None);
        d();
      });
    });
  });

  describe("exitMode", () => {
    test("should set the mode to none regardless of what mode we are in", () => {
      createRoot((d) => {
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

        d();
      });
    });
  });

  describe("isInVerticalLineMode", () => {
    test("returns true if the controls are in Mode.VerticalLine and false otherwise", () => {
      createRoot((d) => {
        const controls = createControls();
        expect(isInVerticalLineMode(controls.controls)).toBe(false);

        controls.enterVerticalLineMode();
        expect(isInVerticalLineMode(controls.controls)).toBe(true);

        controls.exitMode();
        expect(isInVerticalLineMode(controls.controls)).toBe(false);
        d();
      });
    });
  });

  describe("isInHorizontalLineMode", () => {
    test("returns true if the controls are in Mode.HorizontalLine and false otherwise", () => {
      createRoot((d) => {
        const controls = createControls();
        expect(isInHorizontalLineMode(controls.controls)).toBe(false);

        controls.enterHorizontalLineMode();
        expect(isInHorizontalLineMode(controls.controls)).toBe(true);

        controls.exitMode();
        expect(isInHorizontalLineMode(controls.controls)).toBe(false);
        d();
      });
    });
  });

  describe("isInIntersectionMode", () => {
    test("returns true if the controls are in Mode.Point and false otherwise", () => {
      createRoot((d) => {
        const controls = createControls();
        expect(isInIntersectionMode(controls.controls)).toBe(false);

        controls.enterPointMode();
        expect(isInIntersectionMode(controls.controls)).toBe(true);

        controls.exitMode();
        expect(isInIntersectionMode(controls.controls)).toBe(false);
        d();
      });
    });
  });

  describe("isInNoneMode", () => {
    test("returns true if the controls are in Mode.None and false otherwise", () => {
      createRoot((d) => {
        const controls = createControls();
        expect(isInNoneMode(controls.controls)).toBe(true);

        controls.enterPointMode();
        expect(isInNoneMode(controls.controls)).toBe(false);

        controls.exitMode();
        expect(isInNoneMode(controls.controls)).toBe(true);

        d();
      });
    });
  });
});
