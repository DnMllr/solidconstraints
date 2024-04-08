import { assert, property } from "fast-check";
import { describe, test, expect } from "vitest";
import { RecordOf } from "../../../../../../lib/utilities";
import { Domain, DomainKind, HasDomain, simplifyDomains } from ".";
import { arbitraryDomainAndStore } from "./testing";

describe.skip("simplifyDomains", () => {
  test("exits successfully on self reference", () => {
    const store: RecordOf<HasDomain> = {
      a: {
        domain: {
          kind: DomainKind.GreaterThan,
          child: { kind: DomainKind.Ref, ref: "a" },
        },
      },
    };

    expect(() => {
      simplifyDomains(store.a.domain, store);
    }).not.toThrow();
  });

  test("Empty domains are already as simple as they can be", () => {
    const domain: Domain = { kind: DomainKind.Empty };
    expect(simplifyDomains(domain, {})).toEqual(domain);
  });

  test("Constant domains are already as simple as they can be", () => {
    const domain: Domain = { kind: DomainKind.Constant, value: 0 };
    expect(simplifyDomains(domain, {})).toEqual(domain);
  });

  test("Complete domains are already as simple as they can be", () => {
    const domain: Domain = { kind: DomainKind.Complete };
    expect(simplifyDomains(domain, {})).toEqual(domain);
  });

  test("The And of an empty domain and anything should be Empty", () => {
    const empty: Domain = { kind: DomainKind.Empty };
    assert(
      property(arbitraryDomainAndStore(), ({ domain, store }) => {
        expect(
          simplifyDomains(
            {
              kind: DomainKind.And,
              left: empty,
              right: domain,
            },
            store
          )
        ).toEqual(empty);

        expect(
          simplifyDomains(
            {
              kind: DomainKind.And,
              left: domain,
              right: empty,
            },
            store
          )
        ).toEqual(empty);
      })
    );
  });

  test("The And of a constant and anything other than an empty should be that constant", () => {
    const constant: Domain = { kind: DomainKind.Constant, value: 0 };
    assert(
      property(arbitraryDomainAndStore(), ({ domain, store }) => {
        expect(
          simplifyDomains(
            {
              kind: DomainKind.And,
              left: constant,
              right: domain,
            },
            store
          )
        ).toEqual(constant);

        expect(
          simplifyDomains(
            {
              kind: DomainKind.And,
              left: domain,
              right: constant,
            },
            store
          )
        ).toEqual(constant);
      })
    );
  });
});
