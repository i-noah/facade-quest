import { spawn } from "child_process";
import { createServer, build } from "vite";

/**
 * @type {(server: import('vite').ViteDevServer) => Promise<import('rollup').RollupWatcher>}
 */
function watchBackend(server) {
  let expressProcess = null;
  const address = server.httpServer.address();
  const env = Object.assign(process.env, {
    VITE_DEV_SERVER_HOST: address.address,
    VITE_DEV_SERVER_PORT: address.port,
  });
  /**
   * @type {import('vite').Plugin}
   */
  const startExpress = {
    name: "express-server-watcher",
    writeBundle() {
      expressProcess && expressProcess.kill();
      expressProcess = spawn('node', ["dist/backend"], { stdio: "inherit", env });
    },
  };
  return build({
    configFile: "src/backend/vite.config.ts",
    mode: "development",
    plugins: [startExpress],
    build: {
      watch: {},
    },
  });
}

// bootstrap
const server = await createServer({
  configFile: "src/frontend/vite.config.ts",
});

await server.listen();
await watchBackend(server);
console.log("dev server started");
