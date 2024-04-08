import { RecordOf } from "../../../../../../lib/utilities";

export enum DomainKind {
  Or,
  And,
  GreaterThan,
  LessThan,
  Constant,
  Ref,
  Complete,
  Empty,
}

export interface HasDomain {
  domain: Domain;
}

export interface HasDomainKind<T extends DomainKind> {
  kind: T;
}

export interface Binary {
  left: Domain;
  right: Domain;
}

export interface Unary {
  child: Domain;
}

export interface Nullary {
  value: number;
}

export type OrDomain = HasDomainKind<DomainKind.Or> & Binary;
export type AndDomain = HasDomainKind<DomainKind.And> & Binary;
export type GreaterThanDomain = HasDomainKind<DomainKind.GreaterThan> & Unary;
export type LessThanDomain = HasDomainKind<DomainKind.LessThan> & Unary;
export type ConstantDomain = HasDomainKind<DomainKind.Constant> & Nullary;
export type CompleteDomain = HasDomainKind<DomainKind.Complete>;
export type EmptyDomain = HasDomainKind<DomainKind.Empty>;
export interface RefDomain extends HasDomainKind<DomainKind.Ref> {
  ref: string;
}

export type Domain =
  | OrDomain
  | AndDomain
  | GreaterThanDomain
  | LessThanDomain
  | ConstantDomain
  | RefDomain
  | EmptyDomain
  | CompleteDomain;

export enum SimplificationStatus {
  Continue,
  Complete,
}

export interface Simplification {
  status: SimplificationStatus;
  domain: Domain;
}

export const simplifyDomains = <T extends HasDomain>(
  domain: Domain,
  store: RecordOf<T>
): Domain => runSimplificationWithMemo(domain, {}, store);

const runSimplificationWithMemo = <T extends HasDomain>(
  domain: Domain,
  memo: RecordOf<boolean | undefined>,
  store: RecordOf<T>
): Domain => {
  let count = 0;
  let simplification = { domain, status: SimplificationStatus.Continue };
  while (simplification.status === SimplificationStatus.Continue) {
    simplification = simplifyAndFlattenDomains(
      simplification.domain,
      memo,
      store
    );

    if (count++ > 1000) {
      throw new Error("infinite loop");
    }
  }

  return simplification.domain;
};

// TODO(Dan) simplification could use some work.
const simplifyAndFlattenDomains = <T extends HasDomain>(
  domain: Domain,
  memo: RecordOf<boolean | undefined>,
  store: RecordOf<T>
): Simplification => {
  switch (domain.kind) {
    case DomainKind.Constant:
    case DomainKind.Complete:
    case DomainKind.Empty: {
      return {
        status: SimplificationStatus.Complete,
        domain,
      };
    }

    case DomainKind.Ref: {
      if (memo[domain.ref]) {
        return {
          status: SimplificationStatus.Complete,
          domain: store[domain.ref].domain,
        };
      }

      memo[domain.ref] = true;
      store[domain.ref].domain = runSimplificationWithMemo(
        store[domain.ref].domain,
        memo,
        store
      );

      return {
        status: SimplificationStatus.Complete,
        domain: store[domain.ref].domain,
      };
    }

    // TODO(Dan) there are more cases here we can simplify. Lots of pattern matching code.
    // I wish I was writing rust.
    case DomainKind.And: {
      // switch (true) {} doesn't narrow in typescript... what a bummer
      // https://github.com/microsoft/TypeScript/issues/8934

      domain.left = runSimplificationWithMemo(domain.left, memo, store);
      domain.right = runSimplificationWithMemo(domain.left, memo, store);

      if (
        domain.left.kind === DomainKind.Empty ||
        domain.right.kind === DomainKind.Empty
      ) {
        return {
          status: SimplificationStatus.Complete,
          domain: { kind: DomainKind.Empty },
        };
      }

      if (domain.left.kind === DomainKind.Complete) {
        return {
          status: SimplificationStatus.Continue,
          domain: domain.right,
        };
      }

      if (domain.right.kind === DomainKind.Complete) {
        return {
          status: SimplificationStatus.Continue,
          domain: domain.left,
        };
      }

      if (domain.left.kind === DomainKind.Constant) {
        if (domain.right.kind == DomainKind.Constant) {
          if (domain.left.value === domain.right.value) {
            return {
              status: SimplificationStatus.Complete,
              domain: domain.left,
            };
          } else {
            return {
              status: SimplificationStatus.Complete,
              domain: { kind: DomainKind.Empty },
            };
          }
        }

        if (domain.right.kind === DomainKind.GreaterThan) {
          domain.right.child = runSimplificationWithMemo(
            domain.right.child,
            memo,
            store
          );
          if (domain.right.child.kind === DomainKind.Constant) {
          }
        }
      }
      if (
        domain.left.kind === DomainKind.Constant &&
        domain.right.kind === DomainKind.Constant
      ) {
      }

      if (
        domain.left.kind === DomainKind.Constant &&
        domain.right.kind === DomainKind.GreaterThan
      ) {
      }

      return { domain, status: SimplificationStatus.Complete };
    }

    // TODO(Dan): there are more cases here we can simplify
    case DomainKind.Or: {
      if (
        domain.left.kind === DomainKind.Complete ||
        domain.right.kind === DomainKind.Complete
      ) {
        return {
          status: SimplificationStatus.Complete,
          domain: { kind: DomainKind.Complete },
        };
      }

      if (domain.left.kind === DomainKind.Empty) {
        return {
          status: SimplificationStatus.Continue,
          domain: domain.right,
        };
      }

      if (domain.right.kind === DomainKind.Empty) {
        return {
          status: SimplificationStatus.Continue,
          domain: domain.left,
        };
      }

      return { domain, status: SimplificationStatus.Complete };
    }
  }

  throw new Error("todo");
};

export const extractRefs = (domain: Domain): Set<string> => {
  const set = new Set<string>();
  extractRefsToSet(domain, set);
  return set;
};

const extractRefsToSet = (domain: Domain, set: Set<string>) => {
  switch (domain.kind) {
    case DomainKind.Ref: {
      set.add(domain.ref);
      return;
    }

    case DomainKind.Constant:
    case DomainKind.Complete:
    case DomainKind.Empty: {
      return;
    }

    case DomainKind.And:
    case DomainKind.Or: {
      extractRefsToSet(domain.left, set);
      extractRefsToSet(domain.right, set);
      return;
    }

    case DomainKind.GreaterThan:
    case DomainKind.LessThan: {
      extractRefsToSet(domain.child, set);
      return;
    }
  }
};
