// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://vansmithlab.com",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],
});