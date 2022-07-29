import { batch } from "solid-js";
import { createStore } from "solid-js/store";

export enum Mode {
  None,
  HorizontalLine,
  VerticalLine,
  Point,
}

export interface ControlsState {
  inspectorOpen: boolean;
  mode: Mode;
  grid: { x: number; y: number } | undefined;
}

export interface ControlsCtrl {
  controls: ControlsState;
  setGrid(x: number, y: number): void;
  unsetGrid(): void;
  openInspector(): void;
  closeInspector(): void;
  toggleInspector(): void;
  enterHorizontalLineMode(): void;
  enterVerticalLineMode(): void;
  enterPointMode(): void;
  exitMode(): void;
  toggleHorizontalLineMode(): void;
  toggleVerticalLineMode(): void;
  togglePointMode(): void;
}

export const createControls = (): ControlsCtrl => {
  const [controls, setControls] = createStore<ControlsState>({
    inspectorOpen: false,
    mode: Mode.None,
    grid: undefined,
  });

  return {
    controls,
    setGrid(x: number, y: number) {
      setControls("grid", { x, y });
    },
    unsetGrid() {
      setControls("grid", undefined);
    },
    openInspector() {
      setControls("inspectorOpen", true);
    },
    closeInspector() {
      setControls("inspectorOpen", false);
    },
    toggleInspector() {
      setControls("inspectorOpen", (x) => !x);
    },
    enterHorizontalLineMode() {
      setControls("mode", Mode.HorizontalLine);
    },
    enterVerticalLineMode() {
      setControls("mode", Mode.VerticalLine);
    },
    enterPointMode() {
      setControls("mode", Mode.Point);
    },
    toggleHorizontalLineMode() {
      setControls("mode", (m) =>
        m === Mode.HorizontalLine ? Mode.None : Mode.HorizontalLine
      );
    },
    toggleVerticalLineMode() {
      setControls("mode", (m) =>
        m === Mode.VerticalLine ? Mode.None : Mode.VerticalLine
      );
    },
    togglePointMode() {
      setControls("mode", (m) => (m === Mode.Point ? Mode.None : Mode.Point));
    },
    exitMode() {
      setControls("mode", Mode.None);
    },
  };
};

export const createNumberInput = (value: number) => {
  const [store, set] = createStore({
    value,
    rawValue: value.toString(),
    isValid: true,
  });

  return {
    string() {
      if (store.isValid) {
        return store.value;
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
          set("value", value);
        } catch {
          set("isValid", false);
        }
      });
    },
  };
};
