import {sectionLines} from './section-lines';
import {emphasizedEquations,EmphasisIndex} from './emphasis';
import {convertLatexToMarkup,validateLatex} from 'mathlive/ssr';
import {Plugin,Notice,MarkdownView,Menu,editorInfoField,PluginSettingTab,Setting} from 'obsidian';
import {StateEffect,StateField,Transaction,EditorSelection,Prec,Text} from '@codemirror/state';
import {EditorView,WidgetType,Decoration,DecorationSet,ViewPlugin,ViewUpdate,keymap} from '@codemirror/view';
import {equations,equationAt,unsupported,splitTag,compose,safeReplacement,numberingEdits,Equation,Tag} from './model';
interface Session {id:string;q:Equation;conflict:boolean;filePath:string|null}
const openEffect=StateEffect.define<Session|null>();
let plugin:MathStudio;
const equationCache=new WeakMap<Text,Equation[]>();
const closedCache=new WeakMap<Text,Equation[]>();
function equationsFor(doc:Text){let result=equationCache.get(doc);if(!result){result=equations(doc.toString());equationCache.set(doc,result);}return result;}
function closedFor(doc:Text){let result=closedCache.get(doc);if(!result){result=equationsFor(doc).filter(q=>hasClosedIntegral(q)&&!validateLatex(splitTag(q.body).latex).length);closedCache.set(doc,result);}return result;}
class MathWidget extends WidgetType{
 constructor(readonly session:Session){super();}
 eq(other:MathWidget){return other.session.id===this.session.id;}
 toDOM(view:EditorView){return plugin.mount(view,this.session);}
 ignoreEvent(){return true;}
 destroy(dom:HTMLElement){(dom as any).mathStudioCleanup?.();}
}
const sessionField=StateField.define<Session|null>({
 create:()=>null,
 update(value,tr){for(const e of tr.effects)if(e.is(openEffect))return e.value;
  if(value&&tr.docChanged){let conflict=value.conflict;tr.changes.iterChangedRanges((from,to)=>{if(from<value!.q.to&&to>value!.q.from||from===to&&from>value!.q.from&&from<value!.q.to)conflict=true;});
   const from=tr.changes.mapPos(value.q.from,1),to=tr.changes.mapPos(value.q.to,-1);return {...value,conflict,q:{...value.q,from,to,bodyFrom:from+(value.q.display?2:1),bodyTo:to-(value.q.display?2:1)}};
  }return value;
 },
 // Empty $|$ may be inside a much larger native display replacement. Mount
 // before its opener so Live Preview cannot swallow the visual editor.
 provide:field=>EditorView.decorations.from(field,value=>value?Decoration.set([Decoration.widget({widget:new MathWidget(value),block:true,side:value.q.bodyFrom===value.q.bodyTo?-1:1}).range(value.q.bodyFrom===value.q.bodyTo?value.q.from:value.q.to)]):Decoration.none)
});
// A small visible action at each equation, without changing native source/rendering.
class EditButton extends WidgetType{
 constructor(readonly from:number){super();}eq(other:EditButton){return other.from===this.from;}
 toDOM(view:EditorView){const button=view.dom.ownerDocument.createElement('button');button.className='math-studio-edit';button.textContent='✎';button.title='Edit equation visually';button.setAttribute('aria-label','Edit equation visually');button.onmousedown=e=>e.preventDefault();button.onclick=e=>{e.preventDefault();e.stopPropagation();plugin.start(view,this.from);};return button;}
 ignoreEvent(){return true;}
}
const controls=ViewPlugin.fromClass(class{
 decorations:DecorationSet=Decoration.none;timer:ReturnType<typeof setTimeout>|null=null;
 onMouse=(event:MouseEvent)=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.altKey)return;const target=event.target as HTMLElement;if(target.closest('.math-studio-host'))return;const math=target.closest('.math, mjx-container');if(!math||this.view.state.field(sessionField,false))return;try{const at=this.view.posAtDOM(math);if(equationsFor(this.view.state.doc).some(q=>at>=q.from&&at<=q.to)){event.preventDefault();event.stopImmediatePropagation();plugin.start(this.view,at);}}catch{}};
 constructor(readonly view:EditorView){this.build();view.dom.addEventListener('mousedown',this.onMouse,true);}
 build(){const state=this.view.state;if(!plugin?.settings.buttons||state.field(sessionField,false)){this.decorations=Decoration.none;return;}const ranges=equationsFor(state.doc).filter(q=>this.view.visibleRanges.some(r=>q.to>=r.from&&q.from<=r.to)).map(q=>Decoration.widget({widget:new EditButton(q.from),side:1}).range(q.to));this.decorations=Decoration.set(ranges,true);}
 update(update:ViewUpdate){if(update.docChanged||update.viewportChanged||update.transactions.some(t=>t.effects.some(e=>e.is(openEffect))))this.build();
  if(update.docChanged&&plugin.settings.autoNumber){if(this.timer)clearTimeout(this.timer);this.timer=setTimeout(()=>{this.timer=null;if(!this.view.state.field(sessionField,false))plugin.renumber(this.view);},650);}
 }
 destroy(){if(this.timer)clearTimeout(this.timer);this.view.dom.removeEventListener('mousedown',this.onMouse,true);}
},{decorations:x=>x.decorations});

