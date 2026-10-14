import {build} from 'esbuild';
await build({entryPoints:['src/main.ts'],bundle:true,external:['obsidian','@codemirror/view','@codemirror/state','fs/promises','node:fs/promises','node:path','node:crypto'],format:'cjs',platform:'browser',target:'es2022',outfile:'main.js'});
