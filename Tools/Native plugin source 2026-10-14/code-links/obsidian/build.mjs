import {build} from 'esbuild';
await build({entryPoints:['main.ts'],bundle:true,platform:'node',format:'cjs',target:'es2020',outfile:'main.js',external:['obsidian','electron','@codemirror/state','@codemirror/view','@codemirror/language','@lezer/common','@lezer/highlight']});
