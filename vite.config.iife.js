import { resolve } from 'node:path'
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    minify: false,
    lib: {
      name: 'index',
      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },
      formats: ["iife"],
    }
  },
  plugins: [],
});
