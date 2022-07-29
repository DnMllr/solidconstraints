/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";

import App from "./App";

const root = document.getElementById("root");
if (root) {
  render(() => <App />, root);
} else {
  throw new Error("document is missing a #root");
}