// Native math replaces the source span, outside CodeMirror mark decorations.
// Style the rendered widget using parsed Markdown ranges, not neighboring text.
const emphasisColors=ViewPlugin.fromClass(class {
 ranges:ReturnType<typeof emphasizedEquations>;
 index=new EmphasisIndex();frame=0; observer:MutationObserver;
 constructor(readonly view:EditorView){
  this.ranges=this.index.scan(view.state.doc.toString(),equationsFor(view.state.doc));
  this.observer=new MutationObserver(()=>this.schedule());
  this.observer.observe(view.contentDOM,{childList:true,subtree:true});
  this.schedule();
 }
 schedule(){if(this.frame)return;this.frame=this.view.dom.ownerDocument.defaultView!.requestAnimationFrame(()=>{this.frame=0;this.paint();});}
 update(u:ViewUpdate){if(u.docChanged)this.ranges=this.index.scan(u.state.doc.toString(),equationsFor(u.state.doc));this.schedule();}
 paint(){for(const el of Array.from(this.view.contentDOM.querySelectorAll<HTMLElement>('span.math,span.math-studio-special'))){
  if(el.closest('.math-studio-host'))continue;
  let range;try{const at=this.view.posAtDOM(el);range=this.ranges.find(q=>at>=q.from&&at<=q.to);}catch{}
  el.classList.toggle('math-studio-strong',!!range?.strong);
  el.classList.toggle('math-studio-em',!!range?.em);
 }}
 destroy(){this.observer.disconnect();if(this.frame)this.view.dom.ownerDocument.defaultView?.cancelAnimationFrame(this.frame);for(const el of Array.from(this.view.contentDOM.querySelectorAll('.math-studio-strong,.math-studio-em')))el.classList.remove('math-studio-strong','math-studio-em');}
});

