import {App,FuzzySuggestModal,Menu,Notice,TFile} from 'obsidian';
import {parseDocument} from 'yaml';
import {Reference,pdfCandidates,webVersion} from './citations-core';
export {webVersion} from './citations-core';
const mappingPath=(app:App)=>`${app.vault.configDir}/plugins/slide-studio/citation-sources.json`;
async function pdfSources(app:App,ref:Reference):Promise<string[]>{
 const fs=require('fs/promises') as typeof import('node:fs/promises'),path=require('path') as typeof import('node:path');
 const adapter=app.vault.adapter as typeof app.vault.adapter & {getBasePath?:()=>string};const root=adapter.getBasePath?.();if(!root)return [];
 const found=new Set<string>();
 const check=async(value:unknown,base=root)=>{if(typeof value!=='string')return;const s=value.replace(/^!?\[\[/,'').replace(/\]\]$/,'').split('|')[0];
  if(/^https?:\/\//i.test(s)){try{if(new URL(s).pathname.toLowerCase().endsWith('.pdf'))found.add(s);}catch{}return;}
  const absolute=path.resolve(base,s);if(!/\.pdf$/i.test(absolute))return;try{if((await fs.stat(absolute)).isFile())found.add(absolute);}catch{}
 };
 try{const saved=JSON.parse(await app.vault.adapter.read(mappingPath(app)));await check(saved[ref.key]);}catch{}
 const item=ref.item as any;for(const value of [item?.PDF,item?.pdf,item?.custom?.pdf,item?.URL])await check(value);
 const notes=new Map<string,{root:string;relative:string}>();
 const within=(base:string,relative:string)=>{const resolved=path.resolve(base,relative);return resolved.startsWith(path.resolve(base)+path.sep)?resolved:null;};
 for(const o of ref.occurrences)try{
  const uri=new URL(o.href),vault=uri.searchParams.get('vault');let base=root;
  if(vault&&vault!==app.vault.getName()){
   const registry=JSON.parse(await fs.readFile(path.join(process.env.HOME!,'Library/Application Support/obsidian/obsidian.json'),'utf8'));
   const match=Object.entries(registry.vaults||{}).find(([id,v]:[string,any])=>id===vault||path.basename(v.path)===vault);if(!match)continue;base=(match[1] as any).path;
  }
  const file=within(base,uri.searchParams.get('file')||'');if(!file)continue;
  const raw=await fs.readFile(file,'utf8');if(raw.length>4_000_000)continue;
  const record=parseDocument(raw).toJS({maxAliasCount:0});const papers=record?.claims?.[uri.searchParams.get('id')||'']?.papers;
  if(!Array.isArray(papers))continue;
  for(const paper of papers)if(paper.citekey===ref.key&&typeof paper.path==='string'){const note=within(base,paper.path);if(note)notes.set(note,{root:base,relative:paper.path});}
 }catch{}
 // Current-vault metadata is already indexed; no recursive filesystem crawl.
 for(const note of app.vault.getMarkdownFiles()){const fm=app.metadataCache.getFileCache(note)?.frontmatter;if(fm?.citekey===ref.key||fm?.['citation-key']===ref.key)notes.set(path.join(root,note.path),{root,relative:note.path});}
 for(const [note,info]of notes){
  for(const candidate of pdfCandidates(info.relative))await check(candidate,info.root);
  try{const raw=await fs.readFile(note,'utf8');const front=raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);if(front){const fm=parseDocument(front[1]).toJS({maxAliasCount:0});for(const value of [fm.pdf,fm.pdf_path,fm.source_pdf]){await check(value,info.root);await check(value,path.dirname(note));}}}catch{}
 }
 return [...found];
}
function openPDFPath(app:App,path:string){
 if(/^https?:\/\//i.test(path)){window.open(path);return;}
 const root=(app.vault.adapter as any).getBasePath?.();
 if(root&&path.startsWith(root+'/')){const file=app.vault.getAbstractFileByPath(path.slice(root.length+1));if(file instanceof TFile){void app.workspace.openPopoutLeaf({size:{width:1100,height:850}}).openFile(file);return;}}
 window.open('obsidian://open?path='+encodeURIComponent(path));
}
class PDFPicker extends FuzzySuggestModal<TFile>{
 constructor(app:App,private ref:Reference){super(app);this.setPlaceholder('Choose the PDF for @'+ref.key);}
 getItems(){return this.app.vault.getFiles().filter(f=>f.extension.toLowerCase()==='pdf');}
 getItemText(f:TFile){return f.path;}
 onChooseItem(f:TFile){void (async()=>{let saved:Record<string,string>={};try{saved=JSON.parse(await this.app.vault.adapter.read(mappingPath(this.app)));}catch{}saved[this.ref.key]=f.path;await this.app.vault.adapter.write(mappingPath(this.app),JSON.stringify(saved,null,2));await this.app.workspace.openPopoutLeaf({size:{width:1100,height:850}}).openFile(f);})().catch(e=>new Notice(String(e)));}
}
function choosePDF(app:App,sources:string[]){
 if(sources.length===1){openPDFPath(app,sources[0]);return;}
 const menu=new Menu();sources.forEach(p=>menu.addItem(i=>i.setTitle(p.split('/').slice(-3).join('/')).onClick(()=>openPDFPath(app,p))));if(document.fullscreenElement)menu.setParentElement(document.fullscreenElement as HTMLElement);menu.showAtPosition({x:window.innerWidth/2,y:window.innerHeight/2});
}
export async function openPreferredSource(app:App,ref:Reference,fallback:()=>void){
 try{const sources=await pdfSources(app,ref),local=sources.filter(p=>!/^https?:/i.test(p));
  if(local.length){choosePDF(app,local);return;}
  const web=webVersion(ref);if(web){window.open(web);return;}
  if(sources.length){choosePDF(app,sources);return;}
  fallback();
 }catch{const web=webVersion(ref);if(web)window.open(web);else fallback();}
}
export async function openReferencePDF(app:App,ref:Reference){
 try{const sources=await pdfSources(app,ref);const local=sources.filter(p=>!/^https?:/i.test(p));if(local.length||sources.length){choosePDF(app,local.length?local:sources);return;}
 new Notice('No linked PDF found. Choose its PDF from this vault.');const picker=new PDFPicker(app,ref);picker.open();if(document.fullscreenElement)document.fullscreenElement.append(picker.containerEl);
 }catch(e){new Notice(`Could not open PDF: ${(e as Error).message}`);}
}
export function sourceMenu(app:App,menu:Menu,ref:Reference){
 menu.addItem(i=>i.setTitle('Open PDF').setIcon('file-text').onClick(()=>void openReferencePDF(app,ref)));
 const web=webVersion(ref);menu.addItem(i=>i.setTitle('Open web version').setIcon('globe').setDisabled(!web).onClick(()=>{if(web)window.open(web);}));
}
