import {
  Box,
  Divider,
  HStack,
  ListIcon,
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
  Match,
  ParentComponent,
  Show,
  Switch,
} from "solid-js";
import {
  ActionKind,
  draggedElements,
  hoveredElements,
  lookupActionKind,
  selectedElements,
} from "../lib/actions";

import { InteractionCtrl } from "../lib/interactor";
import { Geometry, Kind, SceneReader } from "../lib/scene";
import { IDBadge } from "./IDBadge";

export interface ActionPanelProps {
  interactor: InteractionCtrl;
  scene: SceneReader;
}

export const ActionPanel: Component<ActionPanelProps> = ({
  interactor,
  scene,
}) => {
  return (
    <Box>
      <ActionDescription interactor={interactor} scene={scene} />
    </Box>
  );
};

export interface ActionDescriptionProps {
  interactor: InteractionCtrl;
  scene: SceneReader;
}

const ActionDescription: Component<ActionDescriptionProps> = ({
  interactor,
  scene,
}) => {
  const actionKind = () => interactor.action().kind;
  const hovered = createMemo(() =>
    hoveredElements(interactor.action()).map(scene.lookup)
  );
  const selected = createMemo(() =>
    selectedElements(interactor.action()).map(scene.lookup)
  );
  const dragged = createMemo(() =>
    draggedElements(interactor.action()).map(scene.lookup)
  );
  const actionName = createMemo(() =>
    lookupActionKind(actionKind())
      .replace(/([A-Z])/g, " $1")
      .trim()
  );

  const actionIs = (kind: ActionKind) => actionKind() === kind;

  return (
    <Switch>
      <Match when={actionIs(ActionKind.Selecting)}>
        <Action>
          <ActionHeader>Selecting</ActionHeader>
          <SelectionList selected={selected} interactor={interactor} />
        </Action>
      </Match>
      {/* <Match when={actionIs(ActionKind.CreateLine)}></Match> */}
    </Switch>
  );
};

const ActionHeader: ParentComponent = ({ children }) => (
  <VStack alignItems="flex-start" class="mb-4">
    <Text class="p-4">{children}</Text>
    <Divider />
  </VStack>
);

const Action: ParentComponent = ({ children }) => (
  <VStack alignItems="flex-start w-full h-full">{children}</VStack>
);

interface SelectionListProps {
  selected: Accessor<Geometry[]>;
  interactor: InteractionCtrl;
}

const SelectionList: Component<SelectionListProps> = ({
  selected,
  interactor,
}) => {
  const selectedElementsByKind = createMemo(() => {
    const group = {
      [Kind.Line]: [],
      [Kind.Point]: [],
      [Kind.Segment]: [],
      [Kind.Ring]: [],
      [Kind.Poly]: [],
    };

    for (const el of selected()) {
      group[el.kind].push(el);
    }

    return group;
  });

  return (
    <UnorderedList class="px-4">
      <For each={Object.entries(selectedElementsByKind())}>
        {([kind, els]) => (
          <Show when={els.length > 0}>
            <ListItem>
              <Text>
                <HStack spacing="$1">
                  <h4 class="inline">{Kind[kind]}s</h4>:{" "}
                  <For each={els}>
                    {(el) => <IDBadge id={el.id} interactor={interactor} />}
                  </For>
                </HStack>
              </Text>
            </ListItem>
          </Show>
        )}
      </For>
    </UnorderedList>
  );
};
