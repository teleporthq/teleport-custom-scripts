import { resolve } from 'node:path'
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: "dist",
    minify: false,
    lib: {
      name: 'index',
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        components: resolve(__dirname, "src/components.ts")
      },
      formats: ["es"],
    }
  },
  plugins: [],
});
