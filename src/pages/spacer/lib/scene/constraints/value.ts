import { nanoid } from "nanoid";
import { HasID } from "../id";
import { Domain } from "./domain";

export enum State {
  Free,
  Locked,
  Asserting,
}

export enum ValueState {
  Bound,
  Unbound,
}

export interface Network {
  lookupValue(id: string);
}

export interface Value extends HasID {
  state: State;
  domain?: Domain;
}
