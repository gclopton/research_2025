import {menuGroup} from './menu-groups';
import {App,Component,MarkdownRenderChild,MarkdownRenderer,Menu,Notice,Plugin,TFile,MarkdownView} from 'obsidian';
import {Scientific,Kind,parseScientific,scientificBlocks,scientificNumbers,scientificSource,newScientific} from './scientific-core';
import {ScientificEditor} from './scientific-editor';
import {scientificIndex} from './scientific-index';
export interface ScientificHost {numbers:Map<string,string>;edit?:(old:string,next:string)=>Promise<void>}
export function scientificHost(el:HTMLElement,host:ScientificHost){el.dataset.scientificHost='true';(el as any).scientificHost=host;}
const imageDimensions=new Map<string,{width:number;height:number}>();
class ScientificPanel extends MarkdownRenderChild {
 private root!:HTMLElement;private labels:HTMLElement[]=[];private host?:ScientificHost;private alive=false;
 private generation=0;private numberSequence=0;private renderOwner?:Component;
 constructor(private app:App,el:HTMLElement,private value:Scientific,private source:string,private path:string){super(el);}
 onload(){this.alive=true;this.host=(this.containerEl.closest('[data-scientific-host]') as any)?.scientificHost;
  void this.draw().catch(error=>{if(this.alive){console.error('Scientific figure render',error);if(!this.root)this.containerEl.createEl('p',{text:'Could not render '+this.value.kind+': '+String(error)});}});
  if(!this.host){this.registerEvent(this.app.vault.on('modify',f=>{if(f.path===this.path)void this.number().catch(console.error);}));this.registerEvent(this.app.vault.on('rename',(file,old)=>{if(this.path===old||this.path.startsWith(old+'/')){this.path=file.path+this.path.slice(old.length);void this.number().catch(console.error);}}));}
 }
 onunload(){this.alive=false;this.generation++;this.numberSequence++;}
 private async numbers(){if(this.host)return this.host.numbers;const file=this.app.vault.getAbstractFileByPath(this.path);if(file instanceof TFile)return (await scientificIndex(this.app).read(this.path,()=>this.app.vault.cachedRead(file))).numbers;}
 private label(labels:HTMLElement[],numbers?:Map<string,string>){const n=numbers?.get(this.value.id);labels.forEach((el,i)=>{const text=i?this.value.numbered&&n?n+String.fromCharCode(96+i):String.fromCharCode(96+i):(this.value.numbered?`${this.value.kind==='figure'?'Figure':'Table'} ${n||'…'}${this.value.title||(this.value.captionVisible&&this.value.caption)?': ':''}`:'');if(el.textContent!==text)el.textContent=text;});}
 private async number(){const seq=++this.numberSequence,numbers=await this.numbers();if(this.alive&&seq===this.numberSequence)this.label(this.labels,numbers);}
 private async draw(){
  const v=this.value,generation=++this.generation,owner=this.addChild(new Component()),labels:HTMLElement[]=[];
  const next=this.containerEl.ownerDocument.createElement('figure');next.className=`ss-scientific ss-scientific-${v.kind} ss-caption-${v.captionPosition}`;next.dataset.scientificId=v.id;next.setAttribute('aria-label',v.title||v.caption||v.kind);
  const cancelled=()=>!this.alive||generation!==this.generation;
  const render=async(text:string,target:HTMLElement)=>{if(cancelled())throw cancelled;await MarkdownRenderer.render(this.app,text,target,this.path,owner);if(cancelled())throw cancelled;};
  try{
   const caption=next.createEl('figcaption');
   if(v.title)await render(v.title,caption.createDiv({cls:'ss-scientific-title'}));
   if(v.captionVisible&&v.caption)await render(v.caption,caption.createDiv({cls:'ss-scientific-caption'}));
   const label=caption.ownerDocument.createElement('strong');label.className='ss-scientific-label';const first=caption.firstElementChild,paragraph=first?.firstElementChild?.tagName==='P'?first.firstElementChild:first;(paragraph??caption).prepend(label);labels.push(label);
   if(!v.numbered&&!v.title&&(!v.captionVisible||!v.caption))caption.hidden=true;
   const body=next.createDiv({cls:'ss-scientific-content'}),sizes=new Map<HTMLImageElement,(width:number,height:number)=>void>();
   if(v.kind==='figure'){
    const grid=body.createDiv({cls:'ss-figure-grid'});grid.style.setProperty('--figure-columns',String(Math.min(v.columns,Math.max(1,v.panels.length))));
    for(let i=0;i<v.panels.length;i++){
     const p=v.panels[i],panel=grid.createDiv({cls:'ss-figure-panel'}),frame=panel.createDiv({cls:'ss-figure-image'}),file=this.app.metadataCache.getFirstLinkpathDest(p.path,this.path);
     if(file){
      const src=this.app.vault.getResourcePath(file),img=frame.createEl('img',{attr:{alt:p.caption||p.path.split('/').pop()||'Figure',decoding:'async',loading:'lazy'}});
      const size=(width:number,height:number)=>{if(!width||!height)return;const crop=p.crop??[0,0,1,1];frame.style.aspectRatio=String(width*crop[2]/(height*crop[3]));if(p.crop){const [x,y,w,h]=p.crop;Object.assign(img.style,{position:'absolute',width:100/w+'%',maxWidth:'none',height:'auto',left:-100*x/w+'%',top:-100*y/h+'%'});}};
      sizes.set(img,size);img.dataset.scientificImageKey=JSON.stringify([src,p.crop??null]);
      const cached=imageDimensions.get(src);if(cached){size(cached.width,cached.height);imageDimensions.delete(src);imageDimensions.set(src,cached);}
      const loaded=()=>{if(!img.naturalWidth)return;size(img.naturalWidth,img.naturalHeight);imageDimensions.delete(src);imageDimensions.set(src,{width:img.naturalWidth,height:img.naturalHeight});if(imageDimensions.size>1024)imageDimensions.delete(imageDimensions.keys().next().value!);};
      img.onload=loaded;img.src=src;if(img.complete)loaded();owner.register(()=>img.onload=null);
     }else frame.setText('Image unavailable: '+p.path);
     if(v.panels.length>1)labels.push(panel.createEl('span',{cls:'ss-panel-label'}));
     if(p.caption)await render(p.caption,panel.createDiv({cls:'ss-panel-caption'}));
    }
   }else{
    const wrap=body.createDiv({cls:'ss-scientific-table-scroll'}),table=wrap.createEl('table',{cls:'ss-scientific-table ss-table-'+v.style}),head=table.createEl('thead'),tbody=table.createEl('tbody');
    for(let r=0;r<v.rows.length;r++){const tr=(r<v.headerRows?head:tbody).createEl('tr');for(let c=0;c<v.rows[r].length;c++){const cell=v.rows[r][c];if(!cell)continue;const header=r<v.headerRows||v.rowHeaders&&c===0,td=tr.createEl(header?'th':'td');td.rowSpan=cell.rowspan??1;td.colSpan=cell.colspan??1;if(header)td.setAttribute('scope',r<v.headerRows?(td.colSpan>1?'colgroup':'col'):(td.rowSpan>1?'rowgroup':'row'));td.style.textAlign=cell.align||'left';if(cell.background)td.style.setProperty('--ss-cell-background',`color-mix(in srgb,${cell.background} ${(cell.backgroundOpacity??.18)*100}%,transparent)`);await render(cell.text,td);}}
   }
   if(cancelled())throw cancelled;
   const numberSequence=this.numberSequence,numbers=await this.numbers();if(cancelled())throw cancelled;this.label(labels,numbers);
   next.tabIndex=0;
   const menu=(e:MouseEvent|KeyboardEvent)=>{if((e.target as HTMLElement).closest('a'))return;e.preventDefault();e.stopPropagation();const m=new Menu();m.addItem(i=>i.setTitle('Edit '+v.kind+'…').setIcon('pencil').setDisabled(!!this.host&&!this.host.edit).onClick(()=>this.edit()));if(next.ownerDocument.fullscreenElement)m.setParentElement(next.ownerDocument.fullscreenElement as HTMLElement);const rect=next.getBoundingClientRect();m.showAtPosition({x:'clientX'in e?e.clientX:rect.left+20,y:'clientY'in e?e.clientY:rect.top+20});};
   next.oncontextmenu=menu;next.onkeydown=e=>{if(e.shiftKey&&e.key==='F10')menu(e);};next.ondblclick=e=>{if((e.target as HTMLElement).closest('img,a'))return;if(!this.host||this.host.edit){e.preventDefault();e.stopPropagation();this.edit();}};
   const reusable=Array.from(this.root?.querySelectorAll<HTMLImageElement>('img[data-scientific-image-key]')??[]);
   next.querySelectorAll<HTMLImageElement>('img[data-scientific-image-key]').forEach(img=>{const at=reusable.findIndex(old=>old.complete&&old.naturalWidth>0&&old.dataset.scientificImageKey===img.dataset.scientificImageKey);if(at>=0){const old=reusable.splice(at,1)[0];sizes.get(img)?.(old.naturalWidth,old.naturalHeight);img.replaceWith(old);}});
   const previous=this.renderOwner;this.containerEl.replaceChildren(next);this.root=next;this.labels=labels;this.renderOwner=owner;if(previous)this.removeChild(previous);if(numberSequence!==this.numberSequence)await this.number();
  }catch(error){this.removeChild(owner);if(error!==cancelled)throw error;}
 }
 private edit(){new ScientificEditor(this.app,this.value,value=>this.save(value),this.path).open();}
 private async save(value:Scientific){
  const original=scientificSource(this.value),next=scientificSource(value);if(this.host){if(!this.host.edit)throw Error('Enter slide editing to change this object.');await this.host.edit(original,next);return;}
  const file=this.app.vault.getAbstractFileByPath(this.path);if(!(file instanceof TFile))throw Error('Source note unavailable.');
  await this.app.vault.process(file,raw=>{const matches=scientificBlocks(raw).filter(b=>b.value.id===value.id);if(matches.length!==1)throw Error('Object identity is missing or duplicated. Reopen the source to repair it.');const match=matches[0];if(scientificSource(match.value)!==original)throw Error('This object changed while editing. Reopen its editor.');return raw.slice(0,match.from)+next+raw.slice(match.to);});
 }
}
export function registerScientific(plugin:Plugin){const index=scientificIndex(plugin.app);plugin.registerEvent(plugin.app.vault.on('modify',f=>index.invalidate(f.path)));plugin.registerEvent(plugin.app.vault.on('rename',(f,old)=>{index.invalidate(old);index.invalidate(f.path);}));plugin.registerEvent(plugin.app.vault.on('delete',f=>index.invalidate(f.path)));plugin.register(()=>index.clear());for(const kind of ['figure','table'] as const)plugin.registerMarkdownCodeBlockProcessor('scientific-'+kind,(source,el,ctx)=>{try{ctx.addChild(new ScientificPanel(plugin.app,el,parseScientific(kind,source),source,ctx.sourcePath));}catch(e){el.createEl('p',{text:'Could not render '+kind+': '+(e as Error).message});}});
 plugin.registerEvent(plugin.app.workspace.on('editor-menu',(rootMenu,editor,info)=>{if(!info.file)return;const menu=menuGroup(rootMenu,'insert','Embed or link','plus');const offset=editor.posToOffset(editor.getCursor()),raw=editor.getValue(),existing=scientificBlocks(raw).find(b=>b.from<=offset&&b.to>=offset);for(const kind of ['figure','table'] as const)menu.addItem(i=>i.setTitle(existing?.value.kind===kind?'Edit '+kind+'…':kind.charAt(0).toUpperCase()+kind.slice(1)+'…').onClick(()=>{const block=existing?.value.kind===kind?existing:undefined;new ScientificEditor(plugin.app,block?.value??newScientific(kind),v=>{if(editor.getValue()!==raw)throw Error('The note changed while editing. Keep this draft open and copy any needed changes before reopening.');editor.replaceRange((block?'':'\n\n')+scientificSource(v)+(block?'':'\n\n'),editor.offsetToPos(block?.from??offset),editor.offsetToPos(block?.to??offset));},info.file!.path).open();}));}));
}
