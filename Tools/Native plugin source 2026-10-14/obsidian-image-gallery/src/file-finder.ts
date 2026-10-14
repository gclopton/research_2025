import {resizeFinder,FinderDimensions} from './finder-resize';
import {App,Component,Menu,Modal,Notice,TFile,parseFrontMatterAliases,prepareFuzzySearch,renderMatches,Platform} from 'obsidian';
import {FinderEntry,FinderMatch,FinderScope,finderLayout,finderQuery,folderLabels,rankFiles,compareMatches,inScope} from './finder-model';
import {FinderPreviews} from './finder-preview';
type Target='current'|'tab'|'split'|'window';
let nextFinder=0;
export class FileFinder extends Modal {
 private entries:FinderEntry[]=[];private matches:FinderMatch[]=[];private filter:FinderScope='documents';
 private search!:HTMLInputElement;private status!:HTMLButtonElement;private count!:HTMLElement;private grid!:HTMLElement;private layer!:HTMLElement;
 private paths=new Map<string,string>();private selected=0;private closed=false;private owner=new Component();private previews!:FinderPreviews;private resize?:ResizeObserver;
 private pendingSearch:Promise<void>|null=null;private searchTicket=0;private frame=0;private queryFrame=0;private timer?:ReturnType<typeof setTimeout>;private revision=0;private cards=new Map<string,HTMLElement>();
 private sizing?:{reset:()=>void};private menu?:Menu;private layout= finderLayout(1000,100);private uid='igf-'+(++nextFinder);private size:number;
 constructor(app:App,size=100,private saveSize:(n:number)=>void=()=>{},private dimensions:FinderDimensions={},private saveDimensions:(s:FinderDimensions)=>void=()=>{}){super(app);this.size=Math.max(60,Math.min(200,size));}
 onOpen(){
  this.owner.load();this.modalEl.addClass('igf-modal');this.sizing=resizeFinder(this,this.owner,this.dimensions,this.saveDimensions);this.titleEl.textContent='Open a file';this.titleEl.id=this.uid+'-title';
  const tools=this.contentEl.createDiv({cls:'igf-tools'});
  this.search=tools.createEl('input',{type:'search',attr:{placeholder:'Search files…','aria-label':'Search files',role:'combobox','aria-autocomplete':'list','aria-expanded':'true','aria-controls':this.uid+'-results'}});
  const info=this.contentEl.createDiv({cls:'igf-info'});
  this.status=info.createEl('button',{cls:'igf-scope',text:'Notes and PDFs',attr:{'aria-haspopup':'menu',title:'Choose file types'}});
  this.status.onclick=e=>this.scopeMenu(e);this.count=info.createSpan({attr:{role:'status','aria-live':'polite'}});
  this.grid=this.contentEl.createDiv({cls:'igf-grid',attr:{id:this.uid+'-results',role:'listbox','aria-labelledby':this.uid+'-title',tabindex:'0'}});
  this.layer=this.grid.createDiv({cls:'igf-layer'});this.previews=new FinderPreviews(this.app,this.contentEl.ownerDocument);
  this.search.oninput=()=>{cancelAnimationFrame(this.queryFrame);this.queryFrame=requestAnimationFrame(()=>{this.queryFrame=0;this.apply();});};
  this.grid.onscroll=()=>{cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(()=>this.draw());};
  this.grid.oncontextmenu=e=>{if(e.target===this.grid||e.target===this.layer){e.preventDefault();this.scopeMenu(e);}};
  this.grid.onkeydown=e=>{const steps:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-this.layout.columns,ArrowDown:this.layout.columns};if(e.key in steps){e.preventDefault();e.stopPropagation();this.move(steps[e.key]);}};
  this.scope.register([], 'ArrowDown',()=>{if(this.contentEl.ownerDocument.activeElement===this.status)return;this.move(this.contentEl.ownerDocument.activeElement===this.grid?this.layout.columns:1);return false;});this.scope.register([], 'ArrowUp',()=>{if(this.contentEl.ownerDocument.activeElement===this.status)return;this.move(this.contentEl.ownerDocument.activeElement===this.grid?-this.layout.columns:-1);return false;});
  this.scope.register([], 'PageDown',()=>{this.move(Math.max(1,Math.floor(this.grid.clientHeight/this.layout.stride))*this.layout.columns);return false;});
  this.scope.register([], 'PageUp',()=>{this.move(-Math.max(1,Math.floor(this.grid.clientHeight/this.layout.stride))*this.layout.columns);return false;});
  this.scope.register([], 'Enter',()=>{if(this.contentEl.ownerDocument.activeElement===this.status)return;void this.openSelected('current');return false;});
  this.scope.register(['Mod'], 'Enter',()=>{void this.openSelected('tab');return false;});
  this.scope.register(['Mod','Alt'], 'Enter',()=>{void this.openSelected('split');return false;});
  this.scope.register(['Mod','Alt','Shift'], 'Enter',()=>{void this.openSelected('window');return false;});
  this.scope.register(['Mod','Shift'],'i',()=>{this.setScope(this.filter==='images'?'documents':'images');return false;});
  this.scope.register(['Mod','Shift'],'a',()=>{this.setScope(this.filter==='all'?'documents':'all');return false;});
  this.scope.register(['Mod'],'=',()=>{this.zoom(10);return false;});this.scope.register(['Mod','Shift'],'=',()=>{this.zoom(10);return false;});
  this.scope.register(['Mod'],'-',()=>{this.zoom(-10);return false;});this.scope.register(['Mod'],'0',()=>{this.zoom(100-this.size);return false;});
  this.owner.registerDomEvent(this.grid,'wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?this.grid.clientHeight:1);this.zoom(this.size*(Math.exp(-Math.max(-100,Math.min(100,pixels))*.005)-1));}}, {passive:false});
  this.resize=new ResizeObserver(()=>{this.measure();this.draw();});this.resize.observe(this.grid);
  const update=()=>{clearTimeout(this.timer);this.timer=setTimeout(()=>{this.index();this.apply(true);},100);};
  this.owner.registerEvent(this.app.vault.on('create',update));this.owner.registerEvent(this.app.vault.on('delete',update));this.owner.registerEvent(this.app.vault.on('rename',update));
  this.owner.registerEvent(this.app.metadataCache.on('changed',update));
  this.index();this.apply();this.search.focus();
 }
 private index(){const recent=new Map(this.app.workspace.getLastOpenFiles().map((p,i)=>[p,i]));this.entries=this.app.vault.getFiles().map(f=>({path:f.path,name:f.basename,folder:f.parent?.path==='/'?'':f.path.slice(0,f.path.lastIndexOf('/')+1),extension:f.extension.toLowerCase(),mtime:f.stat.mtime,recent:recent.get(f.path)??Number.MAX_SAFE_INTEGER,aliases:f.extension.toLowerCase()==='md'?(parseFrontMatterAliases(this.app.metadataCache.getFileCache(f)?.frontmatter)??[]):[]}));this.paths=folderLabels(this.entries);}
 private apply(retain=false){
  if(this.closed)return;
  const ticket=++this.searchTicket,scroll=this.grid.scrollTop,path=retain?this.matches[this.selected]?.entry.path:null;
  const query=finderQuery(this.search.value),scope=this.filter,fuzzy=query.text?prepareFuzzySearch(query.text):null;
  const finish=(matches:FinderMatch[])=>{
   if(this.closed||ticket!==this.searchTicket)return;
   this.matches=matches;this.selected=path?Math.max(0,this.matches.findIndex(m=>m.entry.path===path)):0;
   this.status.textContent=query.extensions.length?query.extensions.map(e=>'.'+e).join(', '):{documents:'Notes and PDFs',images:'Images',all:'All files'}[scope];
   this.count.textContent=this.matches.length.toLocaleString()+' result'+(this.matches.length===1?'':'s');this.grid.removeAttribute('aria-busy');
   this.revision++;for(const card of this.cards.values())card.remove();this.cards.clear();this.measure();this.grid.scrollTop=retain?scroll:0;this.draw();
  };
  const entries=this.entries.filter(e=>inScope(e,scope,query.extensions));
  if(entries.length<=6000){this.pendingSearch=null;finish(rankFiles(entries,scope,query.extensions,query.text,fuzzy));return;}
  this.grid.setAttribute('aria-busy','true');this.count.textContent='Searching…';
  const work=async()=>{const result:FinderMatch[]=[];let sliceStart=performance.now();for(let start=0;start<entries.length;start+=500){if(this.closed||ticket!==this.searchTicket)return;result.push(...rankFiles(entries.slice(start,start+500),scope,query.extensions,query.text,fuzzy));if(performance.now()-sliceStart>=8){const scheduler=(globalThis as any).scheduler;if(scheduler?.yield)await scheduler.yield();else await new Promise<void>(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=()=>{ch.port1.close();ch.port2.close();resolve();};ch.port2.postMessage(null);});sliceStart=performance.now();}}if(this.closed||ticket!==this.searchTicket)return;result.sort(compareMatches);finish(result);};
  const task=work().finally(()=>{if(this.pendingSearch===task)this.pendingSearch=null;});this.pendingSearch=task;
 }
 private measure(){this.layout=finderLayout(Math.max(1,this.grid.clientWidth-8),this.size);this.grid.toggleClass('igf-compact',this.layout.compact);this.layer.style.height=Math.ceil(this.matches.length/this.layout.columns)*this.layout.stride+'px';}
 private draw(){
  if(this.closed)return;const {columns,stride,height,cardWidth}=this.layout;
  const first=Math.max(0,Math.floor(this.grid.scrollTop/stride)-1)*columns;
  const last=Math.min(this.matches.length,(Math.ceil((this.grid.scrollTop+this.grid.clientHeight)/stride)+1)*columns);
  const paths=new Set(this.matches.slice(first,last).map(m=>m.entry.path));this.previews.prioritize(paths);
  for(const [path,card] of this.cards){if(!paths.has(path)){card.remove();this.cards.delete(path);}}
  for(let i=first;i<last;i++){
   const match=this.matches[i],e=match.entry;let card=this.cards.get(e.path);
   if(!card){card=this.makeCard(match,i);this.cards.set(e.path,card);this.layer.append(card);}
   card.style.width=cardWidth+'px';card.style.height=height+'px';card.style.left=(i%columns)*(cardWidth+14)+'px';card.style.top=Math.floor(i/columns)*stride+'px';
   card.style.setProperty('--igf-page-scale',String((this.layout.compact?64:cardWidth-20)/640));
   card.toggleClass('is-selected',i===this.selected);card.setAttribute('aria-selected',String(i===this.selected));
  }
  this.search.setAttribute('aria-activedescendant',this.cards.has(this.matches[this.selected]?.entry.path)?this.uid+'-'+this.selected:'');
  let empty=this.layer.querySelector('.igf-empty');if(!this.matches.length&&!empty)this.layer.createDiv({cls:'igf-empty',text:'No matching files. Change the file type or try another search.'});else if(this.matches.length)empty?.remove();
 }
 private makeCard(match:FinderMatch,index:number){
  const e=match.entry,card=this.contentEl.ownerDocument.createElement('div');card.className='igf-card';card.id=this.uid+'-'+index;
  card.setAttribute('role','option');card.setAttribute('aria-labelledby',card.id+'-name '+card.id+'-type '+card.id+'-fullpath');card.setAttribute('aria-posinset',String(index+1));card.setAttribute('aria-setsize',String(this.matches.length));
  const preview=card.createDiv({cls:'igf-thumbnail',attr:{'aria-hidden':'true'}});preview.setAttribute('inert','');
  const text=card.createDiv({cls:'igf-text'});const name=text.createDiv({cls:'igf-name',attr:{id:card.id+'-name',title:e.name}});renderMatches(name,e.name,match.nameRanges);
  if(match.alias){const alias=text.createDiv({cls:'igf-alias'});alias.appendText('Alias: ');renderMatches(alias,match.alias,match.aliasRanges??[]);}
  const meta=text.createDiv({cls:'igf-meta'});meta.createSpan({cls:'igf-type igf-type-'+e.extension,text:e.extension.toUpperCase()||'FILE',attr:{id:card.id+'-type'}});
  const path=meta.createDiv({cls:'igf-path',attr:{id:card.id+'-path',title:e.path}});
  // Full folder text remains accessible and available on hover, while CSS limits its footprint.
  if(match.pathRanges.length)renderMatches(path,e.folder,match.pathRanges.map(([a,b])=>[a,Math.min(b,e.folder.length)] as [number,number]).filter(([a,b])=>b>a));else {
   const label=this.paths.get(e.path)??e.folder,parts=label.split('/').filter(Boolean);if(parts[0]==='…'){path.createSpan({text:'…/',cls:'igf-path-prefix'});parts.shift();}
   path.createSpan({cls:'igf-branch',text:parts.shift()??'Vault root'});
   if(parts.length)path.createSpan({cls:'igf-path-tail',text:' / '+parts.join(' / ')});
  }
  card.createSpan({cls:'igf-sr-only',text:e.path,attr:{id:card.id+'-fullpath'}});
  card.onclick=ev=>{void this.openPath(e.path,ev.metaKey||ev.ctrlKey?'tab':'current');};
  card.oncontextmenu=ev=>{ev.preventDefault();ev.stopPropagation();this.selected=index;this.draw();this.fileMenu(ev,e.path);};
  const file=this.app.vault.getAbstractFileByPath(e.path),revision=this.revision;
  if(file instanceof TFile)void this.previews.get(file).then(result=>{if(this.closed||revision!==this.revision||!card.isConnected)return;if(result)preview.replaceChildren(result.el);else preview.textContent=e.extension.toUpperCase();});
  return card;
 }
 private move(delta:number){if(!this.matches.length)return;this.selected=Math.max(0,Math.min(this.matches.length-1,this.selected+delta));const top=Math.floor(this.selected/this.layout.columns)*this.layout.stride;if(top<this.grid.scrollTop)this.grid.scrollTop=top;else if(top+this.layout.height>this.grid.scrollTop+this.grid.clientHeight)this.grid.scrollTop=top+this.layout.height-this.grid.clientHeight;this.draw();}
 private async openSelected(target:Target){if(this.queryFrame){cancelAnimationFrame(this.queryFrame);this.queryFrame=0;this.apply();}while(this.pendingSearch)await this.pendingSearch;if(this.closed)return;const entry=this.matches[this.selected]?.entry;if(entry)await this.openPath(entry.path,target);}
 private async openPath(path:string,target:Target){if(this.closed)return;const file=this.app.vault.getAbstractFileByPath(path);if(!(file instanceof TFile)){new Notice('This file has moved. Search again.');this.index();this.apply();return;}this.close();try{await this.app.workspace.getLeaf(target==='current'?false:target).openFile(file);}catch(error){new Notice('Could not open file: '+String(error));}}
 private setScope(scope:FinderScope){this.filter=scope;this.search.value=finderQuery(this.search.value).text;this.apply();this.search.focus();}
 private zoom(delta:number){const old=this.layout.stride,anchor=Math.floor(this.grid.scrollTop/old)*this.layout.columns;this.size=Math.max(60,Math.min(200,this.size+delta));this.measure();this.grid.scrollTop=Math.floor(anchor/this.layout.columns)*this.layout.stride;this.draw();}
 private addScope(menu:Menu){
  for(const [scope,label] of [['documents','Notes and PDFs'],['images','Images'],['all','All file types']] as const)menu.addItem(item=>item.setTitle(label).setChecked(this.filter===scope&&!finderQuery(this.search.value).extensions.length).onClick(()=>this.setScope(scope)));
  menu.addSeparator();menu.addItem(i=>i.setTitle('Reset gallery size').onClick(()=>this.sizing?.reset()));
  const mod=Platform.isMacOS?'⌘':'Ctrl';menu.addSeparator();menu.addItem(i=>i.setTitle(`Larger thumbnails (${mod} +)`).onClick(()=>this.zoom(10)));menu.addItem(i=>i.setTitle(`Smaller thumbnails (${mod} −)`).onClick(()=>this.zoom(-10)));menu.addItem(i=>i.setTitle(`Reset thumbnail size (${mod} 0)`).onClick(()=>this.zoom(100-this.size)));
 }
 private scopeMenu(event:MouseEvent){this.menu?.hide();this.menu=new Menu();this.addScope(this.menu);if(event.detail===0){const r=this.status.getBoundingClientRect();this.menu.showAtPosition({x:r.left,y:r.bottom});}else this.menu.showAtMouseEvent(event);}
 private fileMenu(event:MouseEvent,path:string){this.menu?.hide();const menu=this.menu=new Menu();for(const [target,label] of [['current','Open'],['tab','Open in new tab'],['split','Open to the right'],['window','Open in new window']] as const)menu.addItem(i=>i.setTitle(label).onClick(()=>void this.openPath(path,target)));const file=this.app.vault.getAbstractFileByPath(path);if(file instanceof TFile){menu.addSeparator();menu.addItem(i=>i.setTitle('Copy path').onClick(()=>void navigator.clipboard.writeText(file.path)));this.app.workspace.trigger('file-menu',menu,file,'file-finder');}menu.addSeparator();this.addScope(menu);menu.showAtMouseEvent(event);}
 focusSearch(){this.search.focus();this.search.select();}
 onClose(){this.searchTicket++;this.saveSize(Math.round(this.size));this.closed=true;this.menu?.hide();clearTimeout(this.timer);cancelAnimationFrame(this.frame);cancelAnimationFrame(this.queryFrame);this.resize?.disconnect();this.owner.unload();this.previews?.close();this.contentEl.empty();}
}
