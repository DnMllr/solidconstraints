import { HStack, VStack } from "@hope-ui/solid";
import { Component, Show } from "solid-js";
import { Viewport, ViewportStage, Controls } from "./components";
import { Inspector } from "./components/Inspector";
import { createControls } from "./lib/controls";
import { createScene } from "./lib/scene";

export const Spacer: Component = () => {
  const controls = createControls();
  const scene = createScene();
  return (
    <VStack class="w-full h-full" alignItems="flex-start">
      <Controls ctrl={controls} />
      <HStack
        class="flex-grow w-full"
        alignItems="stretch"
        justifyContent="stretch"
      >
        <ViewportStage>
          <Viewport padding={10} scene={scene} controls={controls} />
        </ViewportStage>
        <Show when={controls.controls.inspectorOpen}>
          <Inspector scene={scene} />
        </Show>
      </HStack>
    </VStack>
  );
};
