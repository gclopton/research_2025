import {installPaperProtection} from './paper-protection';
import {rebasePaperLink} from './working-copy';
import {PaperProtectionIndex,workingCopyName} from './paper-protection-model';
import {App, FuzzySuggestModal, ItemView, Menu, Modal, Notice, Plugin, TFile, WorkspaceLeaf, loadPdfJs, setIcon} from 'obsidian';
import * as fs from 'node:fs/promises';
import * as nodePath from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {FinderPreviews} from './finder-preview';
import {CATALOG_PATH,LibraryCatalog,PaperSource,addMembership,duplicateMatch,libraryLabel,libraryTrail,paperIds,resolvePaperPath,validateCatalog,moveLibrary,relocatePaperPaths,libraryColor,librarySearchPage,paperCleanupBadge} from './library-model';
import {preparePaperCatalog} from './library-storage';
const VIEW='paper-library';
const SIDEBAR='paper-library-navigation';
class LibraryPicker extends FuzzySuggestModal<string>{
 constructor(app:App,private catalog:LibraryCatalog,private choose:(id:string)=>void,placeholder='Jump to a library'){super(app);this.setPlaceholder(placeholder);}
 getItems(){return Object.keys(this.catalog.libraries);}
 getItemText(id:string){return libraryLabel(this.catalog,id);}
 onChooseItem(id:string){this.choose(id);}
}
class NameDialog extends Modal {
 constructor(app:App,private label:string,private initial:string,private done:(s:string)=>void){super(app);}
 onOpen(){this.titleEl.setText(this.label);const input=this.contentEl.createEl('input',{type:'text',value:this.initial,attr:{'aria-label':this.label}});input.style.width='100%';const save=()=>{if(input.value.trim()){this.done(input.value.trim());this.close();}};input.onkeydown=e=>{if(e.key==='Enter')save();};this.contentEl.createEl('button',{text:'Save',cls:'mod-cta'}).onclick=save;input.focus();input.select();}
 onClose(){this.contentEl.empty();}
}
export class PaperLibraries {
 catalog!:LibraryCatalog;private raw='';private chain=Promise.resolve();private timers=new Map<string,number>();private listeners=new Set<()=>void>();issues=new Map<string,string>();
 private protection?:{isProtected(path:string):boolean};
 reportProtectionIssue(path:string,message:string){if(this.issues.get(path)===message)return;this.issues.set(path,message);this.emit();new Notice(message+' '+path,9000);}
 isProtected(path:string){return this.protection?.isProtected(path)??false;}
 currentLibrary:string|null=null;private selectionListeners=new Set<()=>void>();
 select(id:string|null){this.currentLibrary=id;for(const f of this.selectionListeners)f();}
 subscribeSelection(f:()=>void){this.selectionListeners.add(f);return ()=>this.selectionListeners.delete(f);}
 constructor(public plugin:Plugin){}
 get app(){return this.plugin.app;}
 async start(){const base=(this.app.vault.adapter as any).getBasePath?.();if(!base||!await preparePaperCatalog(base))return false;await this.reload();this.protection=installPaperProtection(this.plugin,this);
  this.plugin.registerView(VIEW,l=>new PaperLibraryView(l,this));
  this.plugin.addCommand({id:'open-paper-libraries',name:'Open paper libraries',callback:()=>void this.open()});
  this.plugin.addCommand({id:'import-paper-pdf',name:'Add PDF to paper library',callback:()=>this.pickLibrary(id=>this.importPicker(id),'Add PDF to which library?')});
  this.plugin.addCommand({id:'register-paper-reading-copy',name:'Register paper reading copy',callback:()=>void this.registerReadingCopy()});
  this.plugin.addCommand({id:'check-paper-library',name:'Check paper library integrity',callback:()=>void this.check()});
  this.plugin.registerView(SIDEBAR,l=>new PaperLibraryNavigation(l,this));
  this.plugin.register(()=>{const leaves:WorkspaceLeaf[]=[];this.app.workspace.iterateAllLeaves(l=>{if(l.getViewState().type===SIDEBAR)leaves.push(l);});for(const leaf of leaves)leaf.detach();});
  this.app.workspace.onLayoutReady(()=>{
   if(!this.app.workspace.getLeavesOfType(SIDEBAR).length){
    const leaf=this.app.workspace.getLeftLeaf(false);
    if(leaf)void leaf.setViewState({type:SIDEBAR,active:false});
   }
  });
  this.plugin.registerEvent(this.app.vault.on('modify',f=>{if(f.path===CATALOG_PATH)void this.reload().catch(e=>new Notice(String(e)));}));
  this.app.workspace.onLayoutReady(()=>this.plugin.registerEvent(this.app.vault.on('create',f=>{if(f instanceof TFile&&f.path.startsWith((this.catalog.sourceRoot??'Papers')+'/')&&['pdf','md'].includes(f.extension))this.checkArrival(f);})));
  this.plugin.registerEvent(this.app.vault.on('rename',(f,old)=>{void this.change(c=>relocatePaperPaths(c,old,f.path,!(f instanceof TFile)),true).catch(e=>new Notice(String(e)));}));
  this.plugin.registerEvent(this.app.vault.on('delete',f=>{if(Object.values(this.catalog.sources).some(s=>[s.pdf.path,s.conversion?.path].some(p=>p===f.path||p?.startsWith(f.path+'/')))){this.issues.set(f.path,'Registered source was removed');this.emit();new Notice('A shared paper source was removed. Check paper library integrity.',10000);}}));
  this.plugin.registerInterval(window.setInterval(()=>{void this.app.vault.adapter.read(CATALOG_PATH).then(raw=>{if(raw!==this.raw){this.catalog=validateCatalog(JSON.parse(raw));this.raw=raw;this.emit();}}).catch(()=>{});},5000));
  this.plugin.addCommand({id:'recover-paper-library-lock',name:'Recover abandoned paper library lock',callback:()=>void this.recoverLock()});
  this.plugin.register(()=>{for(const t of this.timers.values())window.clearTimeout(t);this.listeners.clear();});return true;
 }
 async reload(){this.raw=await this.app.vault.adapter.read(CATALOG_PATH);this.catalog=validateCatalog(JSON.parse(this.raw));this.emit();}
 resolve(path:string){return resolvePaperPath(this.catalog,path);}
 sourceFor(path:string){const p=this.resolve(path);return Object.entries(this.catalog.sources).find(([,s])=>s.pdf.path===p||s.conversion?.path===p)?.[0];}
 subscribe(f:()=>void){this.listeners.add(f);return ()=>this.listeners.delete(f);}
 private emit(){for(const f of this.listeners)f();}
 async change(edit:(c:LibraryCatalog)=>void,refresh=false){const job=this.chain.then(async()=>{
  const base=(this.app.vault.adapter as any).getBasePath?.();if(!base)throw Error('This catalog needs a local vault.');
  const path=nodePath.join(base,CATALOG_PATH),lock=path+'.lock';let handle;
  try{handle=await fs.open(lock,'wx');await handle.writeFile(JSON.stringify({pid:process.pid,created:Date.now()}));}catch{throw Error('The paper catalog is being updated. Try again in a moment.');}
  const temp=path+'.'+randomUUID()+'.tmp';
  try{const current=await fs.readFile(path,'utf8');if(current!==this.raw){await this.reload();if(!refresh)throw Error('The library changed elsewhere. It has been refreshed; please repeat your change.');}
   const next=structuredClone(this.catalog);edit(next);if(JSON.stringify(next)===JSON.stringify(this.catalog))return;next.revision++;validateCatalog(next);const text=JSON.stringify(next,null,2)+'\n';await fs.writeFile(temp,text,{flag:'wx'});await fs.rename(temp,path);this.raw=text;this.catalog=next;this.emit();
  }finally{await fs.unlink(temp).catch(()=>{});await handle.close();await fs.unlink(lock);}
 });this.chain=job.catch(()=>{});return job;}
 async recoverLock(){
  const base=(this.app.vault.adapter as any).getBasePath?.();const path=nodePath.join(base,CATALOG_PATH+'.lock');
  try{const stat=await fs.stat(path);if(Date.now()-stat.mtimeMs<60000){new Notice('Catalog update is recent. Try again after a minute.');return;}
   const modal=new Modal(this.app);modal.titleEl.setText('Recover abandoned catalog lock');modal.contentEl.createEl('p',{text:'Close other paper import or conversion tools before recovering this lock.'});modal.contentEl.createEl('button',{text:'Recover lock',cls:'mod-cta'}).onclick=()=>void (async()=>{const current=await fs.stat(path);if(current.mtimeMs!==stat.mtimeMs)throw Error('Lock changed; retry');await fs.unlink(path);modal.close();new Notice('Catalog lock recovered.');})().catch(e=>new Notice(String(e)));modal.open();
  }catch(e){new Notice('No abandoned lock found.');}
 }
 createWorkingCopy(path=this.app.workspace.getActiveFile()?.path){
  if(!path)return;const id=this.sourceFor(path),source=id&&this.catalog.sources[id];if(!source||!id)return;
  if(!source.conversion){new Notice('Convert this paper before creating an editable working copy.');return;}
  const from=this.app.vault.getAbstractFileByPath(source.conversion.path);if(!(from instanceof TFile))return;
  let number=1;while(this.app.vault.getAbstractFileByPath('Paper notes/'+workingCopyName(from.name,`Working copy ${number}`)))number++;
  new NameDialog(this.app,'Duplicate before editing — choose a distinct title suffix',`Working copy ${number}`,description=>void(async()=>{
   const filename=workingCopyName(from.name,description),folder='Paper notes',dest=folder+'/'+filename;
   new PaperProtectionIndex(this.catalog).assertDestination(dest);
   if(this.app.vault.getAbstractFileByPath(dest))throw Error('That working copy already exists. Choose another description.');
   const raw=await this.app.vault.read(from);
   // Resolve links before moving a full-text copy outside the original image folder.
   const cache=this.app.metadataCache.getFileCache(from),edits:{from:number;to:number;text:string}[]=[];
   if(!cache)throw Error('The paper is still being indexed. Try creating the working copy again in a moment.');
   for(const link of [...(cache?.links??[]),...(cache?.embeds??[])]){
    if(link.link.startsWith('#'))continue;
    const target=this.app.metadataCache.getFirstLinkpathDest(link.link.split('#')[0],from.path);if(!target)continue;
    const original=raw.slice(link.position.start.offset,link.position.end.offset);const hashAt=link.link.indexOf('#');const suffix=hashAt<0?'':link.link.slice(hashAt);
    const replacement=rebasePaperLink(original,target.path,suffix);
    if(replacement!==original)edits.push({from:link.position.start.offset,to:link.position.end.offset,text:replacement});
   }
   let body=raw;for(const edit of edits.sort((a,b)=>b.from-a.from))body=body.slice(0,edit.from)+edit.text+body.slice(edit.to);
   body=body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
   const text='---\nworkingCopyOf: '+id+'\nsource: '+JSON.stringify('[['+from.path+'|'+source.title.replace(/[|\[\]]/g,' ')+']]')+'\n---\n\n'+body;
   if(!this.app.vault.getAbstractFileByPath(folder))await this.app.vault.createFolder(folder);
   const file=await this.app.vault.create(dest,text);await this.app.workspace.getLeaf('tab').openFile(file,{state:{mode:'source'}});new Notice('Editable working copy created. The paper and its annotations remain unchanged.');
  })().catch(e=>new Notice(String(e),8000))).open();
 }
 async open(library?:string|null){let leaf=this.app.workspace.getLeavesOfType(VIEW)[0];if(!leaf){leaf=this.app.workspace.getLeaf('tab');await leaf.setViewState({type:VIEW,active:true});}if(library!==undefined)await leaf.setViewState({type:VIEW,state:{library},active:true});await this.app.workspace.revealLeaf(leaf);}
 pickLibrary(done:(id:string)=>void,label?:string){new LibraryPicker(this.app,this.catalog,done,label).open();}
 add(id:string,library:string){void this.change(c=>addMembership(c,id,library)).catch(e=>new Notice(String(e)));}
 importPicker(library:string){const input=document.createElement('input');input.type='file';input.accept='.pdf';input.onchange=()=>{const file=input.files?.[0];if(file)void this.importPDF(file,library).catch(e=>new Notice(String(e),10000));};input.click();}
 async importPDF(file:File,library:string,separate=false){
  const buffer=await file.arrayBuffer(),bytes=new Uint8Array(buffer);const hash=createHash('sha256').update(bytes).digest('hex');
  if(new TextDecoder().decode(buffer.slice(0,5))!=='%PDF-')throw Error('Choose a PDF document.');
  const title=file.name.replace(/\.pdf$/i,'');let doi:string|undefined;
  const xml=new TextDecoder('latin1').decode(bytes);const raw=xml.match(/<(?:prism:doi|dc:identifier)[^>]*>\s*(?:doi:)?(10\.[^<\s]+)\s*<\//i)?.[1];
  doi=raw;
  if(!doi){let task:any;try{const lib=await loadPdfJs();task=lib.getDocument({data:bytes.slice()});const pdf=await task.promise;const page=await pdf.getPage(1);const text=(await page.getTextContent()).items.map((x:any)=>x.str??'').join(' ');const hits=[...new Set((text.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi)??[]).map((x:string)=>x.replace(/[.,;]+$/,'')))];if(hits.length===1)doi=String(hits[0]);}catch{}finally{await task?.destroy();}}
  const match=duplicateMatch(this.catalog,hash,title,doi);
  if(match&&(match.kind==='exact'||!separate)){
   if(match.kind==='candidate'){
    const modal=new Modal(this.app);modal.titleEl.setText('Review matching papers');
    modal.contentEl.createEl('p',{text:'Choose the existing paper to share it with this library, or keep this as a separate work.'});
    for(const id of match.ids)modal.contentEl.createEl('button',{text:this.catalog.sources[id].title}).onclick=()=>{this.add(id,library);modal.close();};
    modal.contentEl.createEl('button',{text:'Import as a separate paper'}).onclick=()=>{modal.close();void this.importPDF(file,library,true).catch(e=>new Notice(String(e)));};modal.open();return;
   }
   await this.change(c=>addMembership(c,match.ids[0],library));new Notice('Existing paper added to this library.');return;
  }
  const id='src_'+randomUUID().replace(/-/g,'').slice(0,14);const dir=(this.catalog.sourceRoot??'Papers')+'/Sources/'+id;
  await this.change(c=>{
   const again=duplicateMatch(c,hash,title,doi);if(again&&(again.kind==='exact'||!separate))throw Error('A matching paper arrived during import. Repeat the import to use it.');
   c.sources[id]={title,...(doi?{doi}:{}),pdf:{path:dir+'/'+file.name.replace(/[\\/:*?"<>|#^\[\]]/g,'_'),sha256:hash,bytes:buffer.byteLength}};addMembership(c,id,library);
  });
  try{await this.app.vault.createFolder(dir);await this.app.vault.createBinary(this.catalog.sources[id].pdf.path,buffer);new Notice('PDF added. Use Register paper reading copy after Mathpix conversion.');}
  catch(e){this.issues.set(this.catalog.sources[id].pdf.path,'PDF import could not finish; source file remains at its original location');this.emit();throw e;}
 }
 async registerReadingCopy(){
  const file=this.app.workspace.getActiveFile();if(!file||file.extension!=='md'){new Notice('Open the completed paper conversion first.');return;}
  const matches=duplicateMatch(this.catalog,'',file.basename)?.ids??[];
  const available=Object.entries(this.catalog.sources).filter(([id,s])=>!s.conversion&&(!matches.length||matches.includes(id)));
  class Picker extends FuzzySuggestModal<string>{getItems(){return available.map(([id])=>id);}getItemText(id:string){return available.find(([i])=>i===id)![1].title;}onChooseItem=async(id:string)=>{
   try{await owner.change(c=>{if(c.sources[id].conversion)throw Error('This paper already has a reading copy');c.sources[id].conversion={path:file!.path};});owner.issues.delete(file!.path);new Notice('Reading copy registered.');}catch(e){new Notice(String(e));}
  };}
  const owner=this;const picker=new Picker(this.app);picker.setPlaceholder('Which paper does this reading copy belong to?');picker.open();
 }

 private checkArrival(file:TFile){window.clearTimeout(this.timers.get(file.path));this.timers.set(file.path,window.setTimeout(()=>{this.timers.delete(file.path);void this.inspectArrival(file).catch(()=>{});},1800));}
 private async inspectArrival(file:TFile){if(this.sourceFor(file.path)||!this.app.vault.getAbstractFileByPath(file.path))return;const size=file.stat.size,mtime=file.stat.mtime;let match;
  if(file.extension==='pdf'){const bytes=await this.app.vault.readBinary(file);if(size!==file.stat.size||mtime!==file.stat.mtime){this.checkArrival(file);return;}match=duplicateMatch(this.catalog,createHash('sha256').update(new Uint8Array(bytes)).digest('hex'),file.basename);}
  else if(file.path.includes('/markdown_originals/')){match=duplicateMatch(this.catalog,'',file.basename);}else return;
  if(match){const source=this.catalog.sources[match.ids[0]];const needsReading=file.extension==='md'&&!source.conversion;this.issues.set(file.path,(needsReading?'Reading copy awaiting registration: ':'Possible duplicate of ')+source.title);new Notice(needsReading?'Open the conversion and run Register paper reading copy.':'A duplicate paper may have arrived. Open Paper libraries to review it.',10000);this.emit();}
 }
 async check(){
  this.issues.clear();const hashes=new Map<string,string>(),protection=new PaperProtectionIndex(this.catalog);
  for(const s of Object.values(this.catalog.sources)){
   for(const ref of [s.pdf,s.conversion])if(ref&&!await this.app.vault.adapter.exists(ref.path))this.issues.set(ref.path,'Registered source is missing');
   hashes.set(s.pdf.sha256,s.pdf.path);
   for(const e of s.equivalentPdfs??[])hashes.set(e.sha256,s.pdf.path);
   if(s.cleanup&&s.conversion&&await this.app.vault.adapter.exists(s.conversion.path)){
    const hash=createHash('sha256').update(new Uint8Array(await this.app.vault.adapter.readBinary(s.conversion.path))).digest('hex');
    if(hash!==s.cleanup.markdownSha256)this.issues.set(s.conversion.path,'Cleaned reading copy changed outside the editor');
   }
  }
  for(const f of this.app.vault.getFiles()){
   if(!protection.canonicalPaths.has(f.path)&&protection.ownerForName(f.path))this.issues.set(f.path,'Reserved paper title; use a descriptive working-copy suffix');
   if(!f.path.startsWith((this.catalog.sourceRoot??'Papers')+'/'))continue;
   if(f.extension==='pdf'){
    const hash=createHash('sha256').update(new Uint8Array(await this.app.vault.readBinary(f))).digest('hex');
    const previous=hashes.get(hash);
    if(previous&&previous!==f.path)this.issues.set(f.path,'Duplicate of '+previous);
    else hashes.set(hash,f.path);
    const id=this.sourceFor(f.path);
    if(id&&this.catalog.sources[id].pdf.sha256!==hash)this.issues.set(f.path,'Registered PDF has changed; review its identity');
    else if(!id&&!previous)await this.inspectArrival(f);
   }else if(f.extension==='md')await this.inspectArrival(f);
  }
  this.emit();new Notice(this.issues.size?`${this.issues.size} paper source issues. Open Paper libraries to review.`:'Paper library integrity check passed.',8000);
 }

}
class PaperLibraryView extends ItemView {
 private library:string|null=null;private page=0;private query='';private header!:HTMLElement;private body!:HTMLElement;private search!:HTMLInputElement;private previews!:FinderPreviews;private observer?:IntersectionObserver;private unsubscribe?:()=>void;private history:(string|null)[]=[];private forward:(string|null)[]=[];private positions=new Map<string,number>();private searchTimer?:number;private selected=0;private density=270;private selections=new Map<string,number>();private cards:HTMLElement[]=[];
 constructor(leaf:WorkspaceLeaf,private owner:PaperLibraries){super(leaf);}
 getViewType(){return VIEW;}getDisplayText(){return this.library?this.owner.catalog.libraries[this.library]?.title??'Paper libraries':'Paper libraries';}getIcon(){return 'library';}
 async onOpen(){this.contentEl.addClass('ig-library');this.previews=new FinderPreviews(this.app,this.contentEl.ownerDocument);this.header=this.contentEl.createDiv({cls:'ig-library-header'});this.body=this.contentEl.createDiv({cls:'ig-library-body'});this.unsubscribe=this.owner.subscribe(()=>this.render());this.registerDomEvent(this.contentEl,'keydown',e=>this.key(e));this.render();}
 async onClose(){this.unsubscribe?.();this.observer?.disconnect();this.previews.close();window.clearTimeout(this.searchTimer);}
 getState(){return {library:this.library,density:this.density};}async setState(s:any,result:any){this.density=Math.min(420,Math.max(200,Number(s?.density)||270));this.contentEl.style.setProperty('--paper-card-width',this.density+'px');this.library=s?.library&&this.owner.catalog.libraries[s.library]?s.library:null;this.owner.select(this.library);await super.setState(s,result);if(this.header)this.render();}
 private go(id:string|null,remember=true){this.positions.set(this.library??'',this.body.scrollTop);this.selections.set(this.library??'',this.selected);if(remember){this.history.push(this.library);this.forward=[];}this.library=id;this.page=0;this.owner.select(id);this.query='';this.selected=this.selections.get(id??'')??0;this.render();this.body.scrollTop=this.positions.get(id??'')??0;this.cards[Math.min(this.selected,this.cards.length-1)]?.focus();(this.leaf as any).updateHeader?.();this.app.workspace.requestSaveLayout();}
 private key(e:KeyboardEvent){const input=e.target instanceof HTMLInputElement;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();this.owner.pickLibrary(id=>this.go(id));return;}if(input){if(e.key==='Escape'){e.preventDefault();this.cards[this.selected]?.focus();}return;}
  if(e.key==='/' ){e.preventDefault();this.search.focus();return;}if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();const prev=this.history.pop();if(prev!==undefined){this.forward.push(this.library);this.go(prev,false);}return;}if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();const next=this.forward.pop();if(next!==undefined){this.history.push(this.library);this.go(next,false);}return;}
  if(e.key==='Backspace'||e.altKey&&e.key==='ArrowUp'){e.preventDefault();this.go(this.library?this.owner.catalog.libraries[this.library].parent:null);return;}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='l'){e.preventDefault();const id=this.cards[this.selected]?.dataset.paper;if(id)this.owner.pickLibrary(lib=>this.owner.add(id,lib),'Add paper to library');return;}
  if((e.metaKey||e.ctrlKey)&&['=','+','-','0'].includes(e.key)){e.preventDefault();this.density=e.key==='0'?270:Math.min(420,Math.max(200,this.density+(e.key==='-'?-35:35)));this.contentEl.style.setProperty('--paper-card-width',this.density+'px');this.app.workspace.requestSaveLayout();return;}
  let n=this.selected;const rect=this.cards[n]?.getBoundingClientRect();
  const vertical=(direction:number)=>{if(!rect)return n;const candidates=this.cards.map((card,i)=>({i,r:card.getBoundingClientRect()})).filter(x=>direction*(x.r.top-rect.top)>4);candidates.sort((a,b)=>Math.abs(a.r.top-rect.top)-Math.abs(b.r.top-rect.top)||Math.abs(a.r.left-rect.left)-Math.abs(b.r.left-rect.left));return candidates[0]?.i??n;};
  if(e.key==='ArrowRight')n++;else if(e.key==='ArrowLeft')n--;else if(e.key==='ArrowDown')n=vertical(1);else if(e.key==='ArrowUp')n=vertical(-1);else if(e.key==='Home')n=0;else if(e.key==='End')n=this.cards.length-1;else return;
  e.preventDefault();this.selected=Math.min(this.cards.length-1,Math.max(0,n));this.cards[this.selected]?.focus();
 }
 private openPaper(id:string,pdf=false,newTab=false){const s=this.owner.catalog.sources[id];const p=pdf?s.pdf.path:s.conversion?.path??s.pdf.path;void this.app.workspace.openLinkText(p,'',newTab);}
 private render(bodyOnly=false){const c=this.owner.catalog;this.observer?.disconnect();this.body.empty();this.cards=[];if(!bodyOnly){this.header.empty();
  const nav=this.header.createDiv({cls:'ig-library-nav'});nav.createEl('button',{text:'Libraries'}).onclick=()=>this.go(null);
  for(const id of libraryTrail(c,this.library)){nav.createSpan({text:'›'});nav.createEl('button',{text:c.libraries[id].title}).onclick=()=>this.go(id);}
  nav.createEl('button',{text:'Jump…',attr:{'aria-label':'Jump to library (Command K)'}}).onclick=()=>this.owner.pickLibrary(id=>this.go(id));
  const controls=this.header.createDiv({cls:'ig-library-search'});this.search=controls.createEl('input',{type:'search',placeholder:this.library?'Find papers in this library…':'Find papers across all libraries…',value:this.query,attr:{'aria-label':'Search paper libraries'}});this.search.oninput=()=>{this.query=this.search.value;this.page=0;window.clearTimeout(this.searchTimer);this.searchTimer=window.setTimeout(()=>this.render(true),120);};
  controls.createEl('button',{text:'＋',attr:{'aria-label':'Library actions'}}).onclick=e=>{const m=new Menu();m.addItem(i=>i.setTitle('Add PDF…').setIcon('file-plus').onClick(()=>this.library?this.owner.importPicker(this.library):this.owner.pickLibrary(id=>this.owner.importPicker(id),'Add PDF to library')));m.addItem(i=>i.setTitle('New library…').setIcon('folder-plus').onClick(()=>this.newLibrary()));m.addItem(i=>i.setTitle('Check source integrity').onClick(()=>void this.owner.check()));m.showAtMouseEvent(e);};}
  if(this.owner.issues.size){const details=this.body.createEl('details',{cls:'ig-library-issues'});details.createEl('summary',{text:`${this.owner.issues.size} source items need review`});for(const [p,msg]of this.owner.issues){const row=details.createDiv();row.createEl('button',{text:p.split('/').pop()??p}).onclick=()=>void this.app.workspace.openLinkText(p,'');row.createSpan({text:' — '+msg});}}
  const q=this.query.toLowerCase().trim();const children=Object.entries(c.libraries).filter(([,l])=>l.parent===this.library).sort((a,b)=>a[1].title.localeCompare(b[1].title,undefined,{numeric:true}));
  if(children.length&&!q){
   const libs=this.body.createDiv({cls:'ig-library-children'});
   for(const [id,l]of children){
    const card=libs.createEl('button',{cls:'ig-library-tile'});card.style.setProperty('--library-color',libraryColor(c,id));
    const cover=card.createDiv({cls:'ig-library-tile-cover'});const glyph=cover.createSpan();setIcon(glyph,'library');
    const content=card.createDiv({cls:'ig-library-tile-body'});content.createEl('strong',{text:l.title});
    const n=paperIds(c,id).length,sub=Object.values(c.libraries).filter(l=>l.parent===id).length;
    content.createSpan({cls:'ig-library-tile-meta',text:`${n} ${n===1?'paper':'papers'}${sub?` · ${sub} ${sub===1?'sublibrary':'sublibraries'}`:''}`});
    card.onclick=()=>this.go(id);card.onfocus=()=>{this.selected=this.cards.indexOf(card);};card.oncontextmenu=e=>{e.preventDefault();this.libraryMenu(e,id);};card.ondragover=e=>e.preventDefault();card.ondrop=e=>{e.preventDefault();const p=e.dataTransfer?.getData('application/x-paper-source');if(p)this.owner.add(p,id);};this.cards.push(card);
   }
  }
  if(!this.library&&!q){this.previews.prioritize(new Set());return;}
  const result=librarySearchPage(c,this.library,q,this.page);this.page=result.page;const ids=result.ids;
  this.body.createDiv({cls:'ig-library-count',text:result.total>40?`${this.page*40+1}–${this.page*40+ids.length} of ${result.total} papers`:`${result.total} ${result.total===1?'paper':'papers'}${this.library?' · including sublibraries':''}`});
  const grid=this.body.createDiv({cls:'ig-library-grid'});
  this.observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){this.observer?.unobserve(e.target);const el=e.target as HTMLElement;const f=this.app.vault.getAbstractFileByPath(el.dataset.path!);if(f instanceof TFile)void this.previews.get(f).then(p=>{if(p&&el.isConnected){el.empty();el.appendChild(p.el);}});}},{root:this.body,rootMargin:'200px'});
  this.previews.prioritize(new Set(ids.map(id=>c.sources[id].pdf.path)));
  for(const id of ids){const s=c.sources[id];const card=grid.createDiv({cls:'ig-library-paper',attr:{tabindex:'0',role:'group','aria-label':s.title}});card.dataset.paper=id;card.draggable=true;card.ondragstart=e=>e.dataTransfer?.setData('application/x-paper-source',id);
   const preview=card.createDiv({cls:'ig-library-cover',text:'PDF'});preview.dataset.path=s.pdf.path;this.observer.observe(preview);preview.onclick=e=>this.openPaper(id,false,e.metaKey||e.ctrlKey);
   const title=card.createEl('button',{cls:'ig-library-paper-title',text:s.title});title.onclick=e=>this.openPaper(id,false,e.metaKey||e.ctrlKey);
   card.createDiv({cls:'ig-library-byline',text:[s.authors,s.year].filter(Boolean).join(' · ')});const links=card.createDiv({cls:'ig-library-paper-links'});links.createEl('button',{text:'PDF'}).onclick=()=>this.openPaper(id,true);
   const count=c.memberships.filter(m=>m.source===id).length;const memberships=links.createEl('button',{text:`${count} ${count===1?'library':'libraries'}`});memberships.onclick=e=>this.paperMenu(e,id);if(s.evidence?.length)links.createSpan({text:'• Evidence',cls:'ig-library-evidence'});
   const cleanup=paperCleanupBadge(s);card.setAttribute('aria-label',`${s.title} · ${cleanup.label}`);links.createSpan({cls:'ig-library-cleanup',text:cleanup.icon,attr:{role:'img','aria-label':cleanup.label,title:cleanup.label}});
   card.oncontextmenu=e=>{e.preventDefault();this.paperMenu(e,id);};card.addEventListener('keydown',e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();const r=card.getBoundingClientRect();this.paperMenu(new MouseEvent('contextmenu',{clientX:r.left+20,clientY:r.top+30}),id);}});card.onfocus=()=>{this.selected=this.cards.indexOf(card);};card.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();this.openPaper(id,e.shiftKey,e.metaKey||e.ctrlKey);}};this.cards.push(card);
  }
  if(result.total>40){const pagination=this.body.createDiv({cls:'ig-library-pagination'});const changePage=(n:number)=>{this.page=n;this.selected=0;this.render(true);this.body.scrollTop=0;this.cards[0]?.focus();};const prev=pagination.createEl('button',{text:'Previous'});prev.disabled=this.page===0;prev.onclick=()=>changePage(this.page-1);pagination.createSpan({text:`Page ${this.page+1} of ${Math.ceil(result.total/40)}`});const next=pagination.createEl('button',{text:'Next'});next.disabled=(this.page+1)*40>=result.total;next.onclick=()=>changePage(this.page+1);}
  if(!ids.length)this.body.createEl('p',{text:q?'No matching papers.':'Add a paper here, or choose a sublibrary.'});
 }
 private newLibrary(){new NameDialog(this.app,'New library','',title=>void this.owner.change(c=>{c.libraries['lib_'+randomUUID().slice(0,12)]={title,parent:this.library};}).catch(e=>new Notice(String(e)))).open();}
 private libraryMenu(e:MouseEvent,id:string){const m=new Menu();m.addItem(i=>i.setTitle('Open library').onClick(()=>this.go(id)));m.addItem(i=>i.setTitle('Rename library…').onClick(()=>new NameDialog(this.app,'Library name',this.owner.catalog.libraries[id].title,title=>void this.owner.change(c=>{c.libraries[id].title=title;}).catch(e=>new Notice(String(e)))).open()));m.addItem(i=>i.setTitle('Move into library…').onClick(()=>this.owner.pickLibrary(parent=>void this.owner.change(c=>moveLibrary(c,id,parent)).catch(e=>new Notice(String(e))))));m.addItem(i=>i.setTitle('Move to top level').onClick(()=>void this.owner.change(c=>moveLibrary(c,id,null)).catch(e=>new Notice(String(e)))));m.showAtMouseEvent(e);}
 private paperMenu(e:MouseEvent,id:string){const c=this.owner.catalog,s=c.sources[id];const m=new Menu();const cleanup=paperCleanupBadge(s);m.addItem(i=>i.setTitle(`${cleanup.icon} ${cleanup.label}`).setDisabled(true));m.addSeparator();m.addItem(i=>i.setTitle('Create working copy…').setIcon('copy').setDisabled(!s.conversion).onClick(()=>this.owner.createWorkingCopy(s.conversion?.path)));m.addItem(i=>i.setTitle('Open reading copy').setDisabled(!s.conversion).onClick(()=>this.openPaper(id)));m.addItem(i=>i.setTitle('Open PDF').onClick(()=>this.openPaper(id,true)));m.addItem(i=>i.setTitle('Add to library…').onClick(()=>this.owner.pickLibrary(lib=>this.owner.add(id,lib),'Add paper to library')));
  for(const x of c.memberships.filter(x=>x.source===id))m.addItem(i=>i.setTitle('Go to '+libraryLabel(c,x.library)).onClick(()=>this.go(x.library)));
  if(this.library&&c.memberships.filter(x=>x.source===id).length>1&&c.memberships.some(x=>x.library===this.library&&x.source===id))m.addItem(i=>i.setTitle('Remove from this library').onClick(()=>void this.owner.change(next=>{next.memberships=next.memberships.filter(x=>x.source!==id||x.library!==this.library);}).catch(e=>new Notice(String(e)))));
  m.addItem(i=>i.setTitle('Copy paper link').onClick(()=>void navigator.clipboard.writeText(`[[${s.conversion?.path??s.pdf.path}|${s.title.replace(/[|\[\]]/g,' ')}]]`)));m.showAtMouseEvent(e);
 }
}

