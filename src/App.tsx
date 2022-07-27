import type { Component } from "solid-js";
import { HopeProvider } from "@hope-ui/solid";

import { Spacer } from "./pages/spacer";

const App: Component = () => {
  return (
    <HopeProvider>
      <main class="h-screen v-screen">
        <Spacer />
      </main>
    </HopeProvider>
  );
};

export default App;
