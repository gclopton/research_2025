import {App, Component, MarkdownRenderer, TFile, loadPdfJs} from 'obsidian';
import {imagePath} from './files';
import {previewExcerpt} from './finder-model';
export interface FinderPreview {el:HTMLElement;dispose:()=>void}
/** One modal owns this cache. At most two jobs and 48 miniature pages are retained. */
export class FinderPreviews {
 private cache=new Map<string,FinderPreview>();private pending=new Map<string,Promise<FinderPreview|null>>();
 private queue:{key:string;file:TFile;resolve:(p:FinderPreview|null)=>void}[]=[];private running=0;private closed=false;
 private cancel=new Set<()=>void>();
 constructor(private app:App,private doc:Document){}
 get(file:TFile){
  const key=file.path+':'+file.stat.mtime;const cached=this.cache.get(key);
  if(cached){this.cache.delete(key);this.cache.set(key,cached);return Promise.resolve(cached);}
  const pending=this.pending.get(key);if(pending)return pending;
  const promise=new Promise<FinderPreview|null>(resolve=>this.queue.push({key,file,resolve}));this.pending.set(key,promise);this.pump();return promise;
 }
 /** Drop obsolete queued work, retaining current jobs and cached results. */
 prioritize(paths:Set<string>){const keep=[];for(const job of this.queue){if(paths.has(job.file.path))keep.push(job);else{this.pending.delete(job.key);job.resolve(null);}}this.queue=keep;}
 private pump(){while(!this.closed&&this.running<2&&this.queue.length){const job=this.queue.shift()!;this.running++;void this.make(job.file).then(preview=>{
   if(this.closed){preview?.dispose();job.resolve(null);return;}
   if(preview){this.cache.set(job.key,preview);while(this.cache.size>48){const first=[...this.cache.keys()].find(key=>!this.cache.get(key)!.el.isConnected);if(!first)break;this.cache.get(first)!.dispose();this.cache.delete(first);}}
   job.resolve(preview);
  }).catch(()=>job.resolve(null)).finally(()=>{this.pending.delete(job.key);this.running--;this.pump();});}}
 private async make(file:TFile):Promise<FinderPreview|null>{
  const el=this.doc.createElement('div');el.className='igf-miniature';el.setAttribute('inert','');let disposed=false;const disposers:(()=>void)[]=[];
  const dispose=()=>{if(disposed)return;disposed=true;for(const d of disposers)d();el.remove();};
  const alive=()=>!this.closed&&!disposed;
  try{
   if(imagePath(file.path)){
    if(file.stat.size>24*1024*1024){el.textContent='Image';return {el,dispose};}
    if(file.extension.toLowerCase()==='svg'){
     const img=el.createEl('img');img.decoding='async';img.src=this.app.vault.getResourcePath(file);disposers.push(()=>img.removeAttribute('src'));await img.decode();
    }else{
    const bytes=await this.app.vault.readBinary(file);if(!alive()){dispose();return null;}

    const bitmap=await createImageBitmap(new Blob([bytes]),{resizeWidth:640,resizeQuality:'medium'});
    try{if(!alive()){dispose();return null;}const scale=Math.min(1,640/bitmap.width,640/bitmap.height);const canvas=el.createEl('canvas',{cls:'igf-image-bitmap'});canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);}finally{bitmap.close();}
    }
   }
   else if(file.extension.toLowerCase()==='md'){
    if(file.stat.size>2*1024*1024){el.textContent='Markdown document';return {el,dispose};}
    const raw=await this.app.vault.cachedRead(file);if(!alive()){dispose();return null;}
    const owner=new Component();owner.load();disposers.push(()=>owner.unload());
    const page=el.createDiv({cls:'igf-mini-page markdown-rendered'});
    await MarkdownRenderer.render(this.app,previewExcerpt(raw),page,'',owner);
   }else if(file.extension.toLowerCase()==='pdf'){
    if(file.stat.size>60*1024*1024){el.textContent='PDF document';return {el,dispose};}
    const bytes=await this.app.vault.readBinary(file);if(!alive()){dispose();return null;}
    const lib=await loadPdfJs();if(!alive()){dispose();return null;}
    const task=lib.getDocument({data:new Uint8Array(bytes)});let render:any;
    const abort=()=>{render?.cancel();void task.destroy().catch(()=>{});};this.cancel.add(abort);
    try{
     const pdf=await task.promise;if(!alive())return null;
     const page=await pdf.getPage(1);if(!alive())return null;
     const base=page.getViewport({scale:1});const viewport=page.getViewport({scale:640/base.width});
     const canvas=el.createEl('canvas');canvas.width=640;canvas.height=Math.ceil(Math.min(viewport.height,500));
     render=page.render({canvasContext:canvas.getContext('2d'),viewport});await render.promise;
    }finally{this.cancel.delete(abort);await task.destroy();}
   }else{el.createDiv({cls:'igf-file-glyph',text:file.extension.toUpperCase()||'FILE'});}
   if(!alive()){dispose();return null;}return {el,dispose};
  }catch{dispose();return null;}
 }
 close(){this.closed=true;for(const job of this.queue)job.resolve(null);this.queue=[];for(const abort of this.cancel)abort();this.cancel.clear();for(const p of this.cache.values())p.dispose();this.cache.clear();this.pending.clear();}
}
