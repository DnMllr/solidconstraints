import {
  Arbitrary,
  constant,
  createDepthIdentifier,
  double,
  letrec,
  LetrecTypedBuilder,
  oneof,
  record,
  uuid,
} from "fast-check";
import { RecordOf } from "../../../../../../lib/utilities";
import {
  AndDomain,
  CompleteDomain,
  ConstantDomain,
  Domain,
  DomainKind,
  EmptyDomain,
  extractRefs,
  GreaterThanDomain,
  HasDomain,
  LessThanDomain,
  OrDomain,
  RefDomain,
} from ".";

const depthIdentifier = createDepthIdentifier();

interface DomainNoRefs {
  tree: Domain;
  or: OrDomain;
  and: AndDomain;
  greaterThan: GreaterThanDomain;
  lessThan: LessThanDomain;
  constant: ConstantDomain;
  complete: CompleteDomain;
  empty: EmptyDomain;
}

interface DomainLetRec extends DomainNoRefs {
  ref: RefDomain;
}

export const arbitraryDomain = (): Arbitrary<Domain> =>
  letrec(fullDomainTieBuilder).tree;
export const arbitraryDomainNoRefs = (): Arbitrary<Domain> =>
  letrec(fullDomainNoRefsTieBuilder).tree;

export const arbitraryStoreFromDomain = (
  domain: Domain
): Arbitrary<RecordOf<HasDomain>> => {
  const obj = {};

  for (const ref of extractRefs(domain)) {
    obj[ref] = record({
      domain: arbitraryDomainNoRefs(),
    });
  }

  return record(obj);
};

interface DomainAndStore {
  domain: Domain;
  store: RecordOf<HasDomain>;
}

export const arbitraryDomainAndStore = (): Arbitrary<DomainAndStore> =>
  arbitraryDomain().chain((domain) =>
    arbitraryStoreFromDomain(domain).map((store) => ({ domain, store }))
  );

const fullDomainTieBuilder: LetrecTypedBuilder<DomainLetRec> = (tie) => ({
  tree: oneof(
    { depthSize: "small", depthIdentifier },
    tie("constant"),
    tie("or"),
    tie("and"),
    tie("greaterThan"),
    tie("lessThan"),
    tie("ref"),
    tie("complete"),
    tie("empty")
  ),
  or: record({
    kind: constant(DomainKind.Or),
    left: tie("tree"),
    right: tie("tree"),
  }),
  and: record({
    kind: constant(DomainKind.And),
    left: tie("tree"),
    right: tie("tree"),
  }),
  greaterThan: record({
    kind: constant(DomainKind.GreaterThan),
    child: tie("tree"),
  }),
  lessThan: record({
    kind: constant(DomainKind.LessThan),
    child: tie("tree"),
  }),
  constant: record({
    kind: constant(DomainKind.Constant),
    value: double({ noNaN: true, noDefaultInfinity: true }),
  }),
  ref: record({
    kind: constant(DomainKind.Ref),
    ref: uuid(),
  }),
  complete: constant({
    kind: DomainKind.Complete,
  }),
  empty: constant({
    kind: DomainKind.Empty,
  }),
});

const fullDomainNoRefsTieBuilder: LetrecTypedBuilder<DomainLetRec> = (tie) => ({
  tree: oneof(
    { depthSize: "small", depthIdentifier },
    tie("constant"),
    tie("or"),
    tie("and"),
    tie("greaterThan"),
    tie("lessThan"),
    tie("ref"),
    tie("complete"),
    tie("empty")
  ),
  or: record({
    kind: constant(DomainKind.Or),
    left: tie("tree"),
    right: tie("tree"),
  }),
  and: record({
    kind: constant(DomainKind.And),
    left: tie("tree"),
    right: tie("tree"),
  }),
  greaterThan: record({
    kind: constant(DomainKind.GreaterThan),
    child: tie("tree"),
  }),
  lessThan: record({
    kind: constant(DomainKind.LessThan),
    child: tie("tree"),
  }),
  constant: record({
    kind: constant(DomainKind.Constant),
    value: double({ noNaN: true, noDefaultInfinity: true }),
  }),
  ref: record({
    kind: constant(DomainKind.Ref),
    ref: uuid(),
  }),
  complete: constant({
    kind: DomainKind.Complete,
  }),
  empty: constant({
    kind: DomainKind.Empty,
  }),
});
