import {
  Box,
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
  createMemo,
  For,
  ParentComponent,
  Show,
} from "solid-js";
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
  const actionTitle = createMemo(() =>
    ActionKind[actionKind()].replace(/([A-Z])/g, " $1").trim()
  );

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
  const selected = () => selectedElements(interactor.action());
  const dragged = () => draggedElements(interactor.action());
  const draggedPoints = () =>
    dragged().filter((id) => scene.lookup(id).kind === Kind.Point);

  return (
    <VStack class="justify-between h-full !items-stretch">
      <Box></Box>
      <Show when={isActiveAction()}>
        <ActionHeader>
          <Text>{actionTitle()}</Text>
          <HStack spacing="$2">
            <Text>{renderPosition(interactor.action(), scene)}</Text>
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
  <VStack alignItems="stretch">
    <Divider />
    <HStack class="p-4 justify-between">{children}</HStack>
  </VStack>
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
