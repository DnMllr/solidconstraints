import {
  Divider,
  HStack,
  TabList,
  Tabs,
  Tab,
  VStack,
  TabPanel,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  Text,
  AccordionIcon,
  AccordionPanel,
} from "@hope-ui/solid";
import { Component, createMemo, For, JSX, Show } from "solid-js";
import { InteractionCtrl } from "../lib/interactor";

import { GeoLine, GeoPoint, SceneCtl } from "../lib/scene";
import { IDBadge } from "./IDBadge";

export interface InspectorProps {
  scene: SceneCtl;
  interactor: InteractionCtrl;
}

interface Elements {
  xLines: GeoLine[];
  yLines: GeoLine[];
  intersections: GeoPoint[];
}

export const Inspector: Component<InspectorProps> = ({ scene, interactor }) => {
  return (
    <Box class="w-1/6 h-5/6 min-w-[24rem] absolute top-3 right-3 border rounded-lg shadow overflow-hidden bg-white">
      <Tabs class="h-full max-h-full !flex flex-col">
        <TabList>
          <Tab _focus={{ boxShadow: "none" }}>Actions</Tab>
          <Tab _focus={{ boxShadow: "none" }}>Scene</Tab>
        </TabList>
        <TabPanel>Actions...</TabPanel>
        <TabPanel class="overflow-y-auto max-h">
          <ElementPanel scene={scene} interactor={interactor} />
        </TabPanel>
      </Tabs>
    </Box>
  );
};

const ElementPanel: Component<InspectorProps> = ({ scene, interactor }) => {
  const elements = createMemo<Elements>(() => {
    const grid = scene.grid();
    const lines = scene.lines();
    const intersections = scene.points();
    return {
      xLines: grid.xs.map((id) => lines[id]),
      yLines: grid.ys.map((id) => lines[id]),
      intersections: Object.values(intersections),
    };
  });

  return (
    <Accordion allowMultiple class="max-h-full">
      <ElementAccordion
        itemsFrom={() => elements().xLines}
        title="Horizontal Lines"
      >
        {(line) => <LineBox line={line} interactor={interactor} />}
      </ElementAccordion>
      <ElementAccordion
        itemsFrom={() => elements().yLines}
        title="Vertical Lines"
      >
        {(line) => <LineBox line={line} interactor={interactor} />}
      </ElementAccordion>
      <ElementAccordion
        itemsFrom={() => elements().intersections}
        title="Points"
      >
        {(point) => <PointBox point={point} interactor={interactor} />}
      </ElementAccordion>
    </Accordion>
  );
};

interface ElementAccordionProps<T> {
  title: string;
  itemsFrom: () => T[];
  children: (item: T) => JSX.Element;
}

const ElementAccordion = <T extends {}>({
  itemsFrom,
  title,
  children,
}: ElementAccordionProps<T>) => {
  return (
    <Show when={itemsFrom().length > 0}>
      <AccordionItem>
        <h2>
          <AccordionButton _focus={{ boxShadow: "none" }}>
            <Text class="flex-1" fontWeight="$light">
              {title}
            </Text>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <VStack alignItems="stretch">
            <For each={itemsFrom()}>{children}</For>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Show>
  );
};

interface LineBoxProps {
  line: GeoLine;
  interactor: InteractionCtrl;
}

const LineBox: Component<LineBoxProps> = ({ line, interactor }) => {
  return (
    <Box class="p-0 mb-8">
      <VStack alignItems="stretch">
        <HStack justifyContent="space-between">
          <IDBadge interactor={interactor} id={line.id} />
          <Text fontWeight="$light" fontSize="$sm">
            {line.v}
          </Text>
        </HStack>
        <Divider />
      </VStack>
    </Box>
  );
};

interface PointBoxProps {
  point: GeoPoint;
  interactor: InteractionCtrl;
}

const PointBox: Component<PointBoxProps> = ({ point, interactor }) => {
  return (
    <Box class="p-0 mb-8">
      <VStack alignItems="stretch">
        <HStack justifyContent="space-between">
          <IDBadge id={point.id} interactor={interactor} />
          <Text fontWeight="$light" fontSize="$sm">
            {point.geom.x}, {point.geom.y}
          </Text>
        </HStack>
        <Divider />
        <Text fontWeight="$light" fontSize="$sm">
          intersection of <IDBadge interactor={interactor} id={point.x} /> and{" "}
          <IDBadge interactor={interactor} id={point.y} />
        </Text>
      </VStack>
    </Box>
  );
};
