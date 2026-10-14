import {Modal, Menu, Notice, Setting} from 'obsidian';
import type CodeLinks from './main';
import {canonical, groupItems, linkLabel} from './link-syntax';
function inPresentation(modal:Modal){const container=modal.modalEl.parentElement;const full=modal.modalEl.ownerDocument.fullscreenElement;if(full&&container){full.append(container);container.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();modal.close();}});}}
export type Writer=((old:string,value:string)=>Promise<void>)|null;
export class LinkSupport{
 cache=new Map<string,{time:number,value:any}>();pending=new Map<string,((v:any)=>void)[]>();timer?:ReturnType<typeof setTimeout>;
 constructor(private plugin:CodeLinks){}
 inspect(raw:string):Promise<any>{raw=canonical(raw);const old=this.cache.get(raw);if(old&&Date.now()-old.time<1500)return Promise.resolve(old.value);
  return new Promise(resolve=>{const list=this.pending.get(raw)||[];list.push(resolve);this.pending.set(raw,list);if(!this.timer)this.timer=setTimeout(()=>void this.flush(),30);});
 }
 async flush(){this.timer=undefined;const batch=this.pending;this.pending=new Map();try{const result=await this.plugin.call('inspect-many',{raws:[...batch.keys()]});for(const [raw,list] of batch){const value=result[raw]??{error:'Too many links; reopen this note'};this.cache.set(raw,{time:Date.now(),value});list.forEach(f=>f(value));}}catch(e){for(const list of batch.values())list.forEach(f=>f({error:String(e)}));}}
 dispose(){if(this.timer)clearTimeout(this.timer);for(const list of this.pending.values())list.forEach(f=>f({error:'Plugin unloaded'}));this.pending.clear();}
 async activate(raw:string){try{
  if(raw.startsWith('{{links:')){new ReferenceModal(this.plugin,raw,'').open();return;}
  const info=await this.plugin.call('inspect',{raw:canonical(raw)});
  if(!info.exists){if(!info.creatable)throw Error('Target is unavailable; no file was created');await this.plugin.call('create',{raw:canonical(raw)});this.cache.clear();this.plugin.lastIndex=0;this.refreshLinks();}
  await this.plugin.launch(canonical(raw));
 }catch(e){new Notice(String(e));}}
 refreshLinks(){for(const el of Array.from(document.querySelectorAll<HTMLElement>('.code-links-target[data-raw]')))void this.paint(el,el.dataset.raw!);}
 async paint(el:HTMLElement,raw:string){if(raw.startsWith('{{links:')){el.classList.add('code-links-group');el.title='Open references';return;}
  const target=canonical(raw).replace(/^!?\{\{/,'').split(/[|#}]/)[0];
  el.classList.add(target.startsWith('dir:')?'code-links-directory':/\.(tsv|csv)$/i.test(target)?'code-links-data':'code-links-code-link');
  const info=await this.inspect(raw);el.classList.toggle('code-links-missing',!info.exists&&!info.error);el.classList.toggle('code-links-invalid',!!info.error);
  el.title=info.error||info.path+(info.exists?'':info.creatable?' · Click to create; right-click to choose folder':' · Unavailable');
 }
 element(raw:string,source:string,writer:Writer,doc:Document=document){const a=doc.createElement('a');a.className='code-links-target';a.textContent=linkLabel(raw);a.dataset.raw=raw;a.tabIndex=0;a.setAttribute('role','link');
  a.onclick=e=>{e.preventDefault();e.stopPropagation();if(raw.startsWith('{{links:'))new ReferenceModal(this.plugin,raw,source).open();else void this.activate(raw);};a.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(raw.startsWith('{{links:'))new ReferenceModal(this.plugin,raw,source).open();else void this.activate(raw);}};
  a.oncontextmenu=e=>void this.menu(e,raw,source,writer);a.onmouseenter=()=>void this.paint(a,raw);void this.paint(a,raw);return a;
 }
 async menu(e:MouseEvent,raw:string,source:string,writer:Writer){e.preventDefault();e.stopPropagation();
  if(raw.startsWith('{{links:')){const menu=new Menu();menu.addItem(i=>i.setTitle('Open references').onClick(()=>new ReferenceModal(this.plugin,raw,source).open()));if(writer){menu.addItem(i=>i.setTitle('Edit reference group…').onClick(()=>new GroupEditor(this.plugin,raw,v=>writer(raw,v),true).open()));menu.addItem(i=>i.setTitle('Ungroup references').onClick(async()=>{try{await writer(raw,groupItems(raw)!.items.join(' · '));}catch(e){new Notice(String(e));}}));}menu.addItem(i=>i.setTitle('Copy link source').onClick(()=>navigator.clipboard.writeText(raw)));menu.showAtMouseEvent(e);return;}
  try{const info=await this.plugin.call('inspect',{raw:canonical(raw)});
   if(info.directory){await this.plugin.launch(canonical(raw),undefined,'current','finder');return;}
   if(!info.exists&&info.creatable){new CreateModal(this.plugin,raw,writer).open();return;}
   this.plugin.linkMenu(e,canonical(raw),source,writer);
  }catch(err){new Notice(String(err));}
 }
}
class ReferenceModal extends Modal{
 constructor(private plugin:CodeLinks,private raw:string,private source:string){super(plugin.app);}
 onOpen(){inPresentation(this);try{const group=groupItems(this.raw)!;this.titleEl.setText(group.label);this.modalEl.classList.add('code-links-references');
  this.contentEl.createEl('button',{text:'Close references'}).onclick=()=>this.close();
  for(const raw of group.items){const row=this.contentEl.createDiv('code-links-reference-row');
   if(raw.startsWith('{{'))row.append(this.plugin.links.element(raw,this.source,null));
   else if(raw.startsWith('[[')){const [target,label]=raw.slice(2,-2).split('|');const a=row.createEl('a',{text:label||target,cls:'internal-link'});a.title=target;a.onclick=()=>void this.plugin.app.workspace.openLinkText(target,this.source,true);}
   else {const match=raw.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);const url=match?match[2]:raw;row.createEl('a',{text:match?match[1]:url,href:url,attr:{target:'_blank',rel:'noopener'}});}
  }
 }catch(e){this.contentEl.setText(String(e));}}
 onClose(){this.contentEl.empty();}
}
class CreateModal extends Modal{
 constructor(private plugin:CodeLinks,private raw:string,private writer:Writer){super(plugin.app);}
 async onOpen(){inPresentation(this);this.titleEl.setText('Create linked file');const info=await this.plugin.call('inspect',{raw:canonical(this.raw)});if(!this.contentEl.isConnected)return;
  const target=canonical(this.raw).slice(2,-2).split('|')[0];const filename=target.split(/[/:]/).pop()!;let alias=target.includes(':')?target.split(':')[0]:'';let folder=target.includes('/')?target.slice(target.indexOf(':')+1).split('/').slice(0,-1).join('/'):alias?'':'scripts';
  const roots=await this.plugin.call('roots');const entries=roots.items.filter((r:any)=>!r.retired&&!r.redirect);const location=this.contentEl.createEl('p',{text:info.path});
  new Setting(this.contentEl).setName('Location').addDropdown(d=>{d.addOption('','This vault');for(const r of entries)d.addOption(r.name,r.name+':');d.setValue(alias).onChange(v=>{alias=v;folder='';location.setText((alias?alias+':':'')+filename);});});
  new Setting(this.contentEl).addButton(b=>b.setButtonText('Browse folders…').onClick(async()=>{try{
   const gallery=(this.plugin.app as any).plugins.getPlugin('image-gallery')?.api;
   if(!gallery?.pickFolder)throw Error('Enable the updated Image Gallery plugin to browse folders');
   const base=entries.find((r:any)=>r.name===alias)?.path;
   const picked=await gallery.pickFolder({label:alias?alias+':':'This vault',start:folder,base});if(picked!==null){folder=picked;location.setText((alias?alias+':':'')+(folder?folder+'/':'')+filename);}
  }catch(e){new Notice(String(e));}}));
  new Setting(this.contentEl).addButton(b=>b.setButtonText('Create and open').setCta().onClick(async()=>{b.setDisabled(true);try{
   const newTarget=(alias?alias+':':'')+(folder?folder+'/':'./')+filename;const label=canonical(this.raw).match(/\|([^}]+)\}\}/)?.[1];const next='{{'+newTarget+(label?'|'+label:'')+'}}';
   if(!this.writer&&next!==canonical(this.raw))throw Error('Edit the note or slide to save a different link location');
   if(this.writer&&next!==this.raw)await this.writer(this.raw,next);
   await this.plugin.call('create',{raw:next});this.plugin.links.cache.clear();this.plugin.lastIndex=0;await this.plugin.launch(next);this.close();
  }catch(e){new Notice(String(e));b.setDisabled(false);}}));
 }
 onClose(){this.contentEl.empty();}
}

