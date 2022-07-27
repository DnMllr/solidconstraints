import {
  Divider,
  HStack,
  TabList,
  Tabs,
  Tab,
  VStack,
  TabPanel,
  Box,
  Heading,
} from "@hope-ui/solid";
import { Component, createMemo, For, Show } from "solid-js";

import { GeoLine, SceneCtl } from "../lib/scene";

export interface InspectorProps {
  scene: SceneCtl;
}

interface Elements {
  xLines: GeoLine[];
  yLines: GeoLine[];
}

export const Inspector: Component<InspectorProps> = ({ scene }) => {
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
          <VStack
            spacing="23px"
            class="h-full w-full"
            alignItems="stretch"
            justifyContent="flex-start"
          >
            <Show when={elements().xLines.length > 0}>
              <Box>
                <Heading>Horizontal Lines</Heading>
                <Divider orientation="horizontal" variant="dashed" />
                <VStack
                  spacing="7px"
                  class="h-full w-full"
                  alignItems="stretch"
                  justifyContent="flex-start"
                >
                  <For each={elements().xLines}>
                    {(item) => (
                      <Box>
                        <Heading>{item.id}</Heading>
                        {item.v}
                      </Box>
                    )}
                  </For>
                </VStack>
              </Box>
            </Show>
            <Show when={elements().yLines.length > 0}>
              <Box>
                <Heading>Vertical Lines</Heading>
                <Divider orientation="horizontal" variant="dashed" />
                <VStack
                  spacing="7px"
                  class="h-full w-full"
                  alignItems="stretch"
                  justifyContent="flex-start"
                >
                  <For each={elements().yLines}>
                    {(item) => (
                      <Box>
                        <Heading>{item.id}</Heading>
                        {item.v}
                      </Box>
                    )}
                  </For>
                </VStack>
              </Box>
            </Show>
          </VStack>
        </TabPanel>
      </Tabs>
    </HStack>
  );
};
