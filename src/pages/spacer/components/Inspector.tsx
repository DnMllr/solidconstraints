import { TabList, Tabs, Tab, TabPanel, Box } from "@hope-ui/solid";
import { Component } from "solid-js";
import { ActionPanel } from "./ActionPanel";

import { ElementPanel, ElementPanelProps } from "./ElementPanel";

export const Inspector: Component<ElementPanelProps> = ({
  scene,
  interactor,
}) => {
  return (
    <Box class="w-1/6 min-w-[24rem] absolute top-5 right-5 border rounded-lg shadow overflow-hidden bg-white">
      <Tabs class="h-full max-h-full !flex flex-col">
        <TabList>
          <Tab _focus={{ boxShadow: "none" }}>Action</Tab>
          <Tab _focus={{ boxShadow: "none" }}>Scene</Tab>
        </TabList>
        <TabPanel class="overflow-y-auto h-full !p-0">
          <ActionPanel interactor={interactor} scene={scene} />
        </TabPanel>
        <TabPanel class="overflow-y-auto h-full !p-0">
          <ElementPanel scene={scene} interactor={interactor} />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
