import { Badge } from "@hope-ui/solid";
import { Accessor, Component, createMemo } from "solid-js";
import { isReferencedByAction } from "../lib/actions";
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
    getVariant(isReferencedByAction(id, interactor.action()))
  );
};

const getVariant = (isHighlighted: boolean): "solid" | "subtle" =>
  isHighlighted ? "solid" : "subtle";
