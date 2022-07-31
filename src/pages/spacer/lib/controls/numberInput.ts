import { batch } from "solid-js";
import { createStore } from "solid-js/store";

export interface NumberInput {
  string(): string;
  number(): number;
  invalid(): boolean;
  setString(input: string): void;
}

export const createNumberInput = (value: number): NumberInput => {
  const [store, set] = createStore({
    value,
    rawValue: value.toString(),
    isValid: true,
  });

  return {
    string() {
      if (store.isValid) {
        return store.value.toString();
      }
      return store.rawValue;
    },
    number() {
      return store.value;
    },
    invalid(): boolean {
      return !store.isValid;
    },
    setString(input: string) {
      batch(() => {
        set("rawValue", input);
        try {
          const value = parseInt(input);
          if (!isNaN(value)) {
            set("value", value);
            set("isValid", true);
          } else {
            set("isValid", false);
          }
        } catch {
          set("isValid", false);
        }
      });
    },
  };
};
