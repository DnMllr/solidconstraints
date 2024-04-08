import { describe, expect, test } from "vitest";
import nlopt from "nlopt-js";
import { dual, sub, abs, add } from "@thi.ng/dual-algebra";

describe("nlopt sanity check", () => {
  // this test exists just to demonstrate the general pattern that will be used for approaching nlopt
  // we use a dual-algebra library from @thi.ng to maintain gradients while computing our cost and
  // constraint functions and then feed that information into a solver in nlopt.
  // For now, we will probably use ISRES, which does not require a gradient to be passed. For that reason
  // hopefully stage2 will not require differential programming.
  test("basic nlopt with auto differentiation", async () => {
    const n = 2;
    await nlopt.ready;

    const opt = new nlopt.Optimize(nlopt.Algorithm.GN_ISRES, n);

    opt.setMaxtime(10000);
    opt.setMaxeval(1000000);
    opt.setUpperBounds([100, 100]);
    opt.setLowerBounds([0, 0]);

    let gradA = false;
    let gradB = false;

    opt.setMinObjective((x, grad) => {
      const a = dual(x[0], 2, 0);
      const b = dual(x[1], 2, 1);
      const [v, dx, dy] = abs(sub(a, b));
      if (grad) {
        gradA = true;
        grad[0] = dx;
        grad[1] = dy;
      }
      return v;
    }, 1e-12);

    opt.addInequalityConstraint((x, grad) => {
      const s = dual(7, 2, 0);
      const a = dual(x[0], 2, 1);
      const b = dual(x[1], 2, 2);
      const [v, dx, dy] = sub(add(s, b), a);
      if (grad) {
        gradB = true;
        grad[0] = dx;
        grad[1] = dy;
      }
      return v;
    }, 1e-12);

    let res: nlopt.OptimizationResult | undefined;
    expect(() => {
      res = opt.optimize([1, 6]);
    }).not.toThrow();

    expect(res).toBeDefined();
    expect(res?.success).toBe(true);
    expect(Math.round(res?.value ?? 0)).toBe(7);
    expect(gradA).toBe(false);
    expect(gradB).toBe(false);

    nlopt.GC.flush();
  });
});
