#!/usr/bin/env node
import { createServer } from "vite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const server = await createServer({
  configFile: false,
  root,
  resolve: {
    alias: { "@": join(root, "src") },
  },
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

try {
  const { assertClientBundle } = await server.ssrLoadModule("/src/server/security/bundleScan.ts");
  const result = assertClientBundle(root);
  console.log(
    `bundle ok  js_files=${result.files.length} total_js_bytes=${result.totalJsBytes} dir=${result.dir}`,
  );
} finally {
  await server.close();
}
