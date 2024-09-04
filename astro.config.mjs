import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import auth from "auth-astro";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  integrations: [auth(), react()]
});