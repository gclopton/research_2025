import {marginFormatting} from './margin-format';
import {marginLists} from './margin-lists';
import {RichMarkdown} from './rich-markdown';
import {richTables,imageSpans,cellMarkdown,imageExtension,RichTable,alignImage,imageAlignment,ImageAlignment} from './rich-blocks';
import {importPromptImage} from './image-import';
import {blankTokens,answerText} from './blank-authoring';
import type {Answer} from './model';
import {equations,fieldEquations,Equation} from './math-model';
import {writtenLanguage} from './written-languages';
import {markdown} from '@codemirror/lang-markdown';
import {HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {tags} from '@lezer/highlight';
import {fencedCode,anchoredEquations} from './written-model';
import {App,Component,MarkdownRenderer,Menu,Notice} from 'obsidian';
import {EditorState,StateField,StateEffect,Compartment} from '@codemirror/state';
import {EditorView,Decoration,DecorationSet,WidgetType,keymap,placeholder} from '@codemirror/view';
import {defaultKeymap,history,historyKeymap} from '@codemirror/commands';
import {MathField} from './math-field';

export interface WrittenEditorHandle {source:HTMLTextAreaElement;dom:HTMLElement;refreshBlanks:()=>void;focus:()=>void;setValue:(value:string,from?:number,to?:number)=>void;readonly value:string;readonly previewing:boolean;showPreview:(focus?:boolean)=>void;disabled:boolean}
/** A standalone editor owns its undo history. Markdown stays the source of truth. */
export function writtenEditor(app:App,host:HTMLElement,path:string,value:string,owner:Component,change:(value:string)=>void,busy:(active:boolean)=>void,label="Your response",options:{toolbar?:boolean;lists?:boolean;previewOnBlur?:boolean;answers?:boolean;placeholder?:string;blanks?:()=>Answer[];onBlank?:(id:string)=>void;rich?:boolean}={}):WrittenEditorHandle{
 const wrap=host.createDiv('study-written-input');wrap.createEl('label',{text:label});
 const source=wrap.createEl('textarea');source.hidden=true;source.value=value;source.setAttribute('aria-label',label+' source');
 const surface=wrap.createDiv('study-written-surface');let view:EditorView,field:MathField,locked=false,mathOpen=false,importing=false,disposed=false;const editable=new Compartment();
 const preview=wrap.createDiv('study-written-preview markdown-rendered');preview.hidden=true;preview.tabIndex=0;preview.setAttribute('aria-label',label+' preview');
 let previewMode=false,generation=0,previewOwner:Component|undefined,composing=false,contextMenu=false;
 const clearPreview=()=>{generation++;if(previewOwner){owner.removeChild(previewOwner);previewOwner=undefined;}preview.empty();};
 const resume=()=>{if(disposed)return;previewMode=false;clearPreview();preview.hidden=true;surface.hidden=false;view.requestMeasure();view.focus();};
 const showPreview=(focus=false)=>{
  if(!options.previewOnBlur||disposed||mathOpen||importing||composing||view.composing)return;
  previewMode=true;clearPreview();const ticket=generation,focusAtRequest=view.hasFocus,renderer=owner.addChild(new Component());previewOwner=renderer;
  const stage=wrap.ownerDocument.createElement('div'),text=view.state.doc.toString();
  // Keep the editor visible until the detached render is ready; no raw-source flash.
  void RichMarkdown.render(app,text||'*Write in the margin…*',stage,path,renderer,{reuseLeaf:true}).then(()=>{
   if(disposed||ticket!==generation||!previewMode)return;
   if(mathOpen||importing||composing||view.composing||(!focusAtRequest&&view.hasFocus)){previewMode=false;return;}
   stage.querySelectorAll<HTMLInputElement>('input.task-list-item-checkbox').forEach(box=>box.disabled=true);
   preview.replaceChildren(...Array.from(stage.childNodes));preview.hidden=false;surface.hidden=true;if(focus)preview.focus();
  }).catch(()=>{if(ticket===generation&&previewMode){preview.textContent=text;preview.hidden=false;surface.hidden=true;if(focus)preview.focus();}});
 };
 const checkBlur=(target?:Element)=>requestAnimationFrame(()=>{
  const active=wrap.ownerDocument.activeElement,boundary=wrap.closest('.study-margin-note')??wrap,destination=target??active;
  if(!disposed&&!previewMode&&!contextMenu&&!view.hasFocus&&destination&&destination!==wrap.ownerDocument.body&&!destination.closest('.modal-container,.menu,.suggestion-container')&&wrap.ownerDocument.hasFocus()&&!boundary.contains(destination)&&!boundary.contains(active))showPreview();
 });
 preview.onclick=e=>{if(!(e.target as HTMLElement).closest('a,button,input')){e.stopPropagation();resume();}};
 preview.onkeydown=e=>{if(e.target===preview&&e.key==='Enter'){e.preventDefault();e.stopPropagation();resume();}};
 wrap.addEventListener('pointerdown',e=>{if(previewMode&&!surface.hidden&&surface.contains(e.target as Node))resume();},true);
 wrap.addEventListener('focusout',e=>{if(e.relatedTarget)checkBlur();});
 wrap.addEventListener('compositionstart',()=>{composing=true;});
 wrap.addEventListener('compositionend',()=>{composing=false;queueMicrotask(()=>{if(!disposed){view.dispatch({effects:focusChanged.of(view.hasFocus)});checkBlur();}});});
 wrap.addEventListener('contextmenu',()=>{contextMenu=true;});
 if(options.previewOnBlur)owner.registerDomEvent(wrap.ownerDocument,'pointerdown',e=>{contextMenu=false;checkBlur(e.target instanceof Element?e.target:undefined);},true);
 const open=(from:number,to=from,display=false)=>{if(locked||mathOpen)return;view.dispatch({selection:{anchor:from,head:to}});source.value=view.state.doc.toString();source.setSelectionRange(from,to);void field.openAtCursor(display);};
 class MathWidget extends WidgetType {
  constructor(readonly raw:string){super();}
  eq(other:MathWidget){return other.raw===this.raw;}
  toDOM(){const node=wrap.ownerDocument.createElement('span');node.className='study-written-equation';node.setAttribute('role','button');node.setAttribute('aria-label','Edit equation');node.tabIndex=0;node.title='Edit with Math Studio';node.textContent=this.raw;
   const rendering=new Component();rendering.load();(node as any).rendering=rendering;
   const stage=node.ownerDocument.createElement('span');void RichMarkdown.render(app,this.raw,stage,path,rendering).then(()=>{node.replaceChildren(...Array.from(stage.childNodes));view.requestMeasure();});
   const edit=()=>{const from=view.posAtDOM(node);open(from);};node.onclick=e=>{e.preventDefault();e.stopPropagation();edit();};node.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();edit();}};return node;
  }
  destroy(dom:HTMLElement){(dom as any).rendering?.unload();}
  ignoreEvent(){return true;}
 }
 const refreshBlankEffect=StateEffect.define<null>();
 class BlankWidget extends WidgetType {
  constructor(readonly id:string,readonly text:string,readonly number:number){super();}
  eq(other:BlankWidget){return other.id===this.id&&other.text===this.text&&other.number===this.number;}
  toDOM(){const node=wrap.ownerDocument.createElement('span');node.className='study-blank-highlight';node.tabIndex=0;node.setAttribute('role','button');node.setAttribute('aria-label',`Blank ${this.number}: ${this.text||'empty answer'}`);node.title=`Blank ${this.number} · edit accepted answers`;node.textContent=this.text||`Blank ${this.number}`;
   const rendering=new Component();rendering.load();(node as any).rendering=rendering;
   if(equations(this.text).length){const stage=node.ownerDocument.createElement('span');void RichMarkdown.render(app,this.text,stage,path,rendering).then(()=>{node.replaceChildren(...Array.from(stage.childNodes));view.requestMeasure();});}
   const edit=()=>options.onBlank?.(this.id);node.onclick=e=>{e.preventDefault();e.stopPropagation();edit();};node.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();edit();}};return node;}
  destroy(dom:HTMLElement){(dom as any).rendering?.unload();}
  ignoreEvent(){return true;}
 }
 const rawTableEffect=StateEffect.define<{from:number;to:number}|null>();
 const tableControls=new WeakMap<HTMLElement,{owner:Component;cells:WrittenEditorHandle[][];syncing:boolean}>();
 class TableWidget extends WidgetType {
  constructor(readonly table:RichTable,readonly readonly:boolean){super();}
  eq(other:TableWidget){return other.table.raw===this.table.raw&&other.readonly===this.readonly;}
  toDOM(){
   const node=wrap.ownerDocument.createElement('div');node.className='study-live-table';node.setAttribute('aria-label','Editable prompt table');
   const childOwner=new Component();childOwner.load();const control={owner:childOwner,cells:[] as WrittenEditorHandle[][],syncing:false};tableControls.set(node,control);
   const table=node.createEl('table');
   this.table.rows.forEach((row,r)=>{const tr=table.createEl('tr');control.cells[r]=[];row.forEach((cell,c)=>{
    const td=tr.createEl(r===0?'th':'td');td.style.textAlign=this.table.align[c]??'left';
    const inner=writtenEditor(app,td,path,cell.text,childOwner,text=>{
     if(control.syncing||disposed)return;
     const from=view.posAtDOM(node),current=richTables(view.state.doc.toString()).find(t=>t.from===from),target=current?.rows[r]?.[c];
     if(target)view.dispatch({changes:{from:target.from,to:target.to,insert:cellMarkdown(text)}});
    },busy,`Table ${r===0?'heading':`row ${r}`} column ${c+1}`,{toolbar:false,rich:false});
    inner.disabled=this.readonly;control.cells[r][c]=inner;
   });});
   const source=()=>{if(locked||mathOpen)return;const from=view.posAtDOM(node),current=richTables(view.state.doc.toString()).find(t=>t.from===from);if(current){view.dispatch({effects:rawTableEffect.of({from:current.from,to:current.to}),selection:{anchor:current.from}});view.focus();}};
   node.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();new Menu().addItem(i=>i.setTitle('Edit table Markdown (rows and columns)').setDisabled(this.readonly).onClick(source)).showAtPosition({x:e.clientX,y:e.clientY});});
   node.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();const from=view.posAtDOM(node);view.dispatch({selection:{anchor:from}});view.focus();}else if(e.ctrlKey&&e.code==='Space'){e.preventDefault();e.stopPropagation();const rect=node.getBoundingClientRect();new Menu().addItem(i=>i.setTitle('Edit table Markdown (rows and columns)').setDisabled(locked).onClick(source)).showAtPosition({x:rect.left,y:rect.top});}});
   return node;
  }
  updateDOM(node:HTMLElement){const control=tableControls.get(node);if(!control||control.cells.length!==this.table.rows.length||control.cells.some((row,r)=>row.length!==this.table.rows[r].length))return false;
   control.syncing=true;try{control.cells.forEach((row,r)=>row.forEach((cell,c)=>{const next=this.table.rows[r][c].text;if(cellMarkdown(cell.value)!==next)cell.setValue(next);cell.disabled=this.readonly;}));}finally{control.syncing=false;}return true;
  }
  destroy(node:HTMLElement){tableControls.get(node)?.owner.unload();tableControls.delete(node);}
  ignoreEvent(){return true;}
 }
 class ImageWidget extends WidgetType {
  constructor(readonly raw:string,readonly block:boolean){super();}
  eq(other:ImageWidget){return this.raw===other.raw&&this.block===other.block;}
  toDOM(){const node=wrap.ownerDocument.createElement(this.block?'div':'span');node.className='study-live-image';if(this.block){node.style.display='block';node.style.width='100%';}node.tabIndex=0;node.setAttribute('role','button');node.setAttribute('aria-label','Image: edit Markdown link');
   const renderer=new Component();renderer.load();(node as any).rendering=renderer;let alive=true;(node as any).dispose=()=>{alive=false;renderer.unload();};
   void RichMarkdown.render(app,this.raw,node,path,renderer).then(()=>{if(alive){node.querySelectorAll('img').forEach(img=>img.addEventListener('load',()=>view?.requestMeasure(),{once:true}));view?.requestMeasure();}}).catch(()=>{if(alive)node.setText('Image unavailable — edit link');});
   const edit=()=>{if(locked||mathOpen)return;const from=view.posAtDOM(node);view.dispatch({selection:{anchor:from,head:from+this.raw.length},effects:focusChanged.of(true)});view.focus();};
   const menu=(event:MouseEvent|KeyboardEvent)=>{event.preventDefault();event.stopPropagation();const m=new Menu();(['left','center','right'] as ImageAlignment[]).forEach((alignment,i)=>m.addItem(item=>item.setTitle(`${i+1} · Align ${alignment}`).setChecked(imageAlignment(this.raw)===alignment).setDisabled(locked||mathOpen).onClick(()=>{const from=view.posAtDOM(node),insert=(this.block?'':'\n\n')+alignImage(this.raw,alignment)+(this.block?'':'\n\n');view.dispatch({changes:{from,to:from+this.raw.length,insert},selection:{anchor:from+insert.length}});})));m.addItem(item=>item.setTitle('4 · Edit image Markdown').setDisabled(locked||mathOpen).onClick(edit));const rect=node.getBoundingClientRect();m.showAtPosition({x:'clientX' in event?event.clientX:rect.left,y:'clientY' in event?event.clientY:rect.bottom});};
   node.oncontextmenu=menu;node.onclick=e=>{e.preventDefault();e.stopPropagation();node.focus();};node.onkeydown=e=>{if(e.ctrlKey&&e.code==='Space')menu(e);else if(e.key==='Enter'){e.preventDefault();e.stopPropagation();edit();}};return node;
  }
  destroy(node:HTMLElement){(node as any).dispose?.();}
  ignoreEvent(){return true;}
 }
 const makeBlanks=(state:EditorState)=>Decoration.set(options.blanks?blankTokens(state.doc.toString()).map((token,index)=>{const answer=options.blanks!().find(a=>a.id===token.id);return Decoration.replace({widget:new BlankWidget(token.id,answer?answerText(answer):'',index+1)}).range(token.from,token.to);}):[],true);
 const blanks=StateField.define<DecorationSet>({create:makeBlanks,update:(old,tr)=>tr.docChanged||tr.effects.some(e=>e.is(refreshBlankEffect))?makeBlanks(tr.state):old,provide:f=>[EditorView.decorations.from(f),EditorView.atomicRanges.of(v=>v.state.field(f))]});
 const parse=(text:string)=>options.answers?fieldEquations(text,true).filter(q=>q.bodyFrom!==q.from||/[\\_^]/.test(q.body)):equations(text);
 const focusChanged=StateEffect.define<boolean>();
 const decorations=(state:EditorState,parsed:Equation[],focused:boolean,rawTable:{from:number;to:number}|null,previousFormatting?:DecorationSet)=>{
  const source=state.doc.toString(),rich=options.rich!==false&&!options.answers;
  const tables=rich?richTables(source).filter(t=>!t.raw.includes('{{blank:')&&(!rawTable||t.to<rawTable.from||t.from>rawTable.to)):[];
  const images=rich?imageSpans(source).filter(i=>!tables.some(t=>i.from<t.to&&i.to>t.from)&&(!focused||state.readOnly||!state.selection.ranges.some(s=>s.from<=i.to&&s.to>=i.from))):[];
  const covered=[...tables,...images];
  const formatting=previousFormatting??Decoration.set(options.lists?marginFormatting(state,[...covered,...parsed,...(options.blanks?blankTokens(source):[])]):[],true);
  const formatted:ReturnType<Decoration['range']>[]=[];formatting.between(0,state.doc.length,(from,to,d)=>{formatted.push(d.range(from,to));});
  return {formatting,decorations:Decoration.set([
   ...formatted,
   ...tables.map(t=>Decoration.replace({widget:new TableWidget(t,state.readOnly),block:true}).range(t.from,t.to)),
   ...images.map(i=>Decoration.replace({widget:new ImageWidget(i.raw,i.block),block:i.block}).range(i.from,i.to)),
   ...parsed.filter(q=>!covered.some(t=>q.from<t.to&&q.to>t.from)&&!q.raw.includes('{{blank:')&&q.body.trim()&&(!focused||state.readOnly||!state.selection.ranges.some(s=>s.from<=q.to&&s.to>=q.from))).map(q=>Decoration.replace({widget:new MathWidget(q.bodyFrom===q.from?`$${q.body}$`:q.raw)}).range(q.from,q.to)),
   ...fencedCode(source).flatMap(block=>block.lines.map(pos=>Decoration.line({class:'study-written-code-line'}).range(pos)))
  ],true)};
 };

 const highlight=HighlightStyle.define([{tag:tags.keyword,class:'study-code-keyword'},{tag:tags.string,class:'study-code-string'},{tag:tags.number,class:'study-code-number'},{tag:tags.comment,class:'study-code-comment'},{tag:tags.function(tags.variableName),class:'study-code-function'}]);
 const math=StateField.define<{parsed:Equation[];decorations:DecorationSet;formatting:DecorationSet;focused:boolean;rawTable:{from:number;to:number}|null}>({
  create:state=>{const parsed=parse(state.doc.toString());return {parsed,...decorations(state,parsed,false,null),focused:false,rawTable:null};},
  update:(old,tr)=>{
   const effect=tr.effects.find(e=>e.is(focusChanged)),focused=effect?.is(focusChanged)?effect.value:old.focused;
   const rawEffect=tr.effects.find(e=>e.is(rawTableEffect));
   let rawTable=rawEffect?rawEffect.value as {from:number;to:number}|null:old.rawTable?{from:tr.changes.mapPos(old.rawTable.from),to:tr.changes.mapPos(old.rawTable.to,1)}:null;
   if(rawTable&&tr.selection&&!tr.state.selection.ranges.some(s=>s.from<=rawTable!.to&&s.to>=rawTable!.from))rawTable=null;
   if(!tr.docChanged&&!tr.selection&&!tr.reconfigured&&!effect&&!rawEffect)return old;
   const parsed=tr.docChanged?options.answers?parse(tr.state.doc.toString()):anchoredEquations(tr.state.doc.toString(),old.parsed.filter(q=>{let touched=false;tr.changes.iterChangedRanges((from,to)=>{if(from<=q.to+1&&to>=q.from-1)touched=true;});return !touched;}).map(q=>({from:tr.changes.mapPos(q.from,1),to:tr.changes.mapPos(q.to,-1)}))):old.parsed;
   return {parsed,...decorations(tr.state,parsed,focused,rawTable,composing?old.formatting.map(tr.changes):undefined),focused,rawTable};
  },provide:f=>[EditorView.decorations.from(f,s=>s.decorations),EditorView.atomicRanges.of(v=>v.state.field(f).decorations.update({filter:(_from,_to,value)=>value.spec.widget instanceof TableWidget}))]
 });

 field=new MathField(app,source,path,!!options.answers,()=>{const old=view.state.doc.toString(),next=source.value;let from=0,end=old.length,tail=next.length;while(from<end&&from<tail&&old[from]===next[from])from++;while(end>from&&tail>from&&old[end-1]===next[tail-1]){end--;tail--;}if(old!==next)view.dispatch({changes:{from,to:end,insert:next.slice(from,tail)},selection:{anchor:tail}});},active=>{mathOpen=active;view.dispatch({effects:editable.reconfigure([EditorView.editable.of(!locked&&!active),EditorState.readOnly.of(locked||active)])});busy(active);if(!active)view.focus();},false);owner.addChild(field);
 const receiveImages=(event:ClipboardEvent|DragEvent)=>{
  if(options.rich===false||options.answers||locked||mathOpen||importing)return false;
  const transfer='clipboardData' in event?event.clipboardData:event.dataTransfer;
  const files=Array.from(transfer?.files??[]).filter(f=>imageExtension(f.type,f.name));if(!files.length)return false;
  event.preventDefault();event.stopPropagation();
  const selection=view.state.selection.main,drop='clientX' in event?view.posAtCoords({x:event.clientX,y:event.clientY}):null;
  const from=drop??selection.from,to=drop??selection.to;
  importing=true;busy(true);view.dispatch({effects:editable.reconfigure([EditorView.editable.of(false),EditorState.readOnly.of(true)])});
  void (async()=>{const links:string[]=[];try{for(const file of files)links.push(await importPromptImage(app,path,file));}catch(e){new Notice('Image import: '+String(e));}finally{
   if(!disposed){if(links.length){const insert='\n'+links.join('\n\n')+'\n';view.dispatch({changes:{from,to,insert},selection:{anchor:from+insert.length}});}importing=false;view.dispatch({effects:editable.reconfigure([EditorView.editable.of(!locked&&!mathOpen),EditorState.readOnly.of(locked||mathOpen)])});busy(false);view.focus();}
  }})();return true;
 };
 view=new EditorView({parent:surface,state:EditorState.create({doc:value,extensions:[options.lists?marginLists:[],placeholder(options.placeholder??''),EditorView.domEventHandlers({paste:event=>receiveImages(event),drop:event=>receiveImages(event),dragover:event=>{if(Array.from(event.dataTransfer?.items??[]).some(i=>i.kind==='file'&&i.type.startsWith('image/'))){event.preventDefault();return true;}return false;},focus:(_,v)=>{if(previewMode){previewMode=false;clearPreview();preview.hidden=true;surface.hidden=false;}v.dispatch({effects:focusChanged.of(true)});},blur:(_,v)=>{v.dispatch({effects:focusChanged.of(false)});}}),markdown({codeLanguages:writtenLanguage}),syntaxHighlighting(highlight),history(),keymap.of([{key:'Ctrl-m',run:v=>{open(v.state.selection.main.from,v.state.selection.main.to);return true;}},{key:'Ctrl-Shift-m',run:v=>{open(v.state.selection.main.from,v.state.selection.main.to,true);return true;}},...defaultKeymap,...historyKeymap]),EditorView.lineWrapping,editable.of([EditorView.editable.of(true),EditorState.readOnly.of(false)]),EditorView.contentAttributes.of({'aria-label':label==='Your response'?'Your written response':label,'aria-multiline':'true',role:'textbox'}),math,blanks,EditorView.updateListener.of(update=>{if(update.docChanged){source.value=update.state.doc.toString();change(source.value);if(previewMode)queueMicrotask(()=>{if(previewMode&&!disposed)showPreview();});}if(update.selectionSet||update.docChanged){const s=update.state.selection.main;source.setSelectionRange(s.from,s.to);}})]})});
 if(options.toolbar===false)wrap.querySelector('.study-math-tools')?.remove();
 // Toolbar buttons must use the visible editor's caret, including after a mouse click.
 wrap.querySelectorAll<HTMLButtonElement>('.study-math-tools button').forEach((button,i)=>button.onclick=()=>open(view.state.selection.main.from,view.state.selection.main.to,i===1));
 owner.register(()=>{disposed=true;generation++;view.destroy();});
 return {source,dom:view.dom,refreshBlanks:()=>view.dispatch({effects:refreshBlankEffect.of(null)}),focus:resume,showPreview,get previewing(){return previewMode;},setValue:(value:string,from?:number,to=from)=>{view.dispatch({changes:{from:0,to:view.state.doc.length,insert:value},...(from===undefined?{}:{selection:{anchor:from,head:to}})});},get value(){return view.state.doc.toString();},set disabled(value:boolean){if(locked===value)return;locked=value;source.disabled=value;view.dispatch({effects:editable.reconfigure([EditorView.editable.of(!value&&!mathOpen),EditorState.readOnly.of(value||mathOpen)])});wrap.querySelectorAll<HTMLButtonElement>('.study-math-tools button').forEach(b=>b.disabled=value);}};
}