/** A native sidebar tab puts the library icon beside Files, Search and Bookmarks. */
class PaperLibraryNavigation extends ItemView {
 private unsubscribe?:()=>void;private selectionUnsubscribe?:()=>void;private expanded=new Set<string>();
 constructor(leaf:WorkspaceLeaf,private owner:PaperLibraries){super(leaf);}
 getViewType(){return SIDEBAR;} getDisplayText(){return 'Paper libraries';} getIcon(){return 'library';}
 async onOpen(){
  this.contentEl.addClass('ig-library-sidebar');
  const header=(this.leaf as WorkspaceLeaf & {tabHeaderEl?:HTMLElement}).tabHeaderEl;
  if(header)this.registerDomEvent(header,'click',()=>void this.owner.open());
  this.unsubscribe=this.owner.subscribe(()=>this.render());this.selectionUnsubscribe=this.owner.subscribeSelection(()=>this.markSelection());this.render();
 }
 async onClose(){this.unsubscribe?.();this.selectionUnsubscribe?.();}
 private markSelection(){
  const selected=this.owner.currentLibrary,trail=libraryTrail(this.owner.catalog,selected);
  this.contentEl.querySelectorAll<HTMLButtonElement>('[data-library]').forEach(el=>{const id=el.dataset.library??'';el.classList.toggle('is-current',id===(selected??''));el.classList.toggle('is-ancestor',trail.includes(id)&&id!==selected);if(id===(selected??''))el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  this.contentEl.querySelectorAll<HTMLDetailsElement>('details[data-branch]').forEach(el=>{if(trail.includes(el.dataset.branch!)){el.open=true;this.expanded.add(el.dataset.branch!);}});
 }
 private render(){
  this.contentEl.empty();
  const home=this.contentEl.createEl('button',{text:'All paper libraries',cls:'ig-library-sidebar-home'});home.dataset.library='';home.onclick=()=>void this.owner.open(null);
  this.contentEl.createEl('button',{text:'Jump to library…',cls:'ig-library-sidebar-jump'}).onclick=()=>this.owner.pickLibrary(id=>void this.owner.open(id));
  const c=this.owner.catalog;
  const label=(container:HTMLElement,id:string)=>{const button=container.createEl('button',{text:c.libraries[id].title,cls:'ig-library-sidebar-label'});button.dataset.library=id;button.style.setProperty('--library-color',libraryColor(c,id));button.onclick=e=>{e.preventDefault();e.stopPropagation();void this.owner.open(id);};return button;};
  const branch=(parent:string|null,container:HTMLElement)=>{
   for(const [id,l]of Object.entries(c.libraries).filter(([,l])=>l.parent===parent).sort((a,b)=>a[1].title.localeCompare(b[1].title,undefined,{numeric:true}))){
    const hasChildren=Object.values(c.libraries).some(x=>x.parent===id);
    if(hasChildren){const group=container.createEl('details');group.dataset.branch=id;group.style.setProperty('--library-color',libraryColor(c,id));group.open=this.expanded.has(id);group.ontoggle=()=>{if(group.open)this.expanded.add(id);else this.expanded.delete(id);};const summary=group.createEl('summary');summary.setAttribute('aria-label','Expand '+l.title);label(summary,id);const nested=group.createDiv({cls:'ig-library-sidebar-branch'});branch(id,nested);}
    else {const button=label(container,id);if(parent===null)button.addClass('is-root');}
   }
  };branch(null,this.contentEl);this.markSelection();
 }
}
