import { Arbitrary, nat } from "fast-check";
import { Mode } from ".";

if (import.meta.env.PROD) {
  console.warn("testing file was required in a PROD build");
}

export const arbitraryMode = (): Arbitrary<Mode> =>
  nat(Object.keys(Mode).length / 2 - 1);
