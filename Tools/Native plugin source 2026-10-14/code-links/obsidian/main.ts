import {Plugin, Component, EditorSuggest, Editor, EditorPosition, EditorSuggestContext, EditorSuggestTriggerInfo, TFile, FileSystemAdapter, Notice, Menu, PluginSettingTab, Setting, MarkdownRenderChild, MarkdownView, Modal, MarkdownRenderer, editorInfoField, editorLivePreviewField} from 'obsidian';
import {spawn, ChildProcessWithoutNullStreams} from 'child_process';
import {homedir} from 'os';
import {watchFile, unwatchFile} from 'fs';
import {join,dirname} from 'path';
import {readFile} from 'fs/promises';
import {EditorState, RangeSetBuilder} from '@codemirror/state';
import {EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType, lineNumbers, MatchDecorator} from '@codemirror/view';
import {syntaxHighlighting, HighlightStyle, syntaxTree} from '@codemirror/language';
import {tags} from '@lezer/highlight';
import {python} from '@codemirror/lang-python';
import {cpp} from '@codemirror/lang-cpp';
import {javascript} from '@codemirror/lang-javascript';
import {codeLinkRegex, reservedTarget, linkTokens, canonical, linkLabel} from './link-syntax';
import {renderSourceLinks,protectLinkEmphasis} from './render-links';
import {LinkSupport,GroupEditor} from './extra-links';
type ReplaceLink = ((old: string, value: string) => Promise<void>) | null;

