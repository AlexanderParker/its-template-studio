import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// its-compiler-js targets Node and imports fs, url and node-fetch at module
// scope. Only compileFile() touches the filesystem, which the demo never
// calls, so those modules are aliased to thin browser shims. The editor
// package resolves straight to its TypeScript source within the workspace.
//
// The /its-api proxy forwards server-side compile requests to the Python
// service so the browser only ever talks to the dev server's own origin.
// The production base matches the GitHub Pages project path; local dev and
// preview stay at the root.
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/its-template-studio/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      fs: fileURLToPath(new URL("./src/stubs/fs.ts", import.meta.url)),
      url: fileURLToPath(new URL("./src/stubs/url.ts", import.meta.url)),
      "node-fetch": fileURLToPath(new URL("./src/stubs/node-fetch.ts", import.meta.url)),
      "its-template-editor/styles.css": fileURLToPath(
        new URL("../packages/its-editor/src/styles.css", import.meta.url),
      ),
      "its-template-editor": fileURLToPath(new URL("../packages/its-editor/src/index.ts", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/its-api": {
        target: "http://localhost:8402",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/its-api/, ""),
      },
    },
  },
  preview: {
    proxy: {
      "/its-api": {
        target: "http://localhost:8402",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/its-api/, ""),
      },
    },
  },
}));
