import { builtinModules } from "module";
import { defineConfig } from "vite";
import pkg from "../../package.json";

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "../../dist/backend",
    emptyOutDir: true,
    minify: process.env.NODE_ENV === "production",
    sourcemap: true,
    lib: {
      entry: "index.ts",
      formats: ["cjs"],
      fileName: () => "[name].js",
    },
    rollupOptions: {
      external: [
        "express",
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
  },
});
