import { Badge } from "@hope-ui/solid";
import { Accessor, Component, createMemo } from "solid-js";
import { Action } from "../lib/actions";
import { InteractionCtrl } from "../lib/interactor";

export interface IDBadgeProps {
  id: string;
  interactor: InteractionCtrl;
}

export const IDBadge: Component<IDBadgeProps> = ({ id, interactor }) => {
  const variant = createVariant(interactor, id);
  return (
    <Badge
      variant={variant()}
      onMouseEnter={() => {
        interactor.ui.hoverElement(id);
      }}
      onMouseLeave={() => {
        interactor.ui.clear();
      }}
    >
      {id}
    </Badge>
  );
};

const createVariant = (
  interactor: InteractionCtrl,
  id: string
): Accessor<"solid" | "subtle"> => {
  return createMemo(() =>
    getVariant(isElementHovered(interactor.action(), id))
  );
};

const getVariant = (isHighlighted: boolean): "solid" | "subtle" =>
  isHighlighted ? "solid" : "subtle";

const isElementHovered = (action: Action, id: string): boolean => {
  if ("hovered" in action) {
    return deepSearch(id, ["point", "points", "line", "lines"], action.hovered);
  }

  return false;
};

const deepSearch = (target: string, validKeys: string[], obj: any): boolean => {
  if (!obj) {
    return false;
  }

  if (typeof obj === "string") {
    return obj === target;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (deepSearch(target, validKeys, item)) {
        return true;
      }
    }
  }

  if (typeof obj === "object") {
    for (const key of validKeys) {
      if (deepSearch(target, validKeys, obj[key])) {
        return true;
      }
    }
  }

  return false;
};
