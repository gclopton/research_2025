import {patchMathlive} from './scripts/mathlive-patch.mjs';
import {build} from 'esbuild';
import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
const integralPatch={name:'closed-integrals',setup(b){b.onLoad({filter:/mathlive(?:-ssr\.min)?\.mjs$/},async args=>({contents:patchMathlive(await readFile(args.path,'utf8')),loader:'js'}));}};
await build({plugins:[integralPatch],conditions:['development'],entryPoints:['src/frame.ts'],bundle:true,format:'iife',platform:'browser',target:'es2022',outfile:'frame.js'});
await build({plugins:[integralPatch],entryPoints:['src/main.ts'],bundle:true,external:['obsidian','@codemirror/state','@codemirror/view'],format:'cjs',platform:'browser',target:'es2022',outfile:'main.js'});
await mkdir('vendor',{recursive:true});
await cp('node_modules/mathlive/fonts','vendor/fonts',{recursive:true});
await copyFile('node_modules/mathlive/LICENSE.txt','vendor/MATHLIVE-LICENSE.txt');

await copyFile('node_modules/mathlive/mathlive-static.css','vendor/mathlive-static.css');

for(const name of ['mathlive-static.css','mathlive-fonts.css']){
 let css=await readFile(`node_modules/mathlive/${name}`,'utf8');
 for(const match of [...css.matchAll(/url\(fonts\/([^)]*)\)/g)]){
  const bytes=await readFile(`node_modules/mathlive/fonts/${match[1]}`);
  css=css.replace(match[0],`url(data:font/woff2;base64,${bytes.toString('base64')})`);
 }
 await writeFile(`vendor/${name}`,css);
}
