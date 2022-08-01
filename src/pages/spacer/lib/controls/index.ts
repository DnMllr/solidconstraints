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
      if (x <= 0 || y <= 0) {
        throw new Error("grid values must be a positive non zero number");
      }

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

export const isInVerticalLineMode = ({ mode }: ControlsState) =>
  mode === Mode.VerticalLine;
export const isInHorizontalLineMode = ({ mode }: ControlsState) =>
  mode === Mode.HorizontalLine;
export const isInIntersectionMode = ({ mode }: ControlsState) =>
  mode === Mode.Point;
export const isInNoneMode = ({ mode }: ControlsState) => mode === Mode.None;
