import { nanoid } from "nanoid";

import { RecordOf } from "../../../../lib/utilities";

export interface HasID {
  id: string;
}

export class Identifier {
  cache: RecordOf<string | undefined> = {};

  next(key: string): string {
    let id = this.cache[key];
    if (id !== undefined) {
      return id;
    }

    id = nanoid(6);
    this.cache[key] = id;

    return id;
  }
}
