import { Component, createMemo, For, JSX, Show } from "solid-js";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  VStack,
  Text,
} from "@hope-ui/solid";

import { InteractionCtrl } from "../lib/interactor";
import { GeoLine, GeoPoint, SceneCtl } from "../lib/scene";
import { IDBadge } from "./IDBadge";

interface Elements {
  xLines: GeoLine[];
  yLines: GeoLine[];
  intersections: GeoPoint[];
}

export interface ElementPanelProps {
  scene: SceneCtl;
  interactor: InteractionCtrl;
}

export const ElementPanel: Component<ElementPanelProps> = ({
  scene,
  interactor,
}) => {
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
    <Accordion allowMultiple class="max-h-full p-0">
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

const ElementAccordion = <T,>({
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
          <VStack alignItems="stretch" spacing="$3">
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
    <Box class="p-0">
      <VStack alignItems="stretch">
        <HStack justifyContent="space-between">
          <IDBadge interactor={interactor} id={line.id} />
          <Text fontWeight="$light" fontSize="$sm">
            {line.v}
          </Text>
        </HStack>
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
    <Box class="p-0">
      <VStack alignItems="stretch">
        <HStack justifyContent="space-between">
          <IDBadge id={point.id} interactor={interactor} />
          <Text fontWeight="$light" fontSize="$sm">
            {point.geom.x}, {point.geom.y}
          </Text>
        </HStack>
        <Text fontWeight="$light" fontSize="$sm">
          intersection of <IDBadge interactor={interactor} id={point.x} /> and{" "}
          <IDBadge interactor={interactor} id={point.y} />
        </Text>
      </VStack>
    </Box>
  );
};
