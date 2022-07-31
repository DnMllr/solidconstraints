/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  base: "/constraints/",
  plugins: [solidPlugin()],
  test: {
    environment: "jsdom",
    transformMode: {
      web: [/.[jt]sx?/],
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
