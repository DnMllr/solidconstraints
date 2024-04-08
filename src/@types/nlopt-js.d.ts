declare module "nlopt-js" {
  export const ready: Promise<void>;

  export enum Algorithm {
    GN_ISRES,
  }

  export interface OptimizationResult {
    success: boolean;
    x: number[];
    value: number;
  }

  export namespace GC {
    declare function flush();
  }

  export class Optimize {
    constructor(algorithm: Algorithm, numberOfVariables: number);
    setMaxtime(time: number);
    setMaxeval(count: number);
    setUpperBounds(bounds: number[]);
    setLowerBounds(bounds: number[]);
    setMinObjective(
      objective: (x: number[], grad?: number[]) => number,
      tolerance: number
    );
    setMaxObjective(
      objective: (x: number[], grad?: number[]) => number,
      tolerance: number
    );
    addInequalityConstraint(
      constraint: (x: number[], grad?: number[]) => number,
      tolerance: number
    );
    addEqualityConstraint(
      constraint: (x: number[], grad?: number[]) => number,
      tolerance: number
    );
    optimize(initialGuessForX: number[]): OptimizationResult;
  }
}
