import { Arbitrary, boolean, constant, integer, nat, tuple } from "fast-check";
import { ControlsState, Mode } from ".";

if (import.meta.env.PROD) {
  console.warn("testing file was required in a PROD build");
}

export const arbitraryMode = (): Arbitrary<Mode> =>
  nat(Object.keys(Mode).length / 2 - 1);

export const arbitraryControlState = (): Arbitrary<ControlsState> =>
  tuple(arbitraryMode(), boolean(), boolean()).chain<ControlsState>(
    ([mode, inspectorOpen, gridPresent]) => {
      if (gridPresent) {
        return tuple(integer({ min: 1 }), integer({ min: 1 })).map(
          ([x, y]) => ({
            mode,
            inspectorOpen,
            grid: { x, y },
          })
        );
      }

      return constant({
        mode,
        inspectorOpen,
        grid: undefined,
      });
    }
  );
