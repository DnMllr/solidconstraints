import { Arbitrary, nat } from "fast-check";
import { Mode } from ".";

export const arbitraryMode = (): Arbitrary<Mode> =>
  nat(Object.keys(Mode).length / 2 - 1);