type Entry={target:string;label:string;code:boolean};
type Result={path:string;full:boolean;start:number;end:number;lines:string[];status:string;link:{height:number;label:string}};
const regex=codeLinkRegex;
const label=linkLabel;
function withHeight(raw:string,n:number){return raw.replace(/\{height=\d+\}$/,'')+`{height=${n}}`;}
const excerptHighlight=HighlightStyle.define([
 {tag:tags.keyword,color:'var(--code-keyword, #c792ea)'},
 {tag:tags.string,color:'var(--code-string, #a3be8c)'},
 {tag:tags.number,color:'var(--code-value, #d19a66)'},
 {tag:tags.comment,color:'var(--code-comment, #8796a5)',fontStyle:'italic'},
 {tag:tags.function(tags.variableName),color:'var(--code-function, #82aaff)'},
 {tag:tags.operator,color:'var(--code-operator, #89ddff)'},
 {tag:tags.typeName,color:'var(--code-property, #e5c07b)'}
]);
function language(path:string){
 if(/\.py$/.test(path))return python();
 if(/\.(c|cpp|cc|h|hpp)$/.test(path))return cpp();
 if(/\.[jt]sx?$/.test(path))return javascript({typescript:/\.tsx?$/.test(path),jsx:/x$/.test(path)});
 const matcher=new MatchDecorator({regexp:/\b(?:TOTAL|energy|delta|E-fermi|POSITION|FORCE|Iteration)\b|[+-]?\b\d+(?:\.\d*)?(?:[Ee][+-]?\d+)?/g,decoration:m=>Decoration.mark({class:/^[A-Za-z]/.test(m[0])?'code-links-keyword':'code-links-number'})});
 return ViewPlugin.fromClass(class{
  decorations:DecorationSet;
  constructor(view:EditorView){this.decorations=matcher.createDeco(view);}
  update(u:ViewUpdate){this.decorations=matcher.updateDeco(u,this.decorations);}
 },{decorations:v=>v.decorations});
}
class Reader extends MarkdownRenderChild {
 view?:EditorView;observer?:IntersectionObserver;active=true;watched?:string;watcher?:()=>void;
 constructor(el:HTMLElement,private plugin:CodeLinks,private raw:string,private source:string,private replaceLink:ReplaceLink=(old,value)=>plugin.replace(source,old,value)){super(el);}
 onload(){
  this.containerEl.addClass('code-links-panel');this.containerEl.setText('Loading excerpt…');
  this.observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){this.observer?.disconnect();void this.load();}},{rootMargin:'200px'});this.observer.observe(this.containerEl);
 }
 async load(){
  try{
   const r=await this.plugin.call('read',{raw:this.raw});if(!this.active)return;
   if(r.full)throw new Error('Embed needs a line range or tracked excerpt');
   if(this.watched&&this.watcher)unwatchFile(this.watched,this.watcher);
   this.view?.destroy();this.view=undefined;
   this.containerEl.empty();
   const header=this.containerEl.createDiv('code-links-header');
   const title=header.createEl('a',{text:label(this.raw),cls:'code-links-target'});title.onclick=()=>void this.plugin.launch(this.raw);
   header.createSpan({text:`${r.fragments.map((f:any)=>`${f.start}–${f.end}`).join(', ')} · ${r.status}`,cls:'code-links-status'});
   header.title=r.path;
   this.watched=r.path;this.watcher=()=>{if(this.active){header.addClass('code-links-stale');header.title='Source changed since preview. Right-click and refresh to verify.';const status=header.querySelector('.code-links-status');if(status)status.textContent='SOURCE CHANGED · refresh to verify';}};
   watchFile(r.path,{interval:2000,persistent:false},this.watcher);
   const body=this.containerEl.createDiv('code-links-code');
   body.style.height=`calc(${r.link.height} * var(--code-links-line-height, 19.5px) + 6px)`;
   this.view=new EditorView({parent:body,state:EditorState.create({doc:r.lines.join('\n'),extensions:[EditorState.readOnly.of(true),EditorView.editable.of(false),lineNumbers({formatNumber:n=>r.line_numbers[n-1]==null?'·':String(r.line_numbers[n-1])}),syntaxHighlighting(excerptHighlight),language(r.path),EditorView.theme({'&':{height:'100%',fontSize:'var(--code-links-font-size, 13px)'},'.cm-scroller':{overflow:'auto',fontFamily:'var(--font-monospace)'},'.cm-line':{lineHeight:'1.5em'},'.cm-gutters':{backgroundColor:'var(--background-secondary)',color:'var(--text-muted)'}})]})});
   this.containerEl.oncontextmenu=e=>{
    e.preventDefault();e.stopPropagation();const pos=this.view?.posAtCoords({x:e.clientX,y:e.clientY});
    const line=pos==null?r.start:r.line_numbers[this.view!.state.doc.lineAt(pos).number-1];
    const menu=new Menu();
    menu.addItem(i=>i.setTitle('Open excerpt in Neovim').onClick(()=>void this.plugin.launch(this.raw,undefined,'current','source')));
    if(line!=null)this.plugin.sourceMenu(menu,this.raw,line,r.signature);
    menu.addItem(i=>i.setTitle('Filter lines with regex…').onClick(()=>new FilterModal(this.plugin,this.raw,this.source,this.replaceLink).open()));
    menu.addItem(i=>i.setTitle('Copy excerpt link').onClick(()=>navigator.clipboard.writeText(this.raw.replace(/^!/,''))));
    menu.addItem(i=>i.setTitle('Refresh and verify source').onClick(()=>{void this.load();}));
    if(this.replaceLink)menu.addItem(i=>i.setTitle('Set visible height…').onClick(()=>new InputModal(this.plugin,'Visible lines (3–40)',String(r.link.height),async v=>{const n=Number(v);if(!Number.isInteger(n)||n<3||n>40)throw Error('Enter 3–40');await this.replaceLink!(this.raw,withHeight(this.raw,n));}).open()));
    if(this.replaceLink)menu.addItem(i=>i.setTitle('Change source range…').onClick(()=>new InputModal(this.plugin,'Replacement excerpt link',this.raw,async v=>{await this.plugin.call('read',{raw:v});await this.replaceLink!(this.raw,v);}).open()));
    menu.showAtMouseEvent(e);
   };
  }catch(e){if(this.active)this.containerEl.setText('Code Links: '+String(e));}
 }
 onunload(){this.active=false;this.observer?.disconnect();this.view?.destroy();if(this.watched&&this.watcher)unwatchFile(this.watched,this.watcher);}
}
class InputModal extends Modal{
 constructor(private plugin:CodeLinks,private titleText:string,private value:string,private done:(v:string)=>Promise<void>){super(plugin.app);}
 onOpen(){this.titleEl.setText(this.titleText);new Setting(this.contentEl).addText(t=>t.setValue(this.value).onChange(v=>this.value=v));new Setting(this.contentEl).addButton(b=>b.setButtonText('Apply').setCta().onClick(async()=>{try{await this.done(this.value);this.close();}catch(e){new Notice(String(e));}}));}
 onClose(){this.contentEl.empty();}
}
class FilterModal extends Modal{
 spec={pattern:'',before:0,after:0,occurrence:'all'};
 constructor(private plugin:CodeLinks,private raw:string,private source:string,private replaceLink:ReplaceLink=(old,value)=>plugin.replace(source,old,value)){super(plugin.app);}
 async onOpen(){
  this.titleEl.setText('Select source lines');
  try{this.spec=(await this.plugin.call('selection',{raw:this.raw})).spec;}catch(e){new Notice(String(e));}
  this.contentEl.createEl('p',{text:'Python regular expression, matched against individual lines. Context includes neighboring lines; the source file is never changed.'});
  new Setting(this.contentEl).setName('Pattern').addTextArea(t=>{t.setValue(this.spec.pattern).onChange(v=>this.spec.pattern=v);t.inputEl.rows=3;t.inputEl.style.width='100%';});
  new Setting(this.contentEl).setName('Matches').addDropdown(d=>d.addOptions({all:'All matches',first:'First match',last:'Last match'}).setValue(this.spec.occurrence).onChange(v=>this.spec.occurrence=v));
  for(const key of ['before','after'] as const)new Setting(this.contentEl).setName('Context lines '+key).addText(t=>t.setValue(String(this.spec[key])).onChange(v=>this.spec[key]=Number(v)));
  const preview=this.contentEl.createEl('pre');preview.style.maxHeight='350px';preview.style.overflow='auto';
  new Setting(this.contentEl).addButton(b=>b.setButtonText('Preview').onClick(async()=>{b.setDisabled(true);try{const r=await this.plugin.call('selection',{raw:this.raw,spec:this.spec});preview.textContent=r.lines.map((s:string,i:number)=>`${r.line_numbers[i]??'…'}  ${s}`).join('\n');}catch(e){preview.textContent=String(e);}finally{b.setDisabled(false);}}))
  .addButton(b=>b.setButtonText('Save selection').setDisabled(!this.replaceLink).setCta().onClick(async()=>{b.setDisabled(true);try{const r=await this.plugin.call('selection',{raw:this.raw,spec:this.spec,save:true});await this.replaceLink!(this.raw,r.new_link);this.close();}catch(e){new Notice(String(e));b.setDisabled(false);}}));
 }
 onClose(){this.contentEl.empty();}
}
class Suggest extends EditorSuggest<Entry>{
 constructor(private plugin:CodeLinks){super(plugin.app);}
 onTrigger(cursor:EditorPosition,editor:Editor,file:TFile|null):EditorSuggestTriggerInfo|null{
  const line=editor.getLine(cursor.line).slice(0,cursor.ch);const m=line.match(/\{\{([^{}|#]*)$/);
  if(!m||reservedTarget(m[1])||line.slice(0,m.index).includes('`'))return null;
  return {start:{line:cursor.line,ch:m.index!},end:cursor,query:m[1]};
 }
 async getSuggestions(context:EditorSuggestContext){
  await this.plugin.refresh();const q=context.query.toLowerCase();
  // Fuzzy subsequence, filenames ranked before long path-only matches. Bounded dropdown.
  const scored=this.plugin.files.filter(x=>x.code).map(x=>{const target=x.target.toLowerCase();let at=0,gaps=0;for(const ch of q){const next=target.indexOf(ch,at);if(next<0)return {x,score:Infinity};gaps+=next-at;at=next+1;}return {x,score:gaps+(x.label.toLowerCase().includes(q)?0:1000)};}).filter(x=>isFinite(x.score));
  return scored.sort((a,b)=>a.score-b.score).slice(0,60).map(x=>x.x);
 }
 renderSuggestion(item:Entry,el:HTMLElement){el.createDiv({text:item.label});el.createDiv({text:item.target,cls:'code-links-suggestion-path'});}
 selectSuggestion(item:Entry){if(!this.context)return;const {editor,start,end}=this.context;const suffix=editor.getLine(end.line).slice(end.ch,end.ch+2);editor.replaceRange('{{'+item.target+'}}',start,{line:end.line,ch:end.ch+(suffix==='}}'?2:0)});}
}
class LinkWidget extends WidgetType{
 child?:Reader;
 constructor(private plugin:CodeLinks,private raw:string,private source:string){super();}
 eq(other:LinkWidget){return this.raw===other.raw&&this.source===other.source;}
 toDOM(){
  if(this.raw.startsWith('!')){const el=document.createElement('span');const inner=document.createElement('span');el.append(inner);this.child=new Reader(inner,this.plugin,this.raw,this.source);this.plugin.addChild(this.child);return el;}
  return this.plugin.links.element(this.raw,this.source,(old,value)=>this.plugin.replace(this.source,old,value));
 }
 destroy(){if(this.child){this.plugin.removeChild(this.child);this.child=undefined;}}
 ignoreEvent(){return true;}
}
function live(plugin:CodeLinks){return ViewPlugin.fromClass(class{
 decorations:DecorationSet;
 constructor(view:EditorView){this.decorations=this.build(view);}
 update(u:ViewUpdate){if(u.docChanged||u.viewportChanged||u.selectionSet||u.startState.field(editorLivePreviewField,false)!==u.state.field(editorLivePreviewField,false))this.decorations=this.build(u.view);}
 build(view:EditorView){if(view.state.field(editorLivePreviewField,false)===false)return Decoration.none;const builder=new RangeSetBuilder<Decoration>();const source=view.state.field(editorInfoField,false)?.file?.path||'';
  for(const range of view.visibleRanges){const text=view.state.doc.sliceString(range.from,range.to);for(const m of linkTokens(text)){
   const from=range.from+m.index,to=from+m.raw.length;
   if(view.state.selection.ranges.some(s=>s.from<=to&&s.to>=from))continue;
   const node=syntaxTree(view.state).resolveInner(from,1);let blocked=false;for(let n:typeof node|null=node;n;n=n.parent){if(/codeblock|fenced|math/i.test(n.name)||(/inline-code/i.test(n.name)&&!m.raw.startsWith('``dir:'))){blocked=true;break;}}
   if(!blocked)builder.add(from,to,Decoration.replace({widget:new LinkWidget(plugin,m.raw,source)}));
  }}return builder.finish();
 }
},{decorations:v=>v.decorations});}
export default class CodeLinks extends Plugin{
 links=new LinkSupport(this);
 settings={python:'/opt/homebrew/bin/python3',core:join(homedir(),'Projects/code-links/core/code_links.py')};
 renameQueue:Promise<void>=Promise.resolve();
 files:Entry[]=[];lastIndex=0;indexing?:Promise<void>;jobs=new Set<ChildProcessWithoutNullStreams>();
 root(){const a=this.app.vault.adapter;if(!(a instanceof FileSystemAdapter))throw Error('Desktop filesystem vault required');return a.getBasePath();}
 async call(cmd:string,args:Record<string,unknown>={}):Promise<any>{
  return new Promise((resolve,reject)=>{
   const child=spawn(this.settings.python,[this.settings.core],{stdio:'pipe'});this.jobs.add(child);let stdout='',stderr='';let done=false;
   const finish=(err?:Error,value?:unknown)=>{if(done)return;done=true;clearTimeout(timer);this.jobs.delete(child);err?reject(err):resolve(value);};
   const timer=setTimeout(()=>{child.kill();finish(Error('Reader timed out; source was not opened'));},120000);
   child.stdout.on('data',d=>{stdout+=d;if(stdout.length>15_000_000){child.kill();finish(Error('Response too large'));}});child.stderr.on('data',d=>stderr+=d);
   child.on('error',e=>finish(e));child.on('close',()=>{try{const data=JSON.parse(stdout);if(!data.ok)throw Error(data.error);finish(undefined,data.result);}catch(e){finish(Error(String(e)+(stderr?' · '+stderr.slice(0,300):'')));}});
   child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify({cmd,root:this.root(),...args}));
  });
 }
 async refresh(force=false){if(!force&&Date.now()-this.lastIndex<30000)return;if(this.indexing)return this.indexing;
  this.indexing=this.call('index').then(r=>{this.files=r.items;this.lastIndex=Date.now();if(r.truncated)new Notice('Code Links index capped at 50,000 files; narrow configured roots');}).finally(()=>this.indexing=undefined);return this.indexing;
 }
 async launch(raw:string,source_line?:number,destination='current',action='auto',expected_signature?:number[]){try{await this.call('launch',{raw:canonical(raw),source_line,destination,action,expected_signature});}catch(e){new Notice(String(e));}}
 async replace(source:string,old:string,value:string){
  const file=this.app.vault.getAbstractFileByPath(source);if(!(file instanceof TFile))throw Error('Source note unavailable');
  await this.app.vault.process(file,text=>{if(text.split(old).length!==2)throw Error('Several identical links exist; edit this link in source mode');return text.replace(old,value);});
 }
 sourceMenu(menu:Menu,raw:string,line?:number,signature?:number[]){
  for(const [name,destination] of [['Open source at this line','current'],['Open source in vertical split','split'],['Open source in new tab','tab'],['Open source in new window','window']])
   menu.addItem(i=>i.setTitle(name).onClick(()=>void this.launch(raw,line,destination,'source',signature)));
  menu.addItem(i=>i.setTitle('Open containing folder in Neovim').onClick(()=>void this.launch(raw,undefined,'tab','folder')));
 }
 linkMenu(e:MouseEvent,raw:string,source:string,replaceLink:ReplaceLink=(old,value)=>this.replace(source,old,value)){e.preventDefault();e.stopPropagation();const menu=new Menu();
  const target=raw.replace(/^!?\{\{/,'').split(/[|#}]/)[0];
  const scene=/\.(vesta|blend|nb|wl|wls)$/i.test(target);
  const wolfram=/\.(nb|wl|wls|m)$/i.test(target);
  if(wolfram){menu.addItem(i=>i.setTitle('Open in Wolfram').onClick(()=>void this.launch(raw,undefined,'current','wolfram')));if(!/\.nb$/i.test(target))menu.addItem(i=>i.setTitle('Run Wolfram script in Terminal').onClick(()=>void this.launch(raw,undefined,'current','run')));if(!/\.nb$/i.test(target))this.sourceMenu(menu,raw);}
  if(!wolfram)menu.addItem(i=>i.setTitle(scene?'Open in '+(/\.blend$/i.test(target)?'Blender':'VESTA'):'Open in Neovim').onClick(()=>void this.launch(raw,undefined,'current',scene?'auto':'source')));
  if(!scene){
   this.sourceMenu(menu,raw);
   if(/(?:^|[/:])(POSCAR|CONTCAR)$|\.vasp$/i.test(target))menu.addItem(i=>i.setTitle('Open in VESTA').onClick(()=>void this.launch(raw,undefined,'current','vesta')));
   menu.addItem(i=>i.setTitle('Filter lines with regex…').onClick(()=>new FilterModal(this,raw,source,replaceLink).open()));
  }else if(!wolfram)menu.addItem(i=>i.setTitle('Open containing folder in Neovim').onClick(()=>void this.launch(raw,undefined,'tab','folder')));
  menu.addItem(i=>i.setTitle('Copy link').onClick(()=>navigator.clipboard.writeText(raw)));
  if(replaceLink&&/#L\d+/.test(raw))menu.addItem(i=>i.setTitle('Track this excerpt across line shifts').onClick(async()=>{try{const r=await this.call('anchor',{raw});await replaceLink!(raw,r.link);}catch(e){new Notice(String(e));}}));
  menu.showAtMouseEvent(e);
 }
 // Public bridge for custom Markdown views. A null writer keeps presentation
 // controls read-only; editing hosts own their model, undo and persistence.
 renderInHost(el:HTMLElement,markdown:string,source:string,owner:{addChild(child:MarkdownRenderChild):void},replaceLink:ReplaceLink=null){
  const doc=el.ownerDocument;
  for(const code of Array.from(el.querySelectorAll('code')))if(!code.closest('.code-links-panel'))code.oncontextmenu=e=>this.copyMenu(e,code.textContent||'');
  renderSourceLinks(el,markdown,raw=>{
   if(raw.startsWith('!')){
    const panel=doc.createElement('span');panel.className='code-links-panel';
    owner.addChild(new Reader(panel,this,raw,source,replaceLink));return panel;
   }
   return this.links.element(raw,source,replaceLink,doc);
  });
 }
 async ensureSavedNotes(){
  for(const leaf of this.app.workspace.getLeavesOfType("markdown")){const view=leaf.view;if(view instanceof MarkdownView&&view.file&&view.editor.getValue()!==await this.app.vault.read(view.file))throw Error("Save note edits before changing linked folders");}
 }
 async onload(){
  this.settings={...this.settings,...await this.loadData()};this.addSettingTab(new Settings(this));
  this.addCommand({id:'link-guide',name:'Syntax and actions',callback:()=>new GuideModal(this).open()});
  this.addCommand({id:'manage-folders',name:'Manage linked folders',callback:()=>new FolderManager(this).open()});
  this.addCommand({id:'combine-links',name:'Combine selected links…',editorCallback:ed=>this.combineLinks(ed)});
  this.registerEvent(this.app.workspace.on('editor-menu',(menu,ed)=>{if(ed.getSelection().trim())menu.addItem(i=>i.setTitle('Combine selected links…').onClick(()=>this.combineLinks(ed)));}));
  this.registerEditorSuggest(new Suggest(this));this.registerEditorExtension(live(this));
  this.registerEditorExtension(EditorView.domEventHandlers({contextmenu:(e,view)=>{
   if(!(e.target as HTMLElement).closest('.cm-inline-code'))return false;
   const pos=view.posAtCoords({x:e.clientX,y:e.clientY});if(pos==null)return false;
   let node=syntaxTree(view.state).resolveInner(pos,1);while(node.parent&&!/inline.?code/i.test(node.name))node=node.parent;
   if(!/inline.?code/i.test(node.name))return false;
   const value=view.state.doc.sliceString(node.from,node.to).replace(/^`+|`+$/g,'');
   this.copyMenu(e,value);return true;
  }}));
  this.registerDomEvent(document,'contextmenu',e=>{const code=(e.target as HTMLElement).closest('code');if(code&&!code.closest('.code-links-panel'))this.copyMenu(e,code.textContent||'');});
  this.registerMarkdownPostProcessor(async (el,ctx)=>{
   // Explicit hosts supply their own source and edit callback after rendering.
   if(el.closest('[data-code-links-host]'))return;
   const section=ctx.getSectionInfo(el);
   const text=section?section.text.split('\n').slice(section.lineStart,section.lineEnd+1).join('\n'):'';
   const protectedText=protectLinkEmphasis(text);
   if(protectedText!==text){
    // Reparse before restoring links, otherwise broken emphasis/math outside
    // the link would survive the DOM replacement. The guard prevents recursion.
    el.empty();
    // Obsidian reuses section elements as the note changes or is virtualized.
    // Guard only our owned child, never the reusable section itself.
    const host=el.createDiv({attr:{'data-code-links-host':'protected'}});
    const owner=new MarkdownRenderChild(host);ctx.addChild(owner);
    await MarkdownRenderer.render(this.app,protectedText,host,ctx.sourcePath,owner);
    this.renderInHost(host,text,ctx.sourcePath,owner,(old,value)=>this.replace(ctx.sourcePath,old,value));
    return;
   }
   this.renderInHost(el,text,ctx.sourcePath,ctx,(old,value)=>this.replace(ctx.sourcePath,old,value));
  });
  this.registerEvent(this.app.workspace.on('file-menu',(menu,file)=>{if(file instanceof TFile&&!['md','markdown'].includes(file.extension.toLowerCase())){const app=file.extension.toLowerCase()==='blend'?'Blender':file.extension.toLowerCase()==='vesta'?'VESTA':'Neovim';menu.addItem(i=>i.setTitle('Open in '+app).setIcon('code').onClick(()=>void this.launch('{{'+file.path+'}}',undefined,'current',/\.(csv|tsv)$/i.test(file.path)?'source':'auto')));}}));
  for(const name of ['create','delete'] as const)this.registerEvent(this.app.vault.on(name as 'create',()=>{this.lastIndex=0;}));
  this.registerEvent(this.app.vault.on('rename',(file,old)=>{
   this.lastIndex=0;if(!(file instanceof TFile)||['md','markdown'].includes(file.extension))return;
   this.renameQueue=this.renameQueue.then(async()=>{
    for(const leaf of this.app.workspace.getLeavesOfType('markdown')){
     const view=leaf.view;if(view instanceof MarkdownView&&view.file&&view.editor.getValue()!==await this.app.vault.read(view.file))throw Error('A note has unsaved edits; code-link rename repair deferred');
    }
    const result=await this.call('rename',{old,new:file.path,apply:true,moved:true});
    if(result.references.length||result.anchors)new Notice('Code Links updated references after rename');
   }).catch(e=>{new Notice(String(e));});
  }));
  this.addCommand({id:'refresh-index',name:'Refresh file index',callback:()=>void this.refresh(true).then(()=>new Notice('Code Links index refreshed')).catch(e=>new Notice(String(e)))});
  this.addCommand({id:'open-link',name:'Open code link under cursor',editorCallback:(ed)=>{const p=ed.getCursor();for(const m of linkTokens(ed.getLine(p.line)))if(p.ch>=m.index&&p.ch<=m.index+m.raw.length)void this.links.activate(m.raw);}});
  this.addCommand({id:'track-selected',name:'Track selected excerpt link',editorCallback:async ed=>{const raw=ed.getSelection();try{const r=await this.call('anchor',{raw});ed.replaceSelection(r.link);}catch(e){new Notice(String(e));}}});
  this.app.workspace.onLayoutReady(()=>void this.refresh().catch(e=>new Notice(String(e))));
 }
 combineLinks(ed:Editor){const text=ed.getSelection();if(!text.trim()){new Notice('Select the links to combine first');return;}const from=ed.getCursor('from'),to=ed.getCursor('to');new GroupEditor(this,text,async value=>{if(ed.getRange(from,to)!==text)throw Error('Selection changed; select the links again');ed.replaceRange((text.match(/^\s*/)?.[0]||'')+value+(text.match(/\s*$/)?.[0]||''),from,to);}).open();}
 copyMenu(e:MouseEvent,value:string){e.preventDefault();e.stopPropagation();const menu=new Menu();menu.addItem(i=>i.setTitle('Copy code').onClick(()=>navigator.clipboard.writeText(value)));menu.showAtMouseEvent(e);}
 onunload(){this.links.dispose();for(const child of this.jobs)child.kill();this.jobs.clear();}
}
class FolderManager extends Modal {
 items:{name:string;path:string;exists:boolean;inherited:boolean;retired?:boolean;redirect?:string}[]=[];
 query=''; list?:HTMLElement;
 constructor(private plugin:CodeLinks){super(plugin.app);}
 async onOpen(){
  this.titleEl.setText('Manage linked folders');
  this.contentEl.createEl('p',{text:'Aliases are shared with nav, Neovim and every vault on this Mac. A link such as {{bdm:run/OUTCAR|Results}} uses the same directory everywhere. Changes here update ~/utils/.nav/aliases.psv.'});
  new Setting(this.contentEl).setName('Find shortcut').addSearch(s=>s.setPlaceholder('Name or folder').onChange(q=>{this.query=q;this.draw();}));
  new Setting(this.contentEl).addButton(b=>b.setButtonText('Add linked folder').setCta().onClick(()=>this.edit()));
  this.list=this.contentEl.createDiv();await this.refresh();
 }
 async refresh(){try{const result=await this.plugin.call('roots');this.items=result.items;this.draw();
  if(Object.keys(result.legacy||{}).length)new Setting(this.list!).setName('Legacy aliases in this vault').setDesc('Import into nav. Conflicting names stop the import without changing either registry.').addButton(b=>b.setButtonText('Preview migration').onClick(async()=>{try{
   const plan=await this.plugin.call('roots',{action:'migrate'});const modal=new Modal(this.app);modal.titleEl.setText('Migrate aliases to nav');for(const message of plan.messages)modal.contentEl.createEl('p',{text:message});
   new Setting(modal.contentEl).addButton(button=>button.setButtonText('Apply migration').onClick(async()=>{try{await this.plugin.call('roots',{action:'migrate',apply:true,token:plan.token});modal.close();this.plugin.lastIndex=0;await this.refresh();}catch(e){new Notice(String(e));}}));modal.open();
  }catch(e){new Notice(String(e));}}));
 }catch(e){new Notice(String(e));}}
 draw(){if(!this.list)return;this.list.empty();
  for(const item of this.items.filter(x=>(x.name+' '+x.path).toLowerCase().includes(this.query.toLowerCase()))){
   const row=new Setting(this.list).setName(item.name+':').setDesc(item.path+(item.exists?'':' · Folder unavailable')+(item.redirect?' · Compatibility name → '+item.redirect:item.retired?' · Retired (existing links still work)':' · Shared through nav'));
   row.addButton(b=>b.setButtonText('Copy prefix').onClick(()=>navigator.clipboard.writeText(item.name+':')));
   if(!item.redirect)row.addButton(b=>b.setButtonText('Manage').onClick(()=>this.edit(item)));
  }
  if(!this.items.length)this.list.createEl('p',{text:'No linked folders yet. Add a folder to include its files in autocomplete.'});
 }
 edit(item?:{name:string;path:string;retired?:boolean}){new FolderEdit(this.plugin,item,()=>this.refresh()).open();}
 onClose(){this.contentEl.empty();}
}
class FolderEdit extends Modal {
 constructor(private plugin:CodeLinks,private item:{name:string;path:string;retired?:boolean}|undefined,private done:()=>Promise<void>){super(plugin.app);}
 onOpen(){
  this.titleEl.setText(this.item?'Manage '+this.item.name+':':'Add linked folder');
  let name=this.item?.name||'',path=this.item?.path||'';
  const preview=this.contentEl.createDiv();
  let plan:any=null,args:Record<string,unknown>={};
  const clear=()=>{plan=null;preview.empty();};
  new Setting(this.contentEl).setName('Shortcut').setDesc('For example: bdm or research. No colon needed.').addText(t=>t.setValue(name).onChange(v=>{name=v.trim();clear();}));
  const pathRow=new Setting(this.contentEl).setName('Folder').setDesc('Absolute path on this Mac.');
  pathRow.addText(t=>{t.setValue(path).onChange(v=>{path=v;clear();});pathRow.addButton(b=>b.setButtonText('Browse…').onClick(async()=>{
   try{const electron=require('electron');const dialog=electron.remote?.dialog||electron.dialog;
    if(!dialog)throw Error('Folder picker unavailable; paste the folder path instead.');
    const result=await dialog.showOpenDialog({properties:['openDirectory'],title:'Choose linked folder'});
    if(!result.canceled&&result.filePaths[0]){path=result.filePaths[0];t.setValue(path);clear();}
   }catch(e){new Notice(String(e));}
  }));});
  const inspect=async(action:string)=>{try{
   await this.plugin.ensureSavedNotes();
   args={action,name:this.item?.name||name,path,new:name};
   if(action==='rename'&&path!==this.item?.path)throw Error('Change the shortcut and folder location in separate operations.');
   plan=await this.plugin.call('roots',args);preview.empty();
   for(const message of plan.messages||[])preview.createEl('p',{text:message});
   for(const file of plan.references)preview.createEl('div',{text:file});
   new Setting(preview).addButton(b=>b.setButtonText('Apply '+action).setCta().onClick(async()=>{try{
    b.setDisabled(true);await this.plugin.ensureSavedNotes();await this.plugin.call('roots',{...args,apply:true,token:plan.token});
    this.plugin.lastIndex=0;void this.plugin.refresh(true).catch(e=>new Notice(String(e)));
    await this.done();new Notice('Shared nav aliases updated for every vault. Reopen galleries to refresh; Neovim: :CodeLinksRefresh.');this.close();
   }catch(e){b.setDisabled(false);clear();new Notice(String(e));}}));
  }catch(e){clear();new Notice(String(e));}};
  new Setting(this.contentEl).addButton(b=>b.setButtonText('Preview changes').onClick(()=>void inspect(!this.item?'add':name!==this.item.name?'rename':'move')));
  if(this.item)new Setting(this.contentEl).setDesc('Retirement hides this name from suggestions but preserves existing links in every vault.').addButton(b=>b.setButtonText(this.item!.retired?'Preview restore':'Preview retirement').onClick(()=>void inspect(this.item!.retired?'restore':'retire')));
  this.contentEl.append(preview);
 }
 onClose(){this.contentEl.empty();}
}

class Settings extends PluginSettingTab{
 constructor(private plugin:CodeLinks){super(plugin.app,plugin);}
 display(){this.containerEl.empty();this.containerEl.createEl('h2',{text:'Code Links'});
  new Setting(this.containerEl).setName('Linked folders').setDesc('Manage shared nav aliases for every vault and terminal client.').addButton(b=>b.setButtonText('Manage linked folders').onClick(()=>new FolderManager(this.plugin).open()));
  new Setting(this.containerEl).setName('Python executable').setDesc('Host-local path; no shell commands.').addText(t=>t.setValue(this.plugin.settings.python).onChange(async v=>{this.plugin.settings.python=v;await this.plugin.saveData(this.plugin.settings);}));
  new Setting(this.containerEl).setName('Shared core script').addText(t=>t.setValue(this.plugin.settings.core).onChange(async v=>{this.plugin.settings.core=v;await this.plugin.saveData(this.plugin.settings);}));
 }
}

class GuideModal extends Modal{
 owner=new Component();
 constructor(private plugin:CodeLinks){super(plugin.app);}
 async onOpen(){this.titleEl.setText('Code Links — syntax and actions');this.owner.load();try{const text=await readFile(join(dirname(this.plugin.settings.core),'../docs/Using Code Links.md'),'utf8');await MarkdownRenderer.render(this.app,text,this.contentEl,'',this.owner);}catch(e){this.contentEl.setText(String(e));}}
 onClose(){this.owner.unload();this.contentEl.empty();}
}