const hasClosedIntegral=(q:Equation)=>/\\oii?int(?![a-zA-Z])/.test(q.body);
function staticMarkup(q:Equation){const {latex,tag}=splitTag(q.body);return convertLatexToMarkup(latex,{defaultMode:q.display?'math':'inline-math'})+(tag.kind!=='none'?`<span class="math-studio-tag">(${tag.label.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))})</span>`:'');}
class IntegralWidget extends WidgetType{
 constructor(readonly q:Equation){super();}eq(o:IntegralWidget){return o.q.raw===this.q.raw&&o.q.from===this.q.from;}
 toDOM(view:EditorView){plugin.styleMath(view.dom.ownerDocument);const el=view.dom.ownerDocument.createElement(this.q.display?'div':'span');el.className='math-studio-special'+(this.q.display?' math-studio-display':'');el.innerHTML=staticMarkup(this.q);el.title='Click to edit this equation visually';el.setAttribute('role','button');el.setAttribute('aria-label','Edit closed integral equation');el.tabIndex=0;el.onclick=e=>{e.preventDefault();plugin.start(view,this.q.from);};el.onkeydown=e=>{if(e.key==='Enter')plugin.start(view,this.q.from);};return el;}
 ignoreEvent(){return true;}
}
const compatibilityField=StateField.define<DecorationSet>({create:()=>Decoration.none,update(value,tr){if(!plugin.settings.closedIntegrals)return Decoration.none;if(!tr.docChanged&&!tr.selection&&!tr.effects.length&&value.size)return value;const head=tr.state.selection.main.head;return Decoration.set(closedFor(tr.state.doc).filter(q=>!(head>=q.from&&head<=q.to)).map(q=>Decoration.replace({widget:new IntegralWidget(q),block:q.display}).range(q.from,q.to)),true);},provide:f=>EditorView.decorations.from(f)});

