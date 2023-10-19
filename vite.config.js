import { resolve } from 'node:path'
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
    minify: false,
    lib: {
      name: 'index',
      entry: {
        index: resolve(__dirname, "src/index.ts")
      },
      formats: ["umd", "es"],
    }
  },
  plugins: [],
});
