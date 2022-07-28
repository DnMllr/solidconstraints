import { Geometry, Kind, SceneReader } from "./scene";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import {
  Action,
  ActionKind,
  getTarget,
  getXPosition,
  getYPosition,
} from "./actions";

const padding = 10;
const opts: Options = { bowing: 0 };
const black: Options = { ...opts, stroke: "black" };
const grey: Options = { ...opts, stroke: "grey" };
const lightgrey: Options = { ...opts, stroke: "lightgrey" };
const dashedGrey: Options = {
  ...opts,
  stroke: "grey",
  strokeLineDash: [5, 13],
  strokeLineDashOffset: 10,
};

interface Position {
  x: number;
  y: number;
}

const drawAxis = (rc: RoughCanvas, width: number, height: number) => {
  rc.line(padding, padding * 2, padding, height - padding * 2, opts);
  rc.line(
    padding * 2,
    height - padding,
    width - padding * 2,
    height - padding,
    opts
  );
};

const drawMouseTicks = (rc: RoughCanvas, action: Action, height: number) => {
  const y = getYPosition(action);
  if (y != null) {
    rc.line(padding / 2, y, padding * 1.5 + 4, y, opts);
  }

  const x = getXPosition(action);
  if (x != null) {
    rc.line(x, height - (padding * 1.5 + 4), x, height - padding / 2, opts);
  }
};

const drawHorizontalInsertLine = (
  rc: RoughCanvas,
  { x, y }: Position,
  width: number
) => {
  rc.line(
    Math.max(x - 500, padding * 3),
    y,
    Math.min(x + 500, width - padding * 3),
    y,
    lightgrey
  );
};

const drawVerticalInsertLine = (
  rc: RoughCanvas,
  { x, y }: Position,
  height: number
) => {
  rc.line(
    x,
    Math.max(y - 500, padding * 3),
    x,
    Math.min(y + 500, height - padding * 3),
    lightgrey
  );
};

const drawInsertPoint = (rc: RoughCanvas, { x, y }: Position) => {
  rc.circle(x, y, 23, lightgrey);
};

const drawTarget = (
  rc: RoughCanvas,
  scene: SceneReader,
  targets: Set<string>,
  width: number,
  height: number
) => {
  for (let targetID of targets.values()) {
    const target = scene.lookup(targetID);
    if (target.kind === Kind.Line) {
      rc.line(
        Math.max(target.geom.start.x, padding),
        Math.max(target.geom.start.y, padding),
        Math.min(target.geom.end.x, width),
        Math.min(target.geom.end.y, height),
        grey
      );
    }

    if (target.kind === Kind.Point) {
      rc.circle(target.geom.x, target.geom.y, 14, black);
    }
  }
};

const drawNonTargetElements = (
  rc: RoughCanvas,
  scene: SceneReader,
  targets: Set<string> | undefined,
  width: number,
  height: number
) => {
  for (let el of Object.values(scene.lines())) {
    if (targets && targets.has(el.id)) {
      continue;
    }

    rc.line(
      Math.max(el.geom.start.x, padding),
      Math.max(el.geom.start.y, padding),
      Math.min(el.geom.end.x, width),
      Math.min(el.geom.end.y, height),
      dashedGrey
    );
  }

  for (let el of Object.values(scene.points())) {
    if (targets && targets.has(el.id)) {
      continue;
    }

    rc.circle(el.geom.x, el.geom.y, 11, grey);
  }
};

const drawPoints = (rc: RoughCanvas, scene: SceneReader) => {
  for (let el of Object.values(scene.points())) {
    rc.circle(el.geom.x, el.geom.y, 11, grey);
  }
};

const drawBaseScene = (
  rc: RoughCanvas,
  scene: SceneReader,
  action: Action,
  width: number,
  height: number
) => {
  drawMouseTicks(rc, action, height);
  const target = getTarget(action);
  const targets = new Set<string>();

  if (target != null) {
    targets.add(target);
  }

  if (action.kind === ActionKind.PlacingIntersectionAtIntersection) {
    targets.add(action.horizontal);
    targets.add(action.vertical);
  }

  drawNonTargetElements(rc, scene, targets, width, height);
  drawTarget(rc, scene, targets, width, height);
};

const drawAction = (
  rc: RoughCanvas,
  scene: SceneReader,
  action: Action,
  width: number,
  height: number
) => {
  switch (action.kind) {
    case ActionKind.PlacingHorizontalLine:
      drawHorizontalInsertLine(rc, { x: action.x, y: action.y }, width);
      return;

    case ActionKind.PlacingVerticalLine:
      drawVerticalInsertLine(rc, { x: action.x, y: action.y }, width);
      return;

    case ActionKind.PlacingIntersection:
      drawInsertPoint(rc, { x: action.x, y: action.y });
      drawVerticalInsertLine(rc, { x: action.x, y: action.y }, width);
      drawHorizontalInsertLine(rc, { x: action.x, y: action.y }, width);
      return;

    case ActionKind.PlacingIntersectionAlongHorizontalLine: {
      const line = scene.lines()[action.target];
      drawInsertPoint(rc, { x: action.x, y: line.v });
      drawVerticalInsertLine(rc, { x: action.x, y: action.y }, width);
      return;
    }

    case ActionKind.PlacingIntersectionAlongVerticalLine: {
      const line = scene.lines()[action.target];
      drawInsertPoint(rc, { x: line.v, y: action.y });
      drawHorizontalInsertLine(rc, { x: action.x, y: action.y }, width);
      return;
    }

    case ActionKind.PlacingIntersectionAtIntersection: {
      const lines = scene.lines();
      const h = lines[action.horizontal];
      const v = lines[action.vertical];
      drawInsertPoint(rc, { x: v.v, y: h.v });
      return;
    }
  }
};

export const render = (
  scene: SceneReader,
  action: Action,
  el: HTMLCanvasElement,
  width: number,
  height: number
) => {
  el.getContext("2d").clearRect(0, 0, width, height);
  const rc = rough.canvas(el);
  drawAxis(rc, width, height);
  if (action.kind !== ActionKind.None) {
    drawBaseScene(rc, scene, action, width, height);
    drawAction(rc, scene, action, width, height);
  } else {
    if (Object.values(scene.polygons()).length > 0) {
      // TODO(Dan): Draw polygons
    } else {
      drawPoints(rc, scene);
    }
  }
};