export class GroupEditor extends Modal{
 constructor(private plugin:CodeLinks,private text:string,private save:(value:string)=>Promise<void>,private group=false){super(plugin.app);}
 onOpen(){inPresentation(this);this.titleEl.setText(this.group?'Edit reference group':'Combine selected links');let label='References',body=this.text;
  if(this.group){const g=groupItems(this.text)!;label=g.label;body=g.items.join('; ');}
  new Setting(this.contentEl).setName('Display label').addText(t=>t.setValue(label).onChange(v=>label=v));
  let input:HTMLTextAreaElement;
  new Setting(this.contentEl).setName('References').setDesc('Code links, [[notes or PDFs]], and web links. Separate them with semicolons.').addTextArea(t=>{t.setValue(body).onChange(v=>body=v);input=t.inputEl;t.inputEl.rows=8;t.inputEl.style.width='100%';});
  new Setting(this.contentEl).addButton(b=>b.setButtonText('Add from gallery…').onClick(async()=>{try{const gallery=(this.plugin.app as any).plugins.getPlugin('image-gallery')?.api;if(!gallery?.pickFile)throw Error('Enable Image Gallery first');const file=await gallery.pickFile({title:'Add a reference'});if(file){body+=(body.trim()?'; ':'')+file.link;input.value=body;}}catch(e){new Notice(String(e));}}));
  const preview=this.contentEl.createDiv('code-links-group-preview');
  new Setting(this.contentEl).addButton(b=>b.setButtonText('Preview references').onClick(()=>{preview.empty();try{const g=groupItems('{{links:'+label+'|'+body+'}}')!;for(const raw of g.items)preview.createEl('p',{text:raw});}catch(e){preview.setText(String(e));}}))
  .addButton(b=>b.setButtonText('Save group').setCta().onClick(async()=>{try{if(/[|{}\n]/.test(label))throw Error('Use a plain label without pipes or braces');const value='{{links:'+label+'|'+body.trim()+'}}';groupItems(value);await this.save(value);this.close();}catch(e){new Notice(String(e));}}));
 }
 onClose(){this.contentEl.empty();}
}
