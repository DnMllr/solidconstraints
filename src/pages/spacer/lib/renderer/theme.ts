import { Options } from "roughjs/bin/core";

export interface Theme {
  padding: number;
  base: Options;
  line: BaseGeoTheme;
  point: PointTheme;
}

interface BaseGeoTheme<T = Options> {
  rest: T;
  hovering: T;
  insert: T;
  dragging: T;
  selected: T;
  hoveringSelected: T;
}

interface PointTheme {
  radius: BaseGeoTheme<number>;
  options: BaseGeoTheme;
}

const padding = 10;
const opts: Options = { bowing: 0 };
const solid: Options = { fillStyle: "solid" };
const lessRough: Options = { roughness: 0.6 };
const basePoint: Options = { ...opts, ...solid, ...lessRough };
const dashed: Options = {
  strokeLineDash: [5, 13],
  strokeLineDashOffset: 10,
};

export const defaultTheme: Theme = {
  padding,
  base: opts,
  line: {
    rest: {
      ...opts,
      ...dashed,
      stroke: "gainsboro",
    },
    insert: {
      ...opts,
      stroke: "linen",
    },
    hovering: {
      ...opts,
      stroke: "lavender",
    },
    dragging: {
      ...opts,
      stroke: "lightblue",
    },
    selected: {
      ...opts,
      ...dashed,
      stroke: "palevioletred",
    },
    hoveringSelected: {
      ...opts,
      stroke: "violet",
    },
  },
  point: {
    radius: {
      rest: 7,
      hovering: 10,
      dragging: 5,
      insert: 10,
      selected: 10,
      hoveringSelected: 11,
    },
    options: {
      rest: {
        ...basePoint,
        stroke: "grey",
        fill: "grey",
      },
      insert: {
        ...basePoint,
        stroke: "black",
        fill: "aliceblue",
      },
      hovering: {
        ...basePoint,
        stroke: "black",
        fill: "grey",
      },
      dragging: {
        ...basePoint,
        stroke: "black",
        fill: "lightblue",
      },
      selected: {
        ...basePoint,
        fill: "violet",
        stroke: "red",
      },
      hoveringSelected: {
        ...basePoint,
        fill: "red",
        stroke: "black",
      },
    },
  },
};
