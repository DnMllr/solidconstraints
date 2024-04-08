import { HStack, VStack } from "@hope-ui/solid";
import { Component, Show } from "solid-js";
import { Viewport, ViewportStage, Controls } from "./components";
import { Inspector } from "./components/Inspector";
import { createControls } from "./lib/controls";
import { createInteractor } from "./lib/interactor";
import { createScene } from "./lib/scene";

export const Spacer: Component = () => {
  const scene = createScene();
  const controls = createControls();
  const interactor = createInteractor(scene, controls.controls);

  return (
    <VStack class="w-full h-full absolute" alignItems="flex-start">
      <Controls ctrl={controls} />
      <HStack
        class="flex-grow w-full relative"
        alignItems="stretch"
        justifyContent="stretch"
      >
        <ViewportStage>
          <Viewport
            padding={10}
            scene={scene}
            controls={controls}
            interactor={interactor}
          />
        </ViewportStage>
        <Show when={controls.controls.inspectorOpen}>
          <Inspector scene={scene} interactor={interactor} />
        </Show>
      </HStack>
    </VStack>
  );
};
