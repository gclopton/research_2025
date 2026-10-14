import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
export interface DocumentVault {id:string; name:string; root:string}
export function vaultsFromRegistry(value:any):DocumentVault[] {
 return Object.entries(value?.vaults??{}).flatMap(([id,v]:[string,any])=>typeof v?.path==='string'?[{id,name:path.basename(v.path),root:v.path}]:[]);
}
export async function documentVaults():Promise<DocumentVault[]> {
 const base=process.platform==='darwin'?path.join(os.homedir(),'Library/Application Support'):process.env.APPDATA||path.join(os.homedir(),'.config');
 return vaultsFromRegistry(JSON.parse(await fs.readFile(path.join(base,'obsidian/obsidian.json'),'utf8')));
}
export function selectVault(vaults:DocumentVault[],name:string,id?:string){
 const exact=vaults.find(v=>v.id===id&&v.name===name);if(exact)return exact;
 const matches=vaults.filter(v=>v.name===name);
 if(matches.length!==1)throw Error(matches.length?'More than one vault has this name. Choose the PDF again.':'Source vault is not registered on this computer.');
 return matches[0];
}
export async function externalPDF(vault:DocumentVault,relative:string){
 if(path.isAbsolute(relative)||relative.split(/[\\/]/).includes('..')||!relative.toLowerCase().endsWith('.pdf'))throw Error('Choose a PDF inside the source vault.');
 const root=await fs.realpath(vault.root),full=await fs.realpath(path.join(root,relative));
 if(!full.startsWith(root+path.sep))throw Error('PDF points outside its source vault.');
 const stat=await fs.stat(full);if(!stat.isFile())throw Error('PDF not found.');
 return {full,size:stat.size};
}
export async function scanPDFs(root:string,cancelled:()=>boolean,progress:(count:number)=>void=()=>{}){
 const paths:string[]=[],pending=[''];let visited=0;
 while(pending.length&&!cancelled()){
  const relative=pending.pop()!,dir=await fs.opendir(path.join(root,relative));
  for await(const item of dir){
   if(cancelled())return paths;
   if(item.name.startsWith('.')||['node_modules','__pycache__','venv'].includes(item.name))continue;
   const next=relative?relative+'/'+item.name:item.name;
   if(item.isDirectory())pending.push(next);else if(item.isFile()&&/\.pdf$/i.test(item.name))paths.push(next);
   if(++visited%1000===0){progress(paths.length);await new Promise(resolve=>setTimeout(resolve,0));}
  }
 }
 return paths.sort((a,b)=>a.localeCompare(b));
}
