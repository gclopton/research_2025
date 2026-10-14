import {App, Component, FileSystemAdapter, MarkdownRenderer, Modal, TFile, loadPdfJs} from 'obsidian';
import {promises as fs} from 'node:fs';
import {documentVaults, DocumentVault, externalPDF, scanPDFs} from './document-vaults';
export interface DocumentChoice {path:string; basename:string; extension:'md'|'pdf'|'image'; file?:TFile; vault?:DocumentVault}
/** Fixed-height virtual rows and at most two preview jobs keep large libraries bounded. */
export class DocumentGallery extends Modal {
 private entries:DocumentChoice[]=[];private matches:DocumentChoice[]=[];private vaults:DocumentVault[]=[];
 private grid!:HTMLElement;private status!:HTMLElement;private search!:HTMLInputElement;private folder!:HTMLInputElement;
 private source!:HTMLSelectElement;private type!:HTMLSelectElement;private ticket=0;private generation=0;private closed=false;
 private timer?:ReturnType<typeof setTimeout>;private frame=0;private resize?:ResizeObserver;
 private jobs=new Map<HTMLElement,()=>void>();private queue:(()=>Promise<void>)[]=[];private running=0;private key='';private cols=3;
 private cache=new Map<string,DocumentChoice[]>();
 constructor(app:App,private kind:'md'|'pdf'|'all'|'image',private choose:(file:DocumentChoice)=>void,private images=true){super(app);}
 onOpen(){
  this.modalEl.addClass('ss-document-gallery');this.titleEl.textContent='Choose a document';
  const controls=this.contentEl.createDiv({cls:'ss-document-gallery-tools'});
  this.search=controls.createEl('input',{type:'search',attr:{placeholder:'Search names or paths…','aria-label':'Search documents'}});
  this.source=controls.createEl('select',{attr:{'aria-label':'Document vault'}});this.source.createEl('option',{value:'',text:'This vault'});
  this.type=controls.createEl('select',{attr:{'aria-label':'Document type'}});
  for(const [value,text] of [['all',this.images?'All documents and images':'Notes and PDFs'],['md','Notes'],['pdf','PDFs'],...(this.images?[['image','Images']]:[])])this.type.createEl('option',{value,text});this.type.value=this.kind;
  this.folder=controls.createEl('input',{type:'search',attr:{placeholder:'Filter folders…','aria-label':'Document folder'}});
  this.status=this.contentEl.createDiv({cls:'ss-gallery-status',attr:{role:'status'}});
  this.grid=this.contentEl.createDiv({cls:'ss-document-grid',attr:{'aria-label':'Document gallery'}});
  for(const input of [this.search,this.folder])input.oninput=()=>{clearTimeout(this.timer);this.timer=setTimeout(()=>this.filter(),160);};
  this.type.onchange=()=>this.filter();this.source.onchange=()=>{this.folder.value='';void this.loadSource();};
  this.search.onkeydown=e=>{if(['Enter','ArrowDown'].includes(e.key)&&this.matches.length){e.preventDefault();this.grid.querySelector<HTMLButtonElement>('button')?.focus();}};
  this.grid.onscroll=()=>{cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(()=>this.draw());};
  this.resize=new ResizeObserver(()=>{this.key='';this.draw();});this.resize.observe(this.grid);
  void this.loadSource();void this.loadVaults();this.search.focus();
 }
 private async loadVaults(){
  try{this.vaults=await documentVaults();if(this.closed)return;
   const current=this.app.vault.adapter instanceof FileSystemAdapter?this.app.vault.adapter.getBasePath():'';
   for(const v of this.vaults.filter(v=>v.root!==current).sort((a,b)=>a.name.localeCompare(b.name)))this.source.createEl('option',{value:v.id,text:this.vaults.filter(other=>other.name===v.name).length>1?v.name+' · '+v.root.split('/').slice(-2,-1)[0]:v.name,attr:{title:v.root}});
  }catch{if(!this.closed)this.source.title='Other vaults unavailable on this device';}
 }
 private async loadSource(){
  const ticket=++this.ticket;this.entries=[];this.filter();
  const vault=this.vaults.find(v=>v.id===this.source.value);
  if(!vault){this.entries=this.app.vault.getFiles().filter(f=>(['md','pdf'].includes(f.extension)||(this.images&&/^(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(f.extension)))).map(file=>({path:file.path,basename:file.basename,extension:(['md','pdf'].includes(file.extension)?file.extension:'image') as DocumentChoice['extension'],file}));this.filter();return;}
  // Other-vault Markdown needs a separate link and styling resolver; PDFs are self-contained.
  this.type.value='pdf';this.status.textContent=`Finding PDFs in ${vault.name}…`;
  try{
   let entries=this.cache.get(vault.id);
   if(!entries){const paths=await scanPDFs(vault.root,()=>this.closed||ticket!==this.ticket,n=>{if(!this.closed&&ticket===this.ticket)this.status.textContent=`Found ${n} PDFs in ${vault.name}…`;});entries=paths.map(path=>({path,basename:path.split('/').pop()!.replace(/\.pdf$/i,''),extension:'pdf',vault}));}
   if(this.closed||ticket!==this.ticket)return;this.cache.set(vault.id,entries);this.entries=entries;this.filter();
  }catch(e){if(!this.closed&&ticket===this.ticket)this.status.textContent='Could not read this vault: '+(e as Error).message;}
 }
 private filter(){
  const terms=this.search.value.toLocaleLowerCase().trim().split(/\s+/),folder=this.folder.value.trim().toLocaleLowerCase();
  this.matches=this.entries.filter(e=>(this.type.value==='all'||e.extension===this.type.value)&&e.path.slice(0,e.path.lastIndexOf('/')+1).toLocaleLowerCase().includes(folder)&&terms.every(t=>e.path.toLocaleLowerCase().includes(t))).sort((a,b)=>a.basename.localeCompare(b.basename));
  this.status.textContent=`${this.matches.length} document${this.matches.length===1?'':'s'}${this.source.value?' · PDFs from selected vault':''}`;
  this.grid.scrollTop=0;this.key='';this.draw();
 }
 private draw(){
  if(this.closed)return;
  this.cols=Math.max(1,Math.floor((this.grid.clientWidth+16)/236));const row=344;
  const first=Math.max(0,Math.floor(this.grid.scrollTop/row)-1),last=Math.min(Math.ceil(this.matches.length/this.cols),Math.ceil((this.grid.scrollTop+this.grid.clientHeight)/row)+1);
  const key=[first,last,this.cols,this.generation].join(':');if(this.key===key)return;
  const focused=this.grid.contains(document.activeElement)?(document.activeElement as HTMLElement).dataset.index:undefined;
  this.clear();this.key=[first,last,this.cols,this.generation].join(':');const gen=this.generation;
  this.grid.style.gridTemplateColumns=`repeat(${this.cols},minmax(0,1fr))`;
  const spacer=(height:number)=>this.grid.createDiv({cls:'ss-document-spacer',attr:{style:`height:${Math.max(0,height)}px`,'aria-hidden':'true'}});
  if(first)spacer(first*row-16);
  for(let i=first*this.cols;i<Math.min(this.matches.length,last*this.cols);i++){
   const entry=this.matches[i],card=this.grid.createEl('button',{cls:'ss-document-card',attr:{'aria-label':`Choose ${entry.basename} — ${entry.vault?.name||'This vault'}/${entry.path}`}});
   const preview=card.createDiv({cls:'ss-document-thumbnail',attr:{'aria-hidden':'true'}});preview.textContent='Loading preview…';
   card.createDiv({cls:'ss-document-caption',text:entry.basename});card.createDiv({cls:'ss-document-path',text:(entry.vault?.name?entry.vault.name+' / ':'')+entry.path});
   card.onclick=()=>{this.close();this.choose(entry);};
   card.onkeydown=e=>{let next=i;if(e.key==='ArrowRight')next++;else if(e.key==='ArrowLeft')next--;else if(e.key==='ArrowDown')next+=this.cols;else if(e.key==='ArrowUp')next-=this.cols;else return;e.preventDefault();next=Math.max(0,Math.min(this.matches.length-1,next));const r=Math.floor(next/this.cols);if(r*row<this.grid.scrollTop||r*row+row>this.grid.scrollTop+this.grid.clientHeight){this.grid.scrollTop=r*row;this.draw();}this.grid.querySelectorAll<HTMLButtonElement>('.ss-document-card').forEach(b=>{if(b.dataset.index===String(next))b.focus({preventScroll:true});});};card.dataset.index=String(i);
   this.queue.push(()=>this.preview(entry,preview,gen));
  }
  const rows=Math.ceil(this.matches.length/this.cols);if(last<rows)spacer((rows-last)*row-16);
  if(!this.matches.length)this.grid.createEl('p',{text:'No matching documents.'});
  if(focused!==undefined)this.grid.querySelector<HTMLButtonElement>(`button[data-index="${focused}"]`)?.focus({preventScroll:true});
  this.pump();
 }
 private pump(){while(this.running<2&&this.queue.length){this.running++;void this.queue.shift()!().finally(()=>{this.running--;this.pump();});}}
 private async preview(entry:DocumentChoice,body:HTMLElement,gen:number){
  const alive=()=>!this.closed&&gen===this.generation&&body.isConnected;
  try{
   if(!alive())return;
   if(entry.extension==='image'){body.empty();const img=body.createEl('img',{attr:{src:this.app.vault.getResourcePath(entry.file!),alt:entry.basename,loading:'lazy'}});this.jobs.set(body,()=>img.removeAttribute('src'));return;}
   if(entry.extension==='md'){
    const owner=new Component();owner.load();this.jobs.set(body,()=>owner.unload());
    if(entry.file!.stat.size>2*1024*1024)throw Error('Large note — choose to view');
    const raw=await this.app.vault.cachedRead(entry.file!);if(!alive())return;
    // Small, non-recursive samples: never start embedded viewers or execute code blocks.
    const lines=raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').slice(0,5000).split('\n');let fence='';const kept:string[]=[];
    for(const line of lines){const mark=line.match(/^\s{0,3}(`{3,}|~{3,})/);if(mark){if(!fence)fence=mark[1];else if(mark[1][0]===fence[0]&&mark[1].length>=fence.length)fence='';continue;}if(!fence)kept.push(line);}
    const excerpt=kept.join('\n').replace(/!\[\[/g,'[[').replace(/!\[([^\]]*)\]\([^)]*\)/g,'$1');
    body.empty();body.addClass('markdown-rendered');await MarkdownRenderer.render(this.app,excerpt,body,entry.path,owner);return;
   }
   let bytes:ArrayBuffer|Uint8Array;
   if(entry.vault){const file=await externalPDF(entry.vault,entry.path);if(file.size>60*1024*1024)throw Error('Large PDF — choose to open preview');if(!alive())return;bytes=new Uint8Array(await fs.readFile(file.full));}
   else{if(entry.file!.stat.size>60*1024*1024)throw Error('Large PDF — choose to open preview');bytes=await this.app.vault.readBinary(entry.file!);}
   if(!alive())return;const lib=await loadPdfJs();if(!alive())return;
   const task=lib.getDocument({data:new Uint8Array(bytes)});let render:any;this.jobs.set(body,()=>{render?.cancel();void task.destroy();});
   const pdf=await task.promise;if(!alive())return;const page=await pdf.getPage(1);if(!alive())return;
   const base=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(400/base.width,460/base.height)});
   body.empty();const canvas=body.createEl('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   render=page.render({canvasContext:canvas.getContext('2d'),viewport});await render.promise;
   // Keep only the small bitmap; release document bytes and PDF workers immediately.
   await task.destroy();this.jobs.delete(body);
  }catch(e){if(alive())body.textContent='Preview unavailable: '+(e as Error).message;}
 }
 private clear(){this.generation++;this.queue=[];for(const dispose of this.jobs.values())dispose();this.jobs.clear();this.grid.empty();}
 onClose(){this.closed=true;this.ticket++;clearTimeout(this.timer);cancelAnimationFrame(this.frame);this.resize?.disconnect();this.clear();}
}