export default class MathStudio extends Plugin{
 frameCode='';mathCSS='';fontCSS='';styledDocs=new Map<Document,HTMLStyleElement>();settings={buttons:false,autoNumber:true,closedIntegrals:true};liveFrames=new Set<()=>void>();
 async onload(){plugin=this;this.settings={...this.settings,...await this.loadData()};this.frameCode=await this.app.vault.adapter.read(`${this.manifest.dir}/frame.js`);this.mathCSS=await this.app.vault.adapter.read(`${this.manifest.dir}/vendor/mathlive-static.css`);this.fontCSS=await this.app.vault.adapter.read(`${this.manifest.dir}/vendor/mathlive-fonts.css`);
  this.registerEditorExtension([sessionField,emphasisColors,Prec.highest(keymap.of([{key:"Mod-Shift-m",run:view=>{if(!equationAt(view.state.doc.toString(),view.state.selection.main.head))return false;this.start(view,view.state.selection.main.head);return true;}}])),Prec.highest(compatibilityField),controls,EditorView.domEventHandlers({mousedown:(event,view)=>{
   if(event.button!==0||event.ctrlKey||event.metaKey||event.altKey)return false;
   const target=event.target as HTMLElement;const math=target.closest('.math');if(!math||target.closest('.math-studio-host')||view.state.field(sessionField,false))return false;
   try{const at=view.posAtDOM(math);if(equationsFor(view.state.doc).some(q=>at>=q.from&&at<=q.to)){event.preventDefault();this.start(view,at);return true;}}catch{}return false;
  }})]);
  this.addCommand({id:'edit-equation',name:'Edit equation visually',hotkeys:[{modifiers:['Mod','Shift'],key:'m'}],editorCallback:editor=>{const cm=(editor as any).cm as EditorView|undefined;if(cm)this.start(cm,editor.posToOffset(editor.getCursor()));else new Notice('Open the note in an editable Markdown view.');}});
  this.addCommand({id:'insert-equation',name:'Insert display equation',editorCallback:editor=>{const cm=(editor as any).cm as EditorView|undefined;if(!cm)return;const pos=editor.posToOffset(editor.getCursor());editor.replaceRange('\n$$\nx\n$$\n',editor.getCursor());this.start(cm,pos+1);}});
  this.addCommand({id:'renumber-equations',name:'Refresh automatic equation numbers',editorCallback:editor=>{const cm=(editor as any).cm as EditorView|undefined;if(cm)this.renumber(cm);}});
  this.registerEvent(this.app.workspace.on('editor-menu',(menu,editor)=>{const cm=(editor as any).cm as EditorView|undefined;if(!cm)return;const at=editor.posToOffset(editor.getCursor());if(equationAt(editor.getValue(),at))menu.addItem(item=>item.setTitle('Edit equation visually').setIcon('sigma').onClick(()=>this.start(cm,at)));}));
  this.registerMarkdownPostProcessor((el,ctx)=>{
   if(!this.settings.closedIntegrals)return;
   const math=Array.from(el.querySelectorAll<HTMLElement>('.math'));if(!math.length)return;
   const section=ctx.getSectionInfo(el);if(!section)return;
   const text=sectionLines(section.text,section.lineStart,section.lineEnd);
   if(!/\\oii?int(?![a-zA-Z])/.test(text))return;
   const parsed=equations(text);
   for(const [i,target] of math.entries()){
    if(target.closest('.math-studio-host'))continue;
    const q=parsed[i];if(q&&hasClosedIntegral(q)&&!validateLatex(splitTag(q.body).latex).length){this.styleMath(el.ownerDocument);target.innerHTML=staticMarkup(q);target.classList.add('math-studio-special');}
   }
  });
  this.addSettingTab(new MathSettings(this.app,this));
 }
 onunload(){for(const dispose of this.liveFrames)dispose();for(const style of this.styledDocs.values())style.remove();}
 styleMath(doc:Document){if(this.styledDocs.has(doc))return;const style=doc.createElement('style');style.textContent=this.mathCSS.replace(/url\(fonts\/([^)]*)\)/g,(_m,file)=>`url("${this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/vendor/fonts/${file}`)}")`);doc.head.append(style);this.styledDocs.set(doc,style);}
 start(view:EditorView,at:number){if(view.state.field(sessionField,false)){new Notice('Save or cancel the current visual equation first.');return;}const q=equationAt(view.state.doc.toString(),at);if(!q){new Notice('Place the cursor inside an inline or display equation.');return;}const info=view.state.field(editorInfoField,false);const s:Session={id:crypto.randomUUID(),q,conflict:false,filePath:info?.file?.path??null};view.dispatch({effects:openEffect.of(s),selection:EditorSelection.cursor(q.bodyFrom===q.bodyTo?q.bodyFrom:Math.min(view.state.doc.length,q.to+1))});}
 renumber(view:EditorView){if(view.state.field(sessionField,false))return;const changes=numberingEdits(view.state.doc.toString());if(changes.length)view.dispatch({changes,annotations:Transaction.addToHistory.of(false)});}
 mount(view:EditorView,s:Session){const doc=view.dom.ownerDocument;const host=doc.createElement('div');host.className='math-studio-host';const iframe=doc.createElement('iframe');iframe.className='math-studio-frame';iframe.title='Math Studio visual equation editor';iframe.setAttribute('sandbox','allow-scripts allow-same-origin');host.append(iframe);
  const colors:Record<string,string>={};const computed=doc.defaultView!.getComputedStyle(view.dom);for(const key of ['--text-normal','--text-muted','--text-error','--background-primary','--background-secondary','--background-modifier-border','--background-modifier-hover','--interactive-accent','--text-on-accent'])colors[key]=computed.getPropertyValue(key).trim();
  const {latex,tag}=splitTag(s.q.body);const config={id:s.id,fontCSS:this.fontCSS,mathCSS:this.mathCSS,latex,tag,display:s.q.display,fonts:this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/vendor/fonts`),dark:doc.body.classList.contains('theme-dark'),colors,blocked:unsupported(s.q.body)};
  const script=this.frameCode.replace(/<\/script/gi,'<\\/script');iframe.srcdoc=`<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src app: data:; img-src data:; connect-src 'none'"></head><body><script>window.mathStudioConfig=${JSON.stringify(config).replace(/</g,'\\u003c')};<\/script><script>${script}<\/script></body></html>`;
  let finishTarget:{at:number;math:boolean}|null=null;
  const outside=(event:MouseEvent)=>{const target=event.target as Node;if(event.button!==0||host.contains(target)||!view.dom.contains(target))return;const at=view.posAtCoords({x:event.clientX,y:event.clientY});if(at===null)return;finishTarget={at,math:!!(target as HTMLElement).closest?.('.math, mjx-container, .math-studio-special, .math-studio-edit')};event.preventDefault();event.stopImmediatePropagation();iframe.contentWindow?.postMessage({mathStudio:s.id,type:'finish'},'*');};
  const fail=(message:string)=>iframe.contentWindow?.postMessage({mathStudio:s.id,type:'error',message},'*');
  const receive=(event:MessageEvent)=>{if(event.source!==iframe.contentWindow||event.data?.mathStudio!==s.id)return;const data=event.data;const current=view.state.field(sessionField,false);if(!current||current.id!==s.id)return;
   if(data.type==='resize'){iframe.style.height=`${Math.max(260,Math.min(780,Number(data.height)||300))}px`;view.requestMeasure();}
   if(data.type==='cancel'||data.type==='native'){view.dispatch({effects:openEffect.of(null),selection:EditorSelection.cursor(current.q.bodyFrom)});view.focus();}
   if(data.type==='copy'){void navigator.clipboard.writeText(String(data.latex)).then(()=>new Notice('Equation LaTeX copied.'));}
   if(data.type==='save'){try{
    const path=view.state.field(editorInfoField,false)?.file?.path??null;if(current.conflict||path!==current.filePath)throw Error('The note or equation changed while you were editing. Your draft is still here; copy it before reopening the current source.');
    if(typeof data.latex!=='string'||!['none','manual','auto'].includes(data.tag?.kind))throw Error('Invalid equation draft.');
    const replacement=data.changed?compose(current.q,data.latex,data.tag as Tag):current.q.raw;const changes=safeReplacement(view.state.doc.toString(),current.q,replacement);
    const target=finishTarget;finishTarget=null;const mappedTarget=target?Math.max(0,Math.min(view.state.doc.length+replacement.length-current.q.raw.length,target.at<=current.q.from?target.at:target.at>=current.q.to?target.at+replacement.length-current.q.raw.length:current.q.from+replacement.length)):null;
    view.dispatch({...(replacement!==current.q.raw?{changes}:{}),effects:openEffect.of(null),selection:EditorSelection.cursor(mappedTarget??(data.native?current.q.bodyFrom:Math.min(view.state.doc.length+(replacement.length-current.q.raw.length),current.q.from+replacement.length+1))),annotations:Transaction.userEvent.of('input.math-studio')});if(this.settings.autoNumber)this.renumber(view);view.focus();if(target?.math&&mappedTarget!==null)this.start(view,mappedTarget);
   }catch(error){fail((error as Error).message);}}
  };
  doc.defaultView!.addEventListener('message',receive);doc.addEventListener('mousedown',outside,true);const dispose=()=>{doc.removeEventListener('mousedown',outside,true);doc.defaultView?.removeEventListener('message',receive);this.liveFrames.delete(dispose);};(host as any).mathStudioCleanup=dispose;this.liveFrames.add(dispose);return host;
 }
}
class MathSettings extends PluginSettingTab{constructor(app:any,readonly plugin:MathStudio){super(app,plugin);}display(){this.containerEl.empty();this.containerEl.createEl('h2',{text:'Math Studio'});new Setting(this.containerEl).setName('Show optional editor pencils').setDesc('Off by default. Applies only to editing mode; reading and print output never show pencils. Click rendered math or use the visual-edit command without them. Reopen the note after changing this.').addToggle(t=>t.setValue(this.plugin.settings.buttons).onChange(async v=>{this.plugin.settings.buttons=v;await this.plugin.saveData(this.plugin.settings);}));new Setting(this.containerEl).setName('Maintain automatic equation numbers').setDesc('Renumber equations explicitly marked Automatic after edits in an open note. Custom labels are unchanged.').addToggle(t=>t.setValue(this.plugin.settings.autoNumber).onChange(async v=>{this.plugin.settings.autoNumber=v;await this.plugin.saveData(this.plugin.settings);}));}}
