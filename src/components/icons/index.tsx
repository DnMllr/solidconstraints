import { createIcon } from "@hope-ui/solid";
import { JSX } from "solid-js/jsx-runtime";

const phosphor = (svg: () => JSX.Element): ReturnType<typeof createIcon> =>
  createIcon({
    viewBox: "0 0 255 255",
    path: svg,
  });

export const LineUp = phosphor(() => (
  <g>
    <rect width="256" height="256" fill="none"></rect>
    <polyline
      points="96 56 128 24 160 56"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></polyline>
    <line
      x1="128"
      y1="232"
      x2="128"
      y2="24"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
    <polyline
      points="160 200 128 232 96 200"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></polyline>
  </g>
));

export const LineSideways = phosphor(() => (
  <g>
    <rect width="256" height="256" fill="none"></rect>
    <polyline
      points="56 96 24 128 56 160"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></polyline>
    <polyline
      points="200 96 232 128 200 160"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></polyline>
    <line
      x1="24"
      y1="128"
      x2="232"
      y2="128"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
  </g>
));

export const MagnifyPlus = phosphor(() => (
  <g>
    <rect width="256" height="256" fill="none"></rect>
    <line
      x1="84"
      y1="116"
      x2="148"
      y2="116"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
    <line
      x1="116"
      y1="84"
      x2="116"
      y2="148"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
    <circle
      cx="116"
      cy="116"
      r="84"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></circle>
    <line
      x1="175.4"
      y1="175.4"
      x2="224"
      y2="224"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
  </g>
));

export const MagnifyMinus = phosphor(() => (
  <g>
    <rect width="256" height="256" fill="none"></rect>
    <line
      x1="84"
      y1="116"
      x2="148"
      y2="116"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
    <circle
      cx="116"
      cy="116"
      r="84"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></circle>
    <line
      x1="175.4"
      y1="175.4"
      x2="224"
      y2="224"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
  </g>
));

export const Asterisk = phosphor(() => (
  <g>
    <rect width="256" height="256" fill="none"></rect>
    <line
      x1="128"
      y1="40"
      x2="128"
      y2="216"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
    <line
      x1="51.8"
      y1="84"
      x2="204.2"
      y2="172"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
    <line
      x1="51.8"
      y1="172"
      x2="204.2"
      y2="84"
      fill="none"
      stroke="#000000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    ></line>
  </g>
));

export const Grid = phosphor(() => (
  <g>
    <rect width="256" height="256" fill="none"></rect>
    <circle cx="60" cy="60" r="12"></circle>
    <circle cx="128" cy="60" r="12"></circle>
    <circle cx="196" cy="60" r="12"></circle>
    <circle cx="60" cy="128" r="12"></circle>
    <circle cx="128" cy="128" r="12"></circle>
    <circle cx="196" cy="128" r="12"></circle>
    <circle cx="60" cy="196" r="12"></circle>
    <circle cx="128" cy="196" r="12"></circle>
    <circle cx="196" cy="196" r="12"></circle>
  </g>
));
