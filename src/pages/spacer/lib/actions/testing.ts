import {
  Arbitrary,
  constant,
  nat,
  oneof,
  tuple,
  uniqueArray,
} from "fast-check";
import {
  Action,
  ActionKind,
  CreateIntersectionAction,
  CreateIntersectionAlongIntersectionAction,
  CreateIntersectionAlongLineAction,
  CreateLineAction,
  DraggingIntersectionAction,
  DraggingIntersectionWhileSelectingAction,
  DraggingLineAction,
  DraggingLineWhileSelectingAction,
  DraggingSelectionByLineAction,
  DraggingSelectionByPointAction,
  HasActionKind,
  HasDirection,
  HasDragged,
  HasHovered,
  HasLine,
  HasLines,
  HasPoint,
  HasPoints,
  HasSelections,
  HoveringIntersectionAction,
  HoveringIntersectionWhileSelectingAction,
  HoveringLineAction,
  HoveringLineWhileSelectingAction,
  HoveringSelectedIntersectionWhileSelectingAction,
  HoveringSelectedLineWhileSelectingAction,
  InteractingAction,
  NonInteractingAction,
  PlacingIntersectionAction,
  PlacingIntersectionAlongLineAction,
  PlacingIntersectionAtIntersectionAction,
  PlacingLineAction,
  SelectingAction,
  TouchingIntersectionAction,
  TouchingIntersectionWhileSelectingAction,
  TouchingLineAction,
  TouchingLineWhileSelectingAction,
  TouchingSelectedIntersectionWhileSelectingAction,
  TouchingSelectedLineWhileSelectingAction,
  UIHoveringElementAction,
  UIHoveringElementWhileSelectingAction,
} from ".";
import {
  arbitraryDirection,
  arbitraryElementID,
  arbitraryPosition,
} from "../scene/testing";

if (import.meta.env.PROD) {
  console.warn("testing file was required in a PROD build");
}

export const arbitraryActionKind = () =>
  nat(Object.keys(ActionKind).length / 2 - 1);

export const arbitraryHasActionKind = (): Arbitrary<
  HasActionKind<ActionKind>
> =>
  arbitraryActionKind().map((k) => ({
    kind: k,
  }));

export const arbitraryHasPoint = (): Arbitrary<HasPoint> =>
  arbitraryElementID().map((point) => ({ point }));

export const arbitraryHasPoints = (): Arbitrary<HasPoints> =>
  uniqueArray(arbitraryElementID()).map((points) => ({ points }));

export const arbitraryHasLine = (): Arbitrary<HasLine> =>
  arbitraryElementID().map((line) => ({ line }));

export const arbitraryHasLines = (): Arbitrary<HasLines> =>
  uniqueArray(arbitraryElementID()).map((lines) => ({ lines }));

export const arbitraryHasHovered = <T>(
  hoveredElements: Arbitrary<T>
): Arbitrary<HasHovered<T>> => hoveredElements.map((hovered) => ({ hovered }));

export const arbitraryHasDragged = <T>(
  draggedElements: Arbitrary<T>
): Arbitrary<HasDragged<T>> => draggedElements.map((dragged) => ({ dragged }));

export const arbitraryHasDirection = (): Arbitrary<HasDirection> =>
  arbitraryDirection().map((direction) => ({ direction }));

export const arbitrarySelections = (): Arbitrary<HasSelections> =>
  tuple(arbitraryHasPoints(), arbitraryHasLines()).map(([p, l]) => ({
    selected: {
      ...p,
      ...l,
    },
  }));

export const arbitraryNonInteractingAction =
  (): Arbitrary<NonInteractingAction> => constant({ kind: ActionKind.None });

export const arbitraryInteractingAction = (): Arbitrary<InteractingAction> =>
  arbitraryPosition().map((p) => ({ kind: ActionKind.Interacting, ...p }));

export const arbitrarySelectingAction = (): Arbitrary<SelectingAction> =>
  tuple(arbitrarySelections(), arbitraryPosition()).map(([selections, p]) => ({
    kind: ActionKind.Selecting,
    ...selections,
    ...p,
  }));

