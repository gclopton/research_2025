import {DocumentGallery, DocumentChoice} from './document-gallery';
import {documentVaults, externalPDF, selectVault} from './document-vaults';
import {ExternalPDF} from './external-pdf';
import {mountPDF} from './native-pdf';
import {App, Component, MarkdownRenderChild, MarkdownRenderer, Menu, Modal, Notice, TFile, resolveSubpath} from 'obsidian';
import {documentChunks, documentSource, parseDocument} from './document-core';

/** A single shared renderer for note code blocks, slide blocks, and enlarged previews. */
export class DocumentPanel extends MarkdownRenderChild {
 private alive=false;
 private revision=0;
 private body!:HTMLElement;
 private root!:HTMLElement;
 private title!:HTMLButtonElement;
 private observer?:IntersectionObserver;
 private rendering?:Component;
 private file?:TFile;
 private link='';
 private chunks:string[]=[];
 private next=0;
 private busy=false;
 private sentinel?:HTMLButtonElement;
 constructor(private app:App,el:HTMLElement,private source:string,private sourcePath:string,private enlarged=false){super(el);}
 onload(){
  this.alive=true;
  this.containerEl.empty();
  this.root=this.containerEl.createDiv({cls:'ss-document-panel'});
  this.root.setAttribute('role','region');
  const bar=this.root.createDiv({cls:'ss-document-bar'});
  this.title=bar.createEl('button',{cls:'ss-document-title',text:'Document preview'});
  this.title.title=this.enlarged?'Open source':'Enlarge document';
  this.title.onclick=()=>this.enlarged?this.openSource():openDocument(this.app,this.source,this.sourcePath);
  this.body=this.root.createDiv({cls:'ss-document-body markdown-rendered'});
  this.body.tabIndex=0;
  this.body.setAttribute('aria-label','Scrollable document');
  try{
   const target=parseDocument(this.source);this.link=target.path;
   this.root.style.setProperty('--document-height',`${target.height}px`);
  }catch(e){this.body.textContent=(e as Error).message;return;}
  if(this.containerEl.parentElement?.closest('.ss-document-panel')){
   this.body.textContent='Nested document — open the source to continue.';return;
  }
  for(const name of ['click','dblclick','pointerdown','keydown','wheel'] as const)
   this.registerDomEvent(this.root,name,e=>e.stopPropagation());
  this.registerDomEvent(this.root,'contextmenu',event=>{
   if((event.target as HTMLElement).closest('a,img,input,textarea'))return;
   event.preventDefault();event.stopPropagation();
   const menu=new Menu();
   menu.addItem(i=>i.setTitle('Enlarge document').setIcon('maximize').onClick(()=>openDocument(this.app,this.source,this.sourcePath)));
   menu.addItem(i=>i.setTitle('Open source in new tab').setIcon('file').onClick(()=>this.openSource()));
   menu.addItem(i=>i.setTitle('Refresh document').setIcon('refresh-cw').onClick(()=>void this.reload()));
   if(document.fullscreenElement)menu.setParentElement(document.fullscreenElement as HTMLElement);
   menu.showAtMouseEvent(event);
  });
  this.observer=new IntersectionObserver(entries=>{
   if(entries.some(e=>e.isIntersecting)){this.observer?.disconnect();void this.reload();}
  },{rootMargin:'160px'});
  this.observer.observe(this.root);
 }
 private async openSource(){
  try{
   const target=parseDocument(this.source);
   if(target.vault){const vault=selectVault(await documentVaults(),target.vault,target.vaultId);window.open('obsidian://open?vault='+encodeURIComponent(vault.id)+'&file='+encodeURIComponent(target.path));return;}
   await this.app.workspace.openLinkText(this.link,this.sourcePath,'tab');
  }catch(e){new Notice((e as Error).message);}
 }
 private async reload(){
  const revision=++this.revision;
  this.busy=false;this.next=0;this.rendering?.unload();
  const owner=this.rendering=new Component();owner.load();
  this.body.empty();this.body.textContent='Loading document…';
  try{
   const hash=this.link.indexOf('#'),base=hash<0?this.link:this.link.slice(0,hash),sub=hash<0?'':this.link.slice(hash);
   const target=parseDocument(this.source);
   if(target.vault){
    const vault=selectVault(await documentVaults(),target.vault,target.vaultId),file=await externalPDF(vault,base);
    if(!this.alive||revision!==this.revision)return;
    const page=Number(new URLSearchParams(sub.slice(1)).get('page')||1);
    if(!Number.isSafeInteger(page)||page<1)throw Error('PDF page must be a positive whole number.');
    this.title.textContent=base.split('/').pop()!+' · '+vault.name;this.root.setAttribute('aria-label',`Document: ${base} from ${vault.name}`);
    this.body.empty();this.body.removeClass('ss-document-pdf');
    owner.addChild(new ExternalPDF(this.body,file.full,page));return;
   }
   const file=base?this.app.metadataCache.getFirstLinkpathDest(base,this.sourcePath):this.app.vault.getAbstractFileByPath(this.sourcePath);
   if(!(file instanceof TFile)||!['md','pdf'].includes(file.extension))throw Error('Note or PDF not found in this vault.');
   this.file=file;this.title.textContent=file.basename+(sub?` · ${sub.slice(1)}`:'');
   this.root.setAttribute('aria-label',`Document: ${file.basename}`);
   if(file.extension==='pdf'){
    this.body.empty();this.body.addClass('ss-document-pdf');
    const page=Number(new URLSearchParams(sub.slice(1)).get('page')||1);
    if(!Number.isSafeInteger(page)||page<1)throw Error('PDF page must be a positive whole number.');
    await mountPDF(this.app,this.body.createDiv({cls:'internal-embed'}),file,page,this.enlarged?Math.round(window.innerHeight*.76):parseDocument(this.source).height,owner);
    return;
   }
   let raw=await this.app.vault.cachedRead(file);
   if(!this.alive||revision!==this.revision)return;
   const cache=this.app.metadataCache.getFileCache(file);
   if(!cache)throw Error('This note is still being indexed. Refresh the window in a moment.');
   let start=0,end=raw.length;
   if(sub){
    const range=resolveSubpath(cache,sub);
    if(!range)throw Error('Heading or block not found.');
    start=range.start.offset;end=range.end?.offset??raw.length;
   }
   // Change only cached embed occurrences, preserving identical literal examples in code.
   const embeds=cache.embeds||[];
   const stops=embeds.filter(embed=>{
    const target=this.app.metadataCache.getFirstLinkpathDest(embed.link.split('#')[0],file.path);
    return target&&['md','pdf'].includes(target.extension);
   }).map(embed=>embed.position.start.offset).filter(at=>at>=start&&at<end).sort((a,b)=>b-a);
   raw=raw.slice(start,end);
   for(const at of stops){const offset=at-start;if(raw[offset]==='!')raw=raw.slice(0,offset)+raw.slice(offset+1);}
   if(!sub)raw=raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
   this.chunks=documentChunks(raw);
   this.body.empty();this.body.removeClass('ss-document-pdf');
   this.sentinel=this.body.createEl('button',{cls:'ss-document-more',text:'Continue reading'});
   this.sentinel.onclick=()=>void this.append(revision,owner);
   const observer=new IntersectionObserver(entries=>{
    if(entries.some(e=>e.isIntersecting))void this.append(revision,owner);
   },{root:this.body,rootMargin:'200px'});
   owner.register(()=>observer.disconnect());observer.observe(this.sentinel);
   await this.append(revision,owner);
  }catch(e){if(this.alive&&revision===this.revision)this.body.textContent=(e as Error).message;}
 }
 private async append(revision:number,owner:Component){
  if(this.busy||!this.alive||revision!==this.revision||!this.sentinel||this.next>=this.chunks.length)return;
  this.busy=true;
  const chunk=this.body.createDiv({cls:'ss-document-chunk'});this.sentinel.before(chunk);
  try{await MarkdownRenderer.render(this.app,this.chunks[this.next++],chunk,this.file!.path,owner);}
  catch(e){chunk.textContent=(e as Error).message;}
  if(!this.alive||revision!==this.revision)return;
  this.busy=false;
  if(this.next>=this.chunks.length)this.sentinel.remove();
 }
 onunload(){this.alive=false;this.revision++;this.observer?.disconnect();this.rendering?.unload();}
}
class DocumentModal extends Modal {
 private panel?:DocumentPanel;
 private presentation?:HTMLElement;
 onOpen(){this.modalEl.addClass('ss-document-modal');}
 show(source:string,path:string){this.presentation=this.contentEl.ownerDocument.querySelector<HTMLElement>('.ss-present')??undefined;this.presentation?.dispatchEvent(new CustomEvent('ss-document-open',{detail:()=>this.close()}));this.panel=new DocumentPanel(this.app,this.contentEl,source,path,true);this.panel.load();}
 onClose(){this.panel?.unload();this.contentEl.empty();this.presentation?.dispatchEvent(new CustomEvent('ss-document-close'));}
}
export function openDocument(app:App,source:string,path:string){
 const modal=new DocumentModal(app);modal.open();modal.show(source,path);
 if(document.fullscreenElement)document.fullscreenElement.append(modal.containerEl);
}
class DocumentOptions extends Modal {
 constructor(app:App,private file:DocumentChoice,private done:(source:string)=>void,private preview=false){super(app);}
 onOpen(){
  this.modalEl.addClass('ss-document-options');
  this.titleEl.textContent=(this.preview?'Open ':'Insert ')+(this.file.extension==='pdf'?'PDF':'note');
  this.contentEl.createEl('p',{text:this.file.basename});
  const label=this.contentEl.createEl('label',{text:this.file.extension==='pdf'?'Starting page':'Heading or block (optional)'});
  const target=label.createEl('input',{type:'text'});target.value=this.file.extension==='pdf'?'1':'';
  target.setAttribute('aria-label',label.textContent||'Start at');
  const heightLabel=this.contentEl.createEl('label',{text:'Window height'});
  const height=heightLabel.createEl('input',{type:'number',value:'560'});height.min='180';height.max='1200';height.setAttribute('aria-label','Window height');
  const save=()=>{
   let suffix=target.value.trim();
   if(this.file.extension==='pdf'){
    if(!/^\d+$/.test(suffix)||Number(suffix)<1){new Notice('Enter a positive page number.');return;}
    suffix='page='+suffix;
   }else suffix=suffix.replace(/^#/,'');
   const source=documentSource(this.file.path+(suffix?'#'+suffix:''),Number(height.value),this.file.vault?.name,this.file.vault?.id);
   try{parseDocument(source.split('\n').slice(1,-1).join('\n'));}catch(e){new Notice((e as Error).message);return;}
   this.close();this.done(source);
  };
  const insert=this.contentEl.createEl('button',{text:this.preview?'Open':'Insert',cls:'mod-cta'});insert.onclick=save;
  this.scope.register([], 'Enter',()=>{save();return false;});target.focus();target.select();
 }
}
export function chooseDocument(app:App,kind:'md'|'pdf'|'all',done:(source:string)=>void,preview=false){
 new DocumentGallery(app,kind,file=>{if(file.extension==='image'){done('![['+file.path+']]');return;}new DocumentOptions(app,file,done,preview).open();},!preview).open();
}
