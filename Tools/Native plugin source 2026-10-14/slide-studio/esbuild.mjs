import { build } from 'esbuild';
await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  loader: { '.svg': 'dataurl' },
  external: ['node:*', 'obsidian', 'fs/promises', 'path', 'child_process'],
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  outfile: 'main.js',
  sourcemap: 'inline',
});
