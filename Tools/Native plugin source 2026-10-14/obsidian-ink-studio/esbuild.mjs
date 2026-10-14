import { build } from "esbuild";
import { cp, mkdir } from "node:fs/promises";
await build({
  entryPoints: ["src/main.ts"],
  outfile: "main.js",
  bundle: true,
  format: "cjs",
  platform: "browser",
  external: [
    "obsidian",
    "@codemirror/state",
    "@codemirror/view",
    "@codemirror/language",
  ],
  target: "es2022",
});
await build({
  entryPoints: ["src/frame.tsx"],
  outfile: "frame.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.IS_PREACT": '"false"',
  },
  loader: { ".woff2": "dataurl", ".woff": "dataurl", ".ttf": "dataurl" },
});
await mkdir("vendor", { recursive: true });
await cp(
  "node_modules/@excalidraw/excalidraw/dist/prod/fonts",
  "vendor/fonts",
  { recursive: true },
);
await cp(
  "node_modules/@excalidraw/excalidraw/dist/prod/index.css",
  "vendor/excalidraw.css",
);