export const arbitraryPlacingLineAction = (): Arbitrary<PlacingLineAction> =>
  tuple(arbitraryHasDirection(), arbitraryPosition()).map(([d, p]) => ({
    kind: ActionKind.PlacingLine,
    ...d,
    ...p,
  }));

export const arbitraryHoveringLineAction = (): Arbitrary<HoveringLineAction> =>
  tuple(arbitraryHasHovered(arbitraryHasLine()), arbitraryPosition()).map(
    ([h, p]) => ({ kind: ActionKind.HoveringLine, ...h, ...p })
  );

export const arbitraryHoveringLineWhileSelectingAction =
  (): Arbitrary<HoveringLineWhileSelectingAction> =>
    tuple(
      arbitraryHasHovered(arbitraryHasLine()),
      arbitraryPosition(),
      arbitrarySelections()
    ).map(([h, p, s]) => ({
      kind: ActionKind.HoveringLineWhileSelecting,
      ...h,
      ...p,
      ...s,
    }));

export const arbitraryHoveringSelectedLineWhileSelectingAction =
  (): Arbitrary<HoveringSelectedLineWhileSelectingAction> =>
    tuple(
      arbitraryHasHovered(arbitraryHasLine()),
      arbitraryPosition(),
      arbitrarySelections()
    ).map(([h, p, s]) => ({
      kind: ActionKind.HoveringSelectedLineWhileSelecting,
      ...h,
      ...p,
      ...s,
    }));

export const arbitraryHoveringIntersectionWhileSelectingAction =
  (): Arbitrary<HoveringIntersectionWhileSelectingAction> =>
    tuple(arbitraryHasHovered(arbitraryHasPoint()), arbitrarySelections()).map(
      ([h, s]) => ({
        kind: ActionKind.HoveringIntersectionWhileSelecting,
        ...h,
        ...s,
      })
    );

export const arbitraryHoveringSelectedIntersectionWhileSelectingAction =
  (): Arbitrary<HoveringSelectedIntersectionWhileSelectingAction> =>
    tuple(arbitraryHasHovered(arbitraryHasPoint()), arbitrarySelections()).map(
      ([h, s]) => ({
        kind: ActionKind.HoveringSelectedIntersectionWhileSelecting,
        ...h,
        ...s,
      })
    );

export const arbitraryTouchingLineAction = (): Arbitrary<TouchingLineAction> =>
  arbitraryHasHovered(arbitraryHasLine()).map((h) => ({
    kind: ActionKind.TouchingLine,
    ...h,
  }));

export const arbitraryTouchingLineWhileSelectingAction =
  (): Arbitrary<TouchingLineWhileSelectingAction> =>
    tuple(arbitraryHasHovered(arbitraryHasLine()), arbitrarySelections()).map(
      ([h, s]) => ({ kind: ActionKind.TouchingLineWhileSelecting, ...h, ...s })
    );

export const arbitraryDraggingLineAction = (): Arbitrary<DraggingLineAction> =>
  tuple(arbitraryHasDragged(arbitraryHasLine()), arbitraryPosition()).map(
    ([d, p]) => ({ kind: ActionKind.DraggingLine, ...d, ...p })
  );

export const arbitraryDraggingLineWhileSelectingAction =
  (): Arbitrary<DraggingLineWhileSelectingAction> =>
    tuple(
      arbitraryHasDragged(arbitraryHasLine()),
      arbitraryPosition(),
      arbitrarySelections()
    ).map(([d, p, s]) => ({
      kind: ActionKind.DraggingLineWhileSelecting,
      ...d,
      ...p,
      ...s,
    }));

export const arbitraryDraggingIntersectionWhileSelectingAction =
  (): Arbitrary<DraggingIntersectionWhileSelectingAction> =>
    tuple(
      arbitraryHasDragged(arbitraryHasPoint()),
      arbitraryPosition(),
      arbitrarySelections()
    ).map(([d, p, s]) => ({
      kind: ActionKind.DraggingIntersectionWhileSelecting,
      ...d,
      ...p,
      ...s,
    }));

