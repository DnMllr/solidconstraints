import { HasSelections } from "../actions";
import { Position, SceneReader } from "../scene";
import { DrawCommands } from "./draw";

export const renderMouseTicksIfPresent = (
  draw: DrawCommands,
  action: Partial<Position>
) => {
  draw.canvas.mouseTicks(action);
};

export const drawAllPointsInSceneAtRest = (
  draw: DrawCommands,
  scene: SceneReader,
  except?: Set<string>
) => {
  for (const point of Object.values(scene.points())) {
    if (except?.has(point.id)) {
      continue;
    }

    draw.points.rest(point.geom);
  }
};

export const drawAllLinesInSceneAtRest = (
  draw: DrawCommands,
  scene: SceneReader,
  except?: Set<string>
) => {
  for (const line of Object.values(scene.lines())) {
    if (except?.has(line.id)) {
      continue;
    }

    draw.lines.rest(line.geom);
  }
};

export const drawFullSceneAtRest = (
  draw: DrawCommands,
  scene: SceneReader,
  except?: Set<string>
) => {
  drawAllPointsInSceneAtRest(draw, scene, except);
  drawAllLinesInSceneAtRest(draw, scene, except);
};

export const drawSelections = (
  draw: DrawCommands,
  scene: SceneReader,
  action: HasSelections,
  except?: Set<string>
) => {
  const points = scene.points();
  const lines = scene.lines();

  for (const id of action.selected.lines) {
    if (except?.has(id)) {
      continue;
    }

    draw.lines.selected(lines[id].geom);
  }

  for (const id of action.selected.points) {
    if (except?.has(id)) {
      continue;
    }

    draw.points.selected(points[id].geom);
  }
};
