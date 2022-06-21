import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  plugins: [
    react(),
  ],
  base: "./",
  build: {
    outDir: "../../dist/frontend",
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3011,
  },
});
