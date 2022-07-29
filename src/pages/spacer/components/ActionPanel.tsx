import {
  Box,
  Button,
  Divider,
  HStack,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@hope-ui/solid";
import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  For,
  ParentComponent,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import {
  Action,
  ActionKind,
  draggedElements,
  hoveredElements,
  selectedElements,
} from "../lib/actions";

import { InteractionCtrl } from "../lib/interactor";
import { Direction, Kind, SceneReader } from "../lib/scene";
import { IDBadge } from "./IDBadge";

export interface ActionPanelProps {
  interactor: InteractionCtrl;
  scene: SceneReader;
}

export const ActionPanel: Component<ActionPanelProps> = ({
  interactor,
  scene,
}) => {
  const actionKind = createMemo(() => interactor.action().kind);
  const actionTitle = createMemo(() => enumToEnglish(ActionKind[actionKind()]));

  const isActiveAction = createMemo(() => {
    switch (actionKind()) {
      case ActionKind.None:
      case ActionKind.Interacting:
      case ActionKind.Selecting:
      case ActionKind.CreateLine:
      case ActionKind.CreateIntersection:
      case ActionKind.UIHoveringElement:
      case ActionKind.UIHoveringElementWhileSelecting:
        return false;
    }
    return true;
  });

  const hovered = () => hoveredElements(interactor.action());
  const dragged = () => draggedElements(interactor.action());
  const draggedPoints = () =>
    dragged().filter((id) => scene.lookup(id).kind === Kind.Point);

  const selected = () => selectedElements(interactor.action());
  const selectedLines = () =>
    selected().filter((id) => scene.lookup(id).kind === Kind.Line);
  const selectedVerticalLines = createMemo(() => {
    return selectedLines().filter((id) => {
      const line = scene.lookup(id);
      if (line.kind === Kind.Line) {
        return line.direction === Direction.Vertical;
      }

      return false;
    });
  });
  const selectedHorizontalLines = createMemo(() => {
    return selectedLines().filter((id) => {
      const line = scene.lookup(id);
      if (line.kind === Kind.Line) {
        return line.direction === Direction.Horizontal;
      }

      return false;
    });
  });
  const selectedPoints = createMemo(() =>
    selected().filter((id) => scene.lookup(id).kind === Kind.Point)
  );

  const createActions = createMemo(() => {
    const hLines = selectedHorizontalLines();
    const vLines = selectedVerticalLines();
    const points = selectedPoints();

    if (hLines.length === 0 && vLines.length === 0) {
      if (points.length === 2) {
        return [
          ActionType.CreateDistanceConstraint,
          ActionType.CreateLineSegment,
        ];
      }

      if (points.length > 2) {
        return [ActionType.CreateRingFromPoints];
      }
    }

    if (points.length === 0) {
      if (hLines.length > 0 && vLines.length > 0) {
        return [ActionType.CreatePointsAtIntersections];
      }

      if (
        (hLines.length > 1 && vLines.length === 0) ||
        (hLines.length === 0 && vLines.length > 1)
      ) {
        return [ActionType.CreateDistanceConstraint];
      }
    }

    return [];
  });

  const distance = (description: string, left: string, right: string) => {
    const a = scene.lookup(left);
    const b = scene.lookup(right);
    return {
      description,
      leftID: a.id,
      rightID: b.id,
      distance: new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 1,
      }).format(a.geom.distanceTo(b.geom)[0]),
    };
  };

  const createDistance = createMemo(
    () => {
      const hLines = selectedHorizontalLines();
      const vLines = selectedVerticalLines();
      const points = selectedPoints();

      if (points.length === 1 && hLines.length === 1) {
        return distance("point and line", points[0], hLines[0]);
      }

      if (points.length === 1 && vLines.length === 1) {
        return distance("point and line", points[0], vLines[0]);
      }

      if (vLines.length === 2) {
        return distance("lines", vLines[0], vLines[1]);
      }

      if (hLines.length === 2) {
        return distance("lines", hLines[0], hLines[1]);
      }

      if (points.length === 2) {
        return distance("points", points[0], points[1]);
      }

      return null;
    },
    undefined,
    {
      equals: (a, b) => {
        if (a == null || b == null) {
          return a == b;
        }
        return a.leftID === b.leftID && a.rightID === b.rightID;
      },
    }
  );

  return (
    <VStack class="justify-between h-full !items-stretch">
      <VStack class="!items-stretch">
        <Show when={createDistance()}>
          {(d) => (
            <Box class="p-4">
              <Text size="sm">
                Distance between {d.description} (
                <IDBadge id={d.leftID} interactor={interactor} />,{" "}
                <IDBadge id={d.rightID} interactor={interactor} />) {d.distance}
              </Text>
            </Box>
          )}
        </Show>
        <Show when={createActions()}>
          {(actions) => (
            <VStack class="!items-stretch" spacing="$2">
              <For each={actions}>
                {(actionType) => (
                  <Button>{enumToEnglish(ActionType[actionType])}</Button>
                )}
              </For>
            </VStack>
          )}
        </Show>
      </VStack>
      <Show when={isActiveAction()}>
        <ActionHeader>
          <Text size="sm">{actionTitle()}</Text>
          <HStack spacing="$2">
            <Text size="sm">{renderPosition(interactor.action(), scene)}</Text>
            <Show when={dragged().length === 0}>
              <For each={hovered()}>
                {(id) => <IDBadge id={id} interactor={interactor} />}
              </For>
            </Show>
            <Show when={draggedPoints().length === 0}>
              <For each={dragged()}>
                {(id) => <IDBadge id={id} interactor={interactor} />}
              </For>
            </Show>
            <For each={draggedPoints()}>
              {(id) => <IDBadge id={id} interactor={interactor} />}
            </For>
          </HStack>
        </ActionHeader>
      </Show>
    </VStack>
  );
};

const ActionHeader: ParentComponent = ({ children }) => (
  <Portal mount={document.body}>
    <VStack
      alignItems="stretch"
      class="w-1/6 min-w-[24rem] absolute bottom-5 right-5 border rounded-lg shadow overflow-hidden bg-white"
    >
      <Divider />
      <HStack class="p-4 justify-between">{children}</HStack>
    </VStack>
  </Portal>
);

const renderPosition = (action: Action, scene: SceneReader) => {
  switch (action.kind) {
    case ActionKind.PlacingLine: {
      switch (action.direction) {
        case Direction.Horizontal: {
          return `Y: ${action.y}`;
        }

        case Direction.Vertical: {
          return `X: ${action.x}`;
        }
      }
    }

    case ActionKind.DraggingLine: {
      const line = scene.lines()[action.dragged.line];
      switch (line.direction) {
        case Direction.Horizontal: {
          return `Y: ${action.y}`;
        }

        case Direction.Vertical: {
          return `X: ${action.x}`;
        }
      }
    }

    case ActionKind.DraggingIntersection:
    case ActionKind.PlacingIntersection: {
      return `${action.x} ${action.y}`;
    }
  }

  return "";
};

enum ActionType {
  CreatePointsAtIntersections,
  CreateDistanceConstraint,
  CreateRingFromPoints,
  CreateLineSegment,
}

const enumToEnglish = (a: string): string => {
  return a.replace(/([A-Z])/g, " $1").trim();
};
