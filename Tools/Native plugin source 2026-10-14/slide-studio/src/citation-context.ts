import {scientificBlocks,scientificNumbers} from './scientific-core';
import {App,TFile,resolveSubpath} from 'obsidian';
import type {Block,Slide} from './model';
import {citations,buildReferences,CSLItem,Reference,CiteOccurrence} from './citations-core';
export interface CitationBlock {content:string;sourcePath:string;occurrences:CiteOccurrence[]}
export interface CitationContext {blocks:Map<string,CitationBlock>;refs:Map<string,Reference>;slideKeys:Map<string,string[]>;issues:string[];scientific?:Map<string,string>}
export interface CitationRecord {file:{path:string};doc:Slide|{kind:string}}
export const blockKey=(slide:Slide,b:Block)=>`${slide.id}:${b.id}`;
export async function readBlockSource(app:App,b:Block,path:string):Promise<{content:string;sourcePath:string}>{
 let content=b.text,sourcePath=path;
 if(b.kind==='note'){
   const link=b.text.trim().replace(/^!?\[\[/,'').replace(/\]\]$/,'').split('|')[0],hash=link.indexOf('#');
   const base=hash<0?link:link.slice(0,hash),sub=hash<0?'':link.slice(hash);
   const file=base?app.metadataCache.getFirstLinkpathDest(base,path):app.vault.getAbstractFileByPath(path);
   if(!(file instanceof TFile))throw Error(`Note not found: ${link}`);
   content=await app.vault.read(file);sourcePath=file.path;
   if(sub){const cache=app.metadataCache.getFileCache(file),range=cache?resolveSubpath(cache,sub):null;if(!range)throw Error(`Heading or block not found: ${sub}`);content=content.slice(range.start.offset,range.end?.offset??content.length);}
   else content=content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
 }
 return {content,sourcePath};
}
const bibCache=new Map<string,{stamp:number;size:number;items:CSLItem[]}>();
async function readBibliography(app:App,path:string,pandoc:string):Promise<CSLItem[]>{
 const adapter=app.vault.adapter as typeof app.vault.adapter & {getBasePath?:()=>string};
 if(!adapter.getBasePath)throw Error('Bibliography files currently require the desktop app.');
 const fs=require('fs/promises') as typeof import('node:fs/promises'),paths=require('path') as typeof import('node:path');
 const absolute=paths.isAbsolute(path)?path:paths.resolve(adapter.getBasePath(),path);
 const stat=await fs.stat(absolute),prior=bibCache.get(absolute);if(prior?.stamp===stat.mtimeMs&&prior.size===stat.size)return prior.items;
 let raw=await fs.readFile(absolute,'utf8');
 if(/\.(bib|bibtex|biblatex)$/i.test(path)){
   const cp=require('child_process') as typeof import('node:child_process');
   raw=await new Promise<string>((resolve,reject)=>cp.execFile(pandoc,[absolute,'--from=biblatex','--to=csljson'],{timeout:15000,maxBuffer:32*1024*1024},(err,out)=>err?reject(err):resolve(out)));
 }
 const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw Error('Bibliography must contain a CSL-JSON array (or a BibTeX file).');
 const items=parsed.filter((v:any)=>v&&typeof v.id==='string') as CSLItem[];
 bibCache.set(absolute,{stamp:stat.mtimeMs,size:stat.size,items});return items;
}
export async function prepareCitations(app:App,records:(CitationRecord|null)[],deckPath?:string,bibliography?:string|string[]):Promise<CitationContext>{
 const ctx:CitationContext={blocks:new Map(),refs:new Map(),slideKeys:new Map(),issues:[]};
 const groups:{slide:string;occurrences:CiteOccurrence[]}[]=[],sources=new Set<string>();
 for(const r of records){if(r?.doc.kind!=='slide')continue;const slide=r.doc as Slide,source=slide.source?slide.source.split('#')[0]:r.file.path;const keys=new Set<string>();sources.add(source);
   for(const b of slide.blocks){if(b.kind==='image')continue;
     try{const data=await readBlockSource(app,b,source),occurrences=citations(data.content);ctx.blocks.set(blockKey(slide,b),{...data,occurrences});sources.add(data.sourcePath);groups.push({slide:slide.title,occurrences});for(const c of occurrences)for(const m of c.members)keys.add(m.key);}catch(e){ctx.issues.push(String((e as Error).message));}
   }ctx.slideKeys.set(slide.id,[...keys]);
 }
 ctx.scientific=scientificNumbers([...ctx.blocks.values()].flatMap(b=>scientificBlocks(b.content).map(o=>o.value)));
 if(!groups.some(g=>g.occurrences.length))return ctx;
 const plugin=(app as any).plugins?.getPlugin?.('obsidian-pandoc-reference-list');
 let settings=plugin?.settings;
 if(!settings)try{settings=JSON.parse(await app.vault.adapter.read(`${app.vault.configDir}/plugins/obsidian-pandoc-reference-list/data.json`));}catch{}
 const paths=new Set<string>(Array.isArray(bibliography)?bibliography:bibliography?[bibliography]:[]);if(settings?.pathToBibliography)paths.add(settings.pathToBibliography);
 if(deckPath)sources.add(deckPath);
 for(const path of sources){const f=app.vault.getAbstractFileByPath(path);if(f instanceof TFile){const bib=app.metadataCache.getFileCache(f)?.frontmatter?.bibliography;for(const p of Array.isArray(bib)?bib:bib?[bib]:[])if(typeof p==='string')paths.add(p);}}
 const items=new Map<string,CSLItem>();
 // Reuse Zotero's loaded items when available; explicit bibliography files take precedence.
 const loaded=plugin?.bibManager?.bibCache;if(loaded instanceof Map)for(const [key,item]of loaded)items.set(key,item);
 for(const path of paths)try{for(const item of await readBibliography(app,path,settings?.pathToPandoc||'pandoc'))items.set(item.id,item);}catch(e){ctx.issues.push(`Bibliography ${path}: ${(e as Error).message}`);}
 if(!paths.size&&!items.size)ctx.issues.push('Set a bibliography in Pandoc Reference List, or add bibliography frontmatter to the presentation.');
 ctx.refs=buildReferences(groups,items);
 const missing=[...ctx.refs.values()].filter(r=>!r.item);if(missing.length)ctx.issues.push('Missing bibliography entries: '+missing.map(r=>'@'+r.key).join(', '));
 return ctx;
}
