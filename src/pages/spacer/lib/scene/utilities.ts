import { RecordOf } from "../../../../lib/utilities";
import { HasID } from "./id";

export const toRecord = <T extends HasID>(list: T[]): RecordOf<T> =>
  list.reduce((m, i) => {
    m[i.id] = i;
    return m;
  }, {});
