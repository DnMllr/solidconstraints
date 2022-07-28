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
  Badge,
} from "@hope-ui/solid";
import { Component, createMemo, For, Show } from "solid-js";
import { InteractionCtrl } from "../lib/interactor";

import { GeoLine, SceneCtl } from "../lib/scene";

export interface InspectorProps {
  scene: SceneCtl;
  interactor: InteractionCtrl;
}

interface Elements {
  xLines: GeoLine[];
  yLines: GeoLine[];
}

export const Inspector: Component<InspectorProps> = ({ scene, interactor }) => {
  const elements = createMemo<Elements>(() => {
    const grid = scene.grid();
    const lines = scene.lines();
    return {
      xLines: grid.xs.map((id) => lines[id]),
      yLines: grid.ys.map((id) => lines[id]),
    };
  });
  return (
    <HStack class="w-1/6 h-full min-w-[18rem]">
      <Divider orientation="vertical" variant="dashed" />
      <Tabs class="h-full flex-grow">
        <TabList>
          <Tab>actions</Tab>
          <Tab>info</Tab>
        </TabList>
        <TabPanel>Actions...</TabPanel>
        <TabPanel>
          <Accordion allowMultiple>
            <Show when={elements().xLines.length > 0}>
              <AccordionItem>
                <h2>
                  <AccordionButton _focus={{ boxShadow: "none" }}>
                    <Text class="flex-1" fontWeight="$light">
                      Horizontal Lines
                    </Text>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <VStack alignItems="stretch">
                    <For each={elements().xLines}>
                      {(line) => (
                        <Box>
                          <VStack alignItems="stretch">
                            <HStack justifyContent="space-between">
                              <Badge
                                onMouseEnter={() =>
                                  interactor.ui.hoverElement(line.id)
                                }
                                onMouseLeave={() => interactor.ui.clear()}
                              >
                                {line.id}
                              </Badge>
                              <Text fontWeight="$light">y: {line.v}</Text>
                            </HStack>
                            <Divider />
                          </VStack>
                        </Box>
                      )}
                    </For>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Show>
          </Accordion>
        </TabPanel>
      </Tabs>
    </HStack>
  );
};
