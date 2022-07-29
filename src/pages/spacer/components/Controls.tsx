import { Component, createEffect, For, JSX, Show } from "solid-js";
import {
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@hope-ui/solid";
import {
  Asterisk,
  Grid,
  LineSideways,
  LineUp,
  MagnifyMinus,
  MagnifyPlus,
} from "../../../components/icons";
import { ControlsCtrl, createNumberInput, Mode } from "../lib/controls";

export interface ControlsProps {
  ctrl: ControlsCtrl;
}

interface IconButtonProps {
  label: string;
  targetMode: Mode;
  onClick: (e: MouseEvent) => void;
  icon: JSX.Element;
}

export const Controls: Component<ControlsProps> = ({ ctrl }) => {
  const leftButtons: IconButtonProps[] = [
    {
      label: "enter point mode",
      onClick: () => ctrl.togglePointMode(),
      targetMode: Mode.Point,
      icon: <Asterisk />,
    },
    {
      label: "enter horizontal line mode",
      onClick: () => ctrl.toggleHorizontalLineMode(),
      targetMode: Mode.HorizontalLine,
      icon: <LineSideways />,
    },
    {
      label: "enter vertical line mode",
      onClick: () => ctrl.toggleVerticalLineMode(),
      targetMode: Mode.VerticalLine,
      icon: <LineUp />,
    },
  ];

  const toIconButton = (item: IconButtonProps) => (
    <IconButton
      _focus={{ boxShadow: "none" }}
      onClick={item.onClick}
      icon={item.icon}
      variant={ctrl.controls.mode === item.targetMode ? "solid" : "ghost"}
      aria-label={item.label}
    />
  );

  return (
    <VStack class="w-full border-b shadow bg-white">
      <HStack spacing="$4" class="p-2 w-full">
        <For each={leftButtons}>{toIconButton}</For>
        <LeftButtons ctrl={ctrl} />
      </HStack>
    </VStack>
  );
};

const LeftButtons: Component<ControlsProps> = ({ ctrl }) => {
  return (
    <HStack spacing="$4" class="flex-grow" justifyContent="flex-end">
      <GridControls ctrl={ctrl} />
      <InspectorButton ctrl={ctrl} />
    </HStack>
  );
};

const GridControls: Component<ControlsProps> = ({ ctrl }) => {
  const x = createNumberInput(50);
  const y = createNumberInput(50);

  const set = () => {
    ctrl.setGrid(x.number(), y.number());
  };

  const sync = () => {
    if (ctrl.controls.grid != null) {
      set();
    }
  };

  createEffect(sync);

  return (
    <HStack spacing="$2" class="flex-fit">
      <Show when={ctrl.controls.grid != null}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">X</InputLeftElement>
          <Input
            width="$24"
            invalid={x.invalid()}
            type="number"
            placeholder="x grid size"
            value={x.string()}
            onInput={(e) => x.setString((e.target as HTMLInputElement).value)}
          />
        </InputGroup>
        <InputGroup>
          <InputLeftElement pointerEvents="none">Y</InputLeftElement>
          <Input
            width="$24"
            invalid={y.invalid()}
            type="number"
            placeholder="y grid size"
            value={y.string()}
            onInput={(e) => y.setString((e.target as HTMLInputElement).value)}
          />
        </InputGroup>
      </Show>
      <IconButton
        minWidth="40px"
        _focus={{ boxShadow: "none" }}
        onClick={() => (ctrl.controls.grid != null ? ctrl.unsetGrid() : set())}
        icon={<Grid />}
        variant={ctrl.controls.grid != null ? "solid" : "ghost"}
        aria-label="set a grid for the viewport"
      />
    </HStack>
  );
};

const InspectorButton: Component<ControlsProps> = ({ ctrl }) => (
  <IconButton
    _focus={{ boxShadow: "none" }}
    onClick={() => ctrl.toggleInspector()}
    icon={ctrl.controls.inspectorOpen ? <MagnifyMinus /> : <MagnifyPlus />}
    variant={ctrl.controls.inspectorOpen ? "solid" : "ghost"}
    aria-label="enter x axis line mode"
  />
);