export const arbitraryPlacingIntersectionAction =
  (): Arbitrary<PlacingIntersectionAction> =>
    arbitraryPosition().map((p) => ({
      kind: ActionKind.PlacingIntersection,
      ...p,
    }));

export const arbitraryPlacingIntersectionAlongLineAction =
  (): Arbitrary<PlacingIntersectionAlongLineAction> =>
    tuple(arbitraryHasHovered(arbitraryHasLine()), arbitraryPosition()).map(
      ([h, p]) => ({
        kind: ActionKind.PlacingIntersectionAlongLine,
        ...h,
        ...p,
      })
    );

export const arbitraryHoveringIntersectionAction =
  (): Arbitrary<HoveringIntersectionAction> =>
    tuple(arbitraryHasHovered(arbitraryHasPoint()), arbitraryPosition()).map(
      ([h, p]) => ({
        kind: ActionKind.HoveringIntersection,
        ...h,
        ...p,
      })
    );

export const arbitraryTouchingIntersectionAction =
  (): Arbitrary<TouchingIntersectionAction> =>
    arbitraryHasHovered(arbitraryHasPoint()).map((h) => ({
      kind: ActionKind.TouchingIntersection,
      ...h,
    }));

export const arbitraryDraggingIntersectionAction =
  (): Arbitrary<DraggingIntersectionAction> =>
    tuple(
      arbitraryHasDragged(
        tuple(arbitraryHasPoint(), arbitraryHasLines()).map(([p, l]) => ({
          ...p,
          ...l,
        }))
      ),
      arbitraryPosition()
    ).map(([d, p]) => ({ kind: ActionKind.DraggingIntersection, ...d, ...p }));

export const arbitraryCreateLineAction = (): Arbitrary<CreateLineAction> =>
  tuple(arbitraryHasDirection(), arbitraryPosition()).map(([d, p]) => ({
    kind: ActionKind.CreateLine,
    ...d,
    ...p,
  }));

export const arbitraryCreateIntersectionAction =
  (): Arbitrary<CreateIntersectionAction> =>
    arbitraryPosition().map((p) => ({
      kind: ActionKind.CreateIntersection,
      ...p,
    }));

export const arbitraryCreateIntersectionAlongLineAction =
  (): Arbitrary<CreateIntersectionAlongLineAction> =>
    tuple(arbitraryHasHovered(arbitraryHasLine()), arbitraryPosition()).map(
      ([d, p]) => ({ kind: ActionKind.CreateIntersectionAlongLine, ...d, ...p })
    );

export const arbitraryCreateIntersectionAlongIntersectionAction =
  (): Arbitrary<CreateIntersectionAlongIntersectionAction> =>
    arbitraryHasHovered(arbitraryHasLines()).map((h) => ({
      kind: ActionKind.CreateIntersectionAtIntersection,
      ...h,
    }));

export const arbitraryPlacingIntersectionAtIntersectionAction =
  (): Arbitrary<PlacingIntersectionAtIntersectionAction> =>
    tuple(arbitraryHasHovered(arbitraryHasLines()), arbitraryPosition()).map(
      ([h, p]) => ({
        kind: ActionKind.PlacingIntersectionAtIntersection,
        ...h,
        ...p,
      })
    );

export const arbitraryTouchingSelectedIntersectionWhileSelectingAction =
  (): Arbitrary<TouchingSelectedIntersectionWhileSelectingAction> =>
    tuple(arbitraryHasHovered(arbitraryHasPoint()), arbitrarySelections()).map(
      ([h, s]) => ({
        kind: ActionKind.TouchingSelectedIntersectionWhileSelecting,
        ...h,
        ...s,
      })
    );

