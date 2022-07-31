import { assert, integer, property, webUrl } from "fast-check";
import { describe, test, expect } from "vitest";
import { createNumberInput } from "./numberInput";

describe("string", () => {
  test("returns a valid string if set", () => {
    const ni = createNumberInput(0);
    expect(ni.string()).toBe("0");
    assert(
      property(integer(), (n) => {
        ni.setString(n.toString());
        expect(ni.string()).toBe(n.toString());
      })
    );
  });

  test("returns whatever was set even in the case of invalid input", () => {
    const ni = createNumberInput(0);
    assert(
      property(integer(), webUrl(), (i, u) => {
        ni.setString(i.toString());
        expect(ni.string()).toBe(i.toString());
        ni.setString(u);
        expect(ni.string()).toBe(u);
      })
    );
  });
});

describe("number", () => {
  test("returns a valid number if set", () => {
    const ni = createNumberInput(0);
    expect(ni.number()).toBe(0);
    assert(
      property(integer(), (n) => {
        ni.setString(n.toString());
        expect(ni.number()).toBe(n);
      })
    );
  });

  test("returns the last valid input if invalid input is passed", () => {
    const ni = createNumberInput(0);
    assert(
      property(integer(), webUrl(), (i, u) => {
        ni.setString(i.toString());
        expect(ni.number()).toBe(i);
        ni.setString(u);
        expect(ni.number()).toBe(i);
      })
    );
  });
});

describe("invalid", () => {
  test("returns false if a valid number is set", () => {
    const ni = createNumberInput(0);
    expect(ni.invalid()).toBe(false);
    assert(
      property(integer(), (n) => {
        ni.setString(n.toString());
        expect(ni.invalid()).toBe(false);
      })
    );
  });

  test("returns true if invalid input is passed", () => {
    const ni = createNumberInput(0);
    assert(
      property(integer(), webUrl(), (i, u) => {
        ni.setString(i.toString());
        expect(ni.invalid()).toBe(false);
        ni.setString(u);
        expect(ni.invalid()).toBe(true);
      })
    );
  });
});
