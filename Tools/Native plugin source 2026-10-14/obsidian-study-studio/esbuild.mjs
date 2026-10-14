import {build} from 'esbuild';
await build({entryPoints:['src/main.ts'],bundle:true,plugins:[{name:'native-codemirror',setup(b){b.onResolve({filter:/^obsidian-cm\//},args=>({path:args.path.replace('obsidian-cm/','@codemirror/'),external:true}));}}],external:['obsidian'],format:'cjs',target:'es2022',outfile:'main.js',logLevel:'info'});
