import { Position, SceneReader } from "../scene";
import { Action, ActionKind, selectedElements } from "../actions";
import { DrawCommands, pen } from "./draw";
import {
  drawAllPointsInSceneAtRest,
  drawFullSceneAtRest,
  drawSelections,
  renderMouseTicksIfPresent,
} from "./utilities";
import { Direction, Kind } from "../scene/abstractGeometry";
import { GeoLine } from "../scene/geometry";

export const render = (
  scene: SceneReader,
  action: Action,
  el: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const draw = pen({ el, width, height });

  draw.clear();
  draw.canvas.axis();

  renderMouseTicksIfPresent(draw, action as Partial<Position>);
  renderAction(draw, scene, action);
};

const renderAction = (
  draw: DrawCommands,
  scene: SceneReader,
  action: Action
) => {
  const points = scene.points();
  const lines = scene.lines();

  switch (action.kind) {
    case ActionKind.None: {
      // TODO(Dan) polygons
      drawAllPointsInSceneAtRest(draw, scene);
      return;
    }

    case ActionKind.CreateLine:
    case ActionKind.CreateIntersection:
    case ActionKind.CreateIntersectionAlongLine:
    case ActionKind.CreateIntersectionAtIntersection:
    case ActionKind.Interacting: {
      drawFullSceneAtRest(draw, scene);
      return;
    }

    case ActionKind.Selecting: {
      const except = new Set([
        ...action.selected.lines,
        ...action.selected.points,
      ]);

      drawFullSceneAtRest(draw, scene, except);
      drawSelections(draw, scene, action);
      return;
    }

    case ActionKind.PlacingLine: {
      drawFullSceneAtRest(draw, scene);

      switch (action.direction) {
        case Direction.Horizontal: {
          draw.lines.insert.horizontal(action);
          break;
        }

        case Direction.Vertical: {
          draw.lines.insert.vertical(action);
          break;
        }
      }

      return;
    }

    case ActionKind.TouchingLine:
    case ActionKind.HoveringLine: {
      drawFullSceneAtRest(draw, scene, new Set([action.hovered.line]));
      draw.lines.hovering(lines[action.hovered.line].geom);
      return;
    }

    case ActionKind.TouchingSelectedLineWhileSelecting:
    case ActionKind.HoveringSelectedLineWhileSelecting:
    case ActionKind.TouchingLineWhileSelecting:
    case ActionKind.HoveringLineWhileSelecting: {
      const except = new Set([
        ...action.selected.points,
        ...action.selected.lines,
        action.hovered.line,
      ]);

      drawFullSceneAtRest(draw, scene, except);
      drawSelections(draw, scene, action);

      if (action.kind === ActionKind.HoveringLineWhileSelecting) {
        draw.lines.hovering(lines[action.hovered.line].geom);
      } else {
        draw.lines.hoveringSelected(lines[action.hovered.line].geom);
      }

      return;
    }

    case ActionKind.DraggingLine: {
      drawFullSceneAtRest(draw, scene, new Set([action.dragged.line]));
      draw.lines.dragging(lines[action.dragged.line].geom);
      return;
    }

    case ActionKind.DraggingLineWhileSelecting: {
      const except = new Set([
        ...action.selected.points,
        ...action.selected.lines,
        action.dragged.line,
      ]);

      drawFullSceneAtRest(draw, scene, except);
      drawSelections(draw, scene, action);
      draw.lines.dragging(lines[action.dragged.line].geom);
      return;
    }

    case ActionKind.DraggingIntersectionWhileSelecting: {
      const except = new Set([
        ...action.selected.points,
        ...action.selected.lines,
        action.dragged.point,
      ]);

      drawFullSceneAtRest(draw, scene, except);
      drawSelections(draw, scene, action);
      draw.points.dragging(points[action.dragged.point].geom);
      return;
    }

    case ActionKind.DraggingSelectionByLine: {
      const except = new Set([
        ...action.selected.points,
        ...action.selected.lines,
        action.hovered.line,
      ]);

      drawFullSceneAtRest(draw, scene, except);
      drawSelections(draw, scene, action);
      draw.lines.dragging(lines[action.hovered.line].geom);
      return;
    }

    case ActionKind.DraggingSelectionByPoint: {
      const except = new Set<string>([
        ...action.selected.points,
        ...action.selected.lines,
        action.hovered.point,
      ]);

      drawFullSceneAtRest(draw, scene, except);
      drawSelections(draw, scene, action);
      draw.points.dragging(points[action.hovered.point].geom);
      return;
    }

    case ActionKind.PlacingIntersection: {
      drawFullSceneAtRest(draw, scene);
      draw.lines.insert.vertical(action);
      draw.lines.insert.horizontal(action);
      draw.points.insert(action);
      return;
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      drawFullSceneAtRest(draw, scene, new Set(action.hovered.lines));

      const axis: Partial<{ [key in Direction]: GeoLine }> = {};

      for (const id of action.hovered.lines) {
        const line = lines[id];
        axis[line.direction] = line;
        draw.lines.hovering(line.geom);
      }

      const x = axis[Direction.Vertical]?.geom.start.x;
      const y = axis[Direction.Horizontal]?.geom.start.y;

      if (x === undefined || y === undefined) {
        console.error(
          "malformed action, PlacingIntersectionAtIntersection did not have both a horizontal and vertical line"
        );
        return;
      }

      draw.points.insert({ x, y });
      return;
    }

    case ActionKind.PlacingIntersectionAlongLine: {
      drawFullSceneAtRest(draw, scene, new Set([action.hovered.line]));

      const line = lines[action.hovered.line];
      draw.lines.hovering(line.geom);

      switch (line.direction) {
        case Direction.Vertical: {
          draw.points.insert({ x: line.geom.start.x, y: action.y });
          break;
        }

        case Direction.Horizontal: {
          draw.points.insert({ x: action.x, y: line.geom.start.y });
          break;
        }
      }

      return;
    }

    case ActionKind.TouchingIntersection:
    case ActionKind.HoveringIntersection: {
      drawFullSceneAtRest(draw, scene, new Set([action.hovered.point]));
      draw.points.hovering(points[action.hovered.point].geom);
      return;
    }

    case ActionKind.TouchingSelectedIntersectionWhileSelecting:
    case ActionKind.HoveringSelectedIntersectionWhileSelecting:
    case ActionKind.TouchingIntersectionWhileSelecting:
    case ActionKind.HoveringIntersectionWhileSelecting: {
      const except = new Set<string>([
        ...action.selected.points,
        ...action.selected.lines,
        action.hovered.point,
      ]);

      drawFullSceneAtRest(draw, scene, except);
      drawSelections(draw, scene, action);

      if (action.kind === ActionKind.HoveringIntersectionWhileSelecting) {
        draw.points.hovering(points[action.hovered.point].geom);
      } else {
        draw.points.hoveringSelected(points[action.hovered.point].geom);
      }

      return;
    }

    case ActionKind.DraggingIntersection: {
      drawFullSceneAtRest(draw, scene, new Set([action.dragged.point]));
      draw.points.dragging(points[action.dragged.point].geom);
      return;
    }

    case ActionKind.UIHoveringElement: {
      drawFullSceneAtRest(draw, scene, new Set([action.hovered]));

      const el = scene.lookup(action.hovered);

      if (!el) {
        console.error(
          `malformed action. UI attempted to hover unknown element of id ${action.hovered}`
        );
        return;
      }

      switch (el.kind) {
        case Kind.Line: {
          draw.lines.hovering(el.geom);
          break;
        }

        case Kind.Point: {
          draw.points.hovering(el.geom);
          break;
        }
      }

      return;
    }

    case ActionKind.UIHoveringElementWhileSelecting: {
      drawFullSceneAtRest(draw, scene, new Set([action.hovered]));

      const el = scene.lookup(action.hovered);

      if (!el) {
        console.error(
          `malformed action: missing hovered element of id [${action.hovered}]`
        );
        return;
      }

      switch (el.kind) {
        case Kind.Line: {
          if (action.selected.lines.includes(el.id)) {
            draw.lines.hoveringSelected(el.geom);
          } else {
            draw.lines.selected(el.geom);
          }
          break;
        }

        case Kind.Point: {
          if (action.selected.points.includes(el.id)) {
            draw.points.hoveringSelected(el.geom);
          } else {
            draw.points.selected(el.geom);
          }
          break;
        }
      }

      for (const id of selectedElements(action)) {
        if (id !== action.hovered) {
          const el = scene.lookup(id);

          if (!el) {
            console.error(
              `malformed action: missing selected element of id [${id}]`
            );
            return;
          }

          switch (el.kind) {
            case Kind.Line: {
              draw.lines.selected(el.geom);
              break;
            }

            case Kind.Point: {
              draw.points.selected(el.geom);
              break;
            }
          }
        }
      }

      return;
    }
  }
};