export const arbitraryTouchingIntersectionWhileSelectingAction =
  (): Arbitrary<TouchingIntersectionWhileSelectingAction> =>
    tuple(arbitraryHasHovered(arbitraryHasPoint()), arbitrarySelections()).map(
      ([h, p]) => ({
        kind: ActionKind.TouchingIntersectionWhileSelecting,
        ...h,
        ...p,
      })
    );

export const arbitraryTouchingSelectedLineWhileSelectingAction =
  (): Arbitrary<TouchingSelectedLineWhileSelectingAction> =>
    tuple(arbitraryHasHovered(arbitraryHasLine()), arbitrarySelections()).map(
      ([h, p]) => ({
        kind: ActionKind.TouchingSelectedLineWhileSelecting,
        ...h,
        ...p,
      })
    );

export const arbitraryDraggingSelectionByLineAction =
  (): Arbitrary<DraggingSelectionByLineAction> =>
    tuple(
      arbitrarySelections(),
      arbitraryHasHovered(arbitraryHasLine()),
      arbitraryPosition()
    ).map(([s, h, p]) => ({
      kind: ActionKind.DraggingSelectionByLine,
      ...s,
      ...h,
      ...p,
    }));

export const arbitraryDraggingSelectionByPointAction =
  (): Arbitrary<DraggingSelectionByPointAction> =>
    tuple(
      arbitrarySelections(),
      arbitraryHasHovered(arbitraryHasPoint()),
      arbitraryPosition()
    ).map(([s, h, p]) => ({
      kind: ActionKind.DraggingSelectionByPoint,
      ...s,
      ...h,
      ...p,
    }));

export const arbitraryUIHoveringElementAction =
  (): Arbitrary<UIHoveringElementAction> =>
    arbitraryHasHovered(arbitraryElementID()).map((h) => ({
      kind: ActionKind.UIHoveringElement,
      ...h,
    }));

export const arbitraryUIHoveringElementWhileSelectingAction =
  (): Arbitrary<UIHoveringElementWhileSelectingAction> =>
    tuple(arbitraryHasHovered(arbitraryElementID()), arbitrarySelections()).map(
      ([h, s]) => ({
        kind: ActionKind.UIHoveringElementWhileSelecting,
        ...h,
        ...s,
      })
    );

export const arbitraryAction = (): Arbitrary<Action> =>
  oneof(
    arbitraryNonInteractingAction(),
    arbitraryInteractingAction(),
    arbitrarySelectingAction(),
    arbitraryCreateLineAction(),
    arbitraryCreateIntersectionAlongLineAction(),
    arbitraryCreateIntersectionAlongIntersectionAction(),
    arbitraryHoveringLineWhileSelectingAction(),
    arbitraryHoveringSelectedIntersectionWhileSelectingAction(),
    arbitraryHoveringSelectedLineWhileSelectingAction(),
    arbitraryHoveringIntersectionWhileSelectingAction(),
    arbitraryTouchingLineAction(),
    arbitraryTouchingLineWhileSelectingAction(),
    arbitraryTouchingIntersectionWhileSelectingAction(),
    arbitraryTouchingSelectedLineWhileSelectingAction(),
    arbitraryHoveringLineAction(),
    arbitraryTouchingIntersectionAction(),
    arbitraryTouchingSelectedIntersectionWhileSelectingAction(),
    arbitraryPlacingLineAction(),
    arbitraryPlacingIntersectionAction(),
    arbitraryPlacingIntersectionAlongLineAction(),
    arbitraryPlacingIntersectionAtIntersectionAction(),
    arbitraryHoveringIntersectionAction(),
    arbitraryDraggingLineAction(),
    arbitraryDraggingLineWhileSelectingAction(),
    arbitraryDraggingIntersectionAction(),
    arbitraryDraggingIntersectionWhileSelectingAction(),
    arbitraryDraggingSelectionByPointAction(),
    arbitraryDraggingSelectionByLineAction(),
    arbitraryCreateIntersectionAction(),
    arbitraryUIHoveringElementAction(),
    arbitraryUIHoveringElementWhileSelectingAction()
  );
