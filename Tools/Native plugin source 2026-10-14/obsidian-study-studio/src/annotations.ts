import {FloatingPalette} from './floating-palette';
import {readingInsertion} from './margin-anchors';
import {menuGroup} from './menu-groups';
import {paletteItems} from './annotation-menu';
import {AnnotationStyle,CommentColor,styleNames} from './review-model';
import {registerMathAnnotations,clearMathMarks,selectedMathAnchor} from './math-annotations';
import {readingChildren} from './reading-lifecycle';
import {commentSegments,markAttributes,markClass,CommentRange} from './comment-marks';
import {excerpts,readingCopies} from './margin-model';
import {registerReadingContext,readingExcerpts,editorExcerpts,readingAnchorApplies} from './margin-anchors';
import {CommentSettings} from './comment-settings';
import {Plugin,MarkdownView,editorInfoField,editorLivePreviewField,Menu,MarkdownRenderChild,setIcon,Notice,TFile} from 'obsidian';
import {Decoration,DecorationSet,EditorView,ViewPlugin,WidgetType} from 'obsidian-cm/view';
import type {Range} from '@codemirror/state';
import {StateEffect} from 'obsidian-cm/state';
import {paintReadingComments,readingMarks,hasReadingSelection,readingText} from './reading-comments';
import {registerAnchorProtection,requestAnchorRemoval} from './anchor-protection';
import {ReviewStore,ReviewChange} from './review';
import {PlacedSticky,StickyPlacement,placementOf,placementFor,placementFromAnchors,cachedPlacementEnd,endInRange} from './sticky-placement';
import {isProtectedPaper} from './paper-protection';
import type {Critique,MarginAnchor} from './review-model';
const refreshAnnotations=StateEffect.define<null>();
import {locateQuote,safeColor,darkCommentColor,anchorsFor} from './review-model';
class AnchorChip extends WidgetType{
 constructor(readonly id:string,readonly plugin:Plugin){super();}eq(other:AnchorChip){return other.id===this.id;}
 toDOM(view:EditorView){const span=document.createElement('span');span.className='study-anchor-chip';span.textContent='↗';span.title=`Protected block link: ${this.id} · right-click to remove`;span.setAttribute('aria-label',`Protected block link ${this.id}`);span.oncontextmenu=event=>{event.preventDefault();event.stopPropagation();new Menu().addItem(i=>i.setTitle(`Remove block anchor ${this.id}…`).setIcon('unlink').onClick(()=>requestAnchorRemoval(this.plugin,view,[this.id]))).showAtMouseEvent(event);};return span;}
}
/** One compact post-it control, shared by fenced placements, sidecar placements and Live Preview widgets. */
function stickyButton(container:HTMLElement,c:Critique,store:ReviewStore){
 const button=container.createEl('button',{cls:'study-sticky-note',attr:{'aria-label':c.resolved?'Open resolved sticky note':'Open sticky note'}});
 setIcon(button,'sticky-note');button.title=c.resolved?'Resolved sticky note':'Sticky note';button.classList.toggle('is-resolved',c.resolved);
 button.style.setProperty('--critique-color',safeColor(c.color));button.style.setProperty('--critique-dark',darkCommentColor(c));button.onclick=()=>store.edit(c);button.onmouseenter=()=>store.hover(button,c);button.onfocus=()=>store.hover(button,c);button.addEventListener('blur',()=>button.dispatchEvent(new Event('mouseleave')));
 return button;
}
/** Sidecar post-it marker. The class keeps it out of reading-text extraction, evidence anchoring and print. */
function stickyMarker(doc:Document,c:Critique,store:ReviewStore){const span=doc.createElement('span');span.className='study-sticky-placement study-sticky-anchor';span.dataset.studyStickyId=c.id;span.style.margin='0 0 0 .35em';span.style.display='inline-block';span.style.verticalAlign='middle';stickyButton(span,c,store);return span;}
class StickyWidget extends WidgetType{
 constructor(readonly c:Critique,readonly store:ReviewStore){super();}
 eq(other:StickyWidget){return other.c.id===this.c.id&&other.c.color===this.c.color&&other.c.darkColor===this.c.darkColor&&other.c.resolved===this.c.resolved&&other.c.updated===this.c.updated;}
 toDOM(view:EditorView){return stickyMarker(view.dom.ownerDocument,this.c,this.store);}
 ignoreEvent(){return true;}
}
export function registerAnnotations(plugin:Plugin,store:ReviewStore){
 const ownReading=readingChildren(plugin);registerMathAnnotations(plugin,store);
 registerAnchorProtection(plugin);
 plugin.addSettingTab(new CommentSettings(plugin.app,plugin,store));
 /** Protected papers keep the post-it in the sidecar only; the paper text is never written. */
 const addPlacedSticky=async(path:string,placement:StickyPlacement|undefined,p=store.paletteFor('sticky')[0])=>{
  if(!placement){new Notice('Could not find a distinctive passage for this post-it. Select a passage and try again.');return;}
  const id=crypto.randomUUID(),c:PlacedSticky={id,kind:'sticky',path,quote:'',before:'',after:'',comment:'',intent:p?.meaning??'',color:p?.color??'#e2b714',darkColor:p?.darkColor,updated:new Date().toISOString(),resolved:false,placement};let saved=false;
  try{store.data.comments.push(c);await store.save({paths:new Set([path]),commentIds:new Set([id]),annotations:true});saved=true;store.warnHidden(c);await store.openMargin?.(c,true);}
  catch(error){if(!saved){const i=store.data.comments.indexOf(c);if(i>=0)store.data.comments.splice(i,1);}new Notice((saved?'Post-it saved, but its margin could not open: ':'Could not save post-it: ')+String(error));}
 };
 const protectedPath=(path:string)=>isProtectedPaper(plugin.app,path);
 const addSticky=async(editor:import('obsidian').Editor,path:string,p=store.paletteFor('sticky')[0],anchors?:MarginAnchor[])=>{
  if(protectedPath(path)){const raw=editor.getValue(),from=editor.posToOffset(editor.getCursor('from')),to=editor.posToOffset(editor.getCursor('to'));await addPlacedSticky(path,placementFromAnchors(raw,anchors)??placementFor(raw,from,to),p);return;}
  let placed=false;const cursor=editor.getCursor(),id=crypto.randomUUID(),c={id,kind:'sticky' as const,path,quote:'',before:'',after:'',comment:'',intent:p?.meaning??'',color:p?.color??'#e2b714',darkColor:p?.darkColor,updated:new Date().toISOString(),resolved:false};
  try{store.data.comments.push(c);await store.save({paths:new Set([path]),commentIds:new Set([id]),annotations:true});
   const current=plugin.app.workspace.getLeavesOfType('markdown').some(l=>l.view instanceof MarkdownView&&l.view.editor===editor&&l.view.file?.path===path);if(!current)throw Error('The source note changed before the post-it was placed.');
   editor.replaceRange('\n\n```study-sticky\n'+id+'\n```\n\n',cursor);placed=true;store.warnHidden(c);await store.openMargin?.(c,true);
  }catch(error){const item=store.data.comments.find(x=>x.id===id);if(item&&!placed){item.resolved=true;item.deletedAt=new Date().toISOString();await store.save({paths:new Set([path]),commentIds:new Set([id]),annotations:true});}new Notice((placed?'Post-it saved, but its margin could not open: ':'Could not place post-it: ')+String(error));}
 };
 const addStickyReading=async(path:string,snapshot:{text:string;offset:number},p=store.paletteFor('sticky')[0],anchors?:MarginAnchor[])=>{
  if(protectedPath(path)){const at=Math.max(0,snapshot.offset-1);await addPlacedSticky(path,placementFromAnchors(snapshot.text,anchors)??placementFor(snapshot.text,at,at),p);return;}
  const file=plugin.app.vault.getAbstractFileByPath(path);if(!(file instanceof TFile))return;const id=crypto.randomUUID(),c={id,kind:'sticky' as const,path,quote:'',before:'',after:'',comment:'',intent:p?.meaning??'',color:p?.color??'#e2b714',darkColor:p?.darkColor,updated:new Date().toISOString(),resolved:false};let placed=false;
  try{store.data.comments.push(c);await store.save({paths:new Set([path]),commentIds:new Set([id]),annotations:true});await plugin.app.vault.process(file,raw=>{if(raw!==snapshot.text)throw Error('The passage changed. Select the placement again.');return raw.slice(0,snapshot.offset)+'\n\n```study-sticky\n'+id+'\n```\n\n'+raw.slice(snapshot.offset);});placed=true;store.warnHidden(c);await store.openMargin?.(c,true);}catch(e){if(!placed){const item=store.data.comments.find(x=>x.id===id);if(item){item.deletedAt=new Date().toISOString();item.resolved=true;await store.save({paths:new Set([path]),commentIds:new Set([id]),annotations:true});}}new Notice(String(e));}
 };
 
 plugin.registerEvent(plugin.app.workspace.on('editor-menu',(menu,editor,info)=>{if(info.file)paletteItems(menuGroup(menu,'mark-sticky','Post-it','sticky-note'),'sticky',store.paletteFor('sticky'),p=>void addSticky(editor,info.file!.path,p));}));
 plugin.registerMarkdownCodeBlockProcessor('study-sticky',(source,el,ctx)=>{
  el.addClass('study-sticky-placement');const id=source.trim();
  class Sticky extends MarkdownRenderChild{
   onload(){store.listeners.add(this.render);this.register(()=>store.listeners.delete(this.render));this.render();}
   render=()=>{el.empty();const c=store.data.comments.find(c=>c.id===id&&c.kind==='sticky');
    el.hidden=!!c&&!store.isAnnotationVisible(c);if(c&&!store.isAnnotationVisible(c))return;
    if(!c){el.createSpan({text:'Sticky note unavailable',cls:'study-sticky-missing'});return;}
    stickyButton(el,c,store);
   };
  }
  ctx.addChild(ownReading(new Sticky(el)));
 });
 plugin.addCommand({id:'toggle-note-annotations',name:'Toggle annotations in notes',callback:()=>void store.setVisibility({...store.visibility,enabled:!store.visibility.enabled})});
 plugin.addCommand({id:'annotation-visibility',name:'Choose visible annotation types…',callback:()=>store.visibilityMenu()});
 plugin.registerEvent(plugin.app.workspace.on('editor-menu',(menu,_editor,info)=>{if(info.file)store.addVisibilityMenu(menu);}));
 const currentSelection=()=>{const view=plugin.app.workspace.getActiveViewOfType(MarkdownView);if(!view?.file)return;const path=view.file.path,mathAnchor=selectedMathAnchor(view);if(mathAnchor)return {path,quote:mathAnchor.quote,before:mathAnchor.before,after:mathAnchor.after,anchors:[mathAnchor]};let anchors;
  if(view.getMode()==='source'){const editor=view.editor;if(!editor.getSelection())return;anchors=editorExcerpts(editor.getValue(),editor.posToOffset(editor.getCursor('from')),editor.posToOffset(editor.getCursor('to')),path);}
  else {const selection=view.containerEl.ownerDocument.getSelection();if(!selection||!selection.rangeCount||!view.containerEl.contains(selection.getRangeAt(0).commonAncestorContainer))return;anchors=readingExcerpts(selection,path);}
  if(!anchors?.length)return;const first=anchors[0];return {path,quote:first.quote,before:first.before,after:first.after,anchors};
 };
 for(const style of ['highlight','underline','text'] as const)plugin.addCommand({id:'mark-selection-'+style,name:styleNames[style]+' selection…',checkCallback:checking=>{if(!plugin.app.workspace.getActiveViewOfType(MarkdownView)?.file)return false;if(!checking)palette.open(style,true);return true;}});
 plugin.addCommand({id:'insert-sticky-note',name:'Insert post-it…',checkCallback:checking=>{if(!plugin.app.workspace.getActiveViewOfType(MarkdownView)?.file)return false;if(!checking)palette.open('sticky',true);return true;}});
 let captured:{view:MarkdownView;path:string;raw:string;anchor:ReturnType<typeof currentSelection>;at:ReturnType<typeof readingInsertion>;cursor:import('obsidian').EditorPosition}|undefined;
 const capture=()=>{const view=plugin.app.workspace.getActiveViewOfType(MarkdownView);if(!view?.file){captured=undefined;return;}const selection=view.containerEl.ownerDocument.getSelection();captured={view,path:view.file.path,raw:view.editor.getValue(),anchor:currentSelection(),at:selection?readingInsertion(selection,view.file.path):undefined,cursor:view.editor.getCursor()};};
 const palette=new FloatingPalette(plugin,store,async(style,p)=>{const c=captured;if(!c||c.view.file?.path!==c.path)throw Error('Select a passage or placement first.');if(c.view.editor.getValue()!==c.raw)throw Error('The passage changed. Select it again.');if(style==='sticky'){if(protectedPath(c.path)){const at=c.view.editor.posToOffset(c.cursor);await addPlacedSticky(c.path,placementFromAnchors(c.raw,c.anchor?.anchors)??(c.view.getMode()!=='source'&&c.at?placementFor(c.at.text,Math.max(0,c.at.offset-1),Math.max(0,c.at.offset-1)):placementFor(c.raw,at,at)),p);return;}if(c.view.getMode()==='source'){c.view.editor.setCursor(c.cursor);await addSticky(c.view.editor,c.path,p);}else{if(!c.at)throw Error('Select a passage for the post-it placement.');await addStickyReading(c.path,c.at,p);}return;}if(!c.anchor)throw Error('Select a passage or equation term first.');await store.createMark(c.anchor,style,p);},capture);void palette.load();
 plugin.addCommand({id:'annotation-palette',name:'Open annotation palette',hotkeys:[{modifiers:['Alt'],key:'J'}],callback:()=>palette.open(undefined,true)});
 plugin.addCommand({id:'close-annotation-palette',name:'Close annotation palette',callback:()=>palette.close()});
 plugin.registerEvent(plugin.app.workspace.on('editor-menu',menu=>menu.addItem(i=>i.setSection('selection').setTitle('Annotation palette…').setIcon('palette').onClick(()=>palette.open()))));

 plugin.addCommand({id:'review-queue' ,name:'Open question and comment review queue',callback:()=>store.list()});
 plugin.addCommand({id:'comment-selection',name:'Comment on selected passage',checkCallback:checking=>{const anchor=currentSelection();if(!anchor)return false;if(!checking)store.edit(anchor);return true;}});
 plugin.registerEvent(plugin.app.workspace.on('editor-menu',(menu,editor,info)=>{if(editor.getSelection()&&info.file){const raw=editor.getValue(),from=editor.posToOffset(editor.getCursor('from')),to=editor.posToOffset(editor.getCursor('to')),anchors=editorExcerpts(raw,from,to,info.file.path);if(anchors.length)store.addMarkMenu(menu,{path:info.file.path,quote:raw.slice(from,to),before:raw.slice(Math.max(0,from-48),from),after:raw.slice(to,to+48),anchors});menu.addItem(i=>i.setSection('selection').setTitle('Comment on selection…').setIcon('message-square').onClick(()=>{const from=editor.posToOffset(editor.getCursor('from')),to=editor.posToOffset(editor.getCursor('to')),raw=editor.getValue();const anchors=editorExcerpts(raw,from,to,info.file!.path);if(anchors.length)store.edit({path:info.file!.path,quote:raw.slice(from,to),before:raw.slice(Math.max(0,from-48),from),after:raw.slice(to,to+48),anchors});}));}}));
 const refresh=(change?:ReviewChange)=>{if(change&&!change.annotations)return;plugin.app.workspace.getLeavesOfType('markdown').forEach(leaf=>{const view=leaf.view;if(!(view instanceof MarkdownView)||change&&!change.paths.has(view.file?.path??''))return;const cm=(view.editor as any)?.cm as EditorView|undefined;cm?.dispatch({effects:refreshAnnotations.of(null)});});};store.listeners.add(refresh);plugin.register(()=>store.listeners.delete(refresh));
 plugin.registerEditorExtension(ViewPlugin.fromClass(class{
  decorations:DecorationSet=Decoration.none;atomic:DecorationSet=Decoration.none;
  constructor(readonly view:EditorView){this.build();}
  update(update:import('obsidian-cm/view').ViewUpdate){if(update.docChanged||update.transactions.some(t=>t.effects.some(e=>e.is(refreshAnnotations)))||update.startState.field(editorLivePreviewField,false)!==update.state.field(editorLivePreviewField,false)||update.startState.field(editorInfoField,false)?.file?.path!==update.state.field(editorInfoField,false)?.file?.path)this.build();}
  build(){const state=this.view.state,info=state.field(editorInfoField,false);if(!state.field(editorLivePreviewField,false)){this.decorations=Decoration.none;this.atomic=Decoration.none;return;}const raw=state.doc.toString(),commentRanges:CommentRange[]=[],ranges:Range<Decoration>[]=[],anchors:Range<Decoration>[]=[];
   for(const c of store.data.comments.filter(c=>!c.resolved&&store.isAnnotationVisible(c)&&excerpts(c).some(a=>a.path===info?.file?.path)&&!c.questionId)){for(const a of excerpts(c).filter(a=>a.path===info?.file?.path&&!a.sectionSource&&a.kind!=='math')){const at=locateQuote(raw,a);if(at)commentRanges.push({...at,comment:c});}}
   for(const part of commentSegments(commentRanges))ranges.push(Decoration.mark({class:markClass(part.comments),attributes:markAttributes(part.comments)}).range(part.from,part.to));
   // Block IDs at paragraph ends are preserved in source and remain atomic in Live Preview.
   for(const a of anchorsFor(state.doc)){const mark=Decoration.replace({widget:new AnchorChip(a.id,plugin)}).range(a.from,a.to);ranges.push(mark);anchors.push(mark);}
   const path=info?.file?.path;if(path)for(const c of store.data.comments){if(c.kind!=='sticky'||c.deletedAt||c.path!==path||!store.isAnnotationVisible(c))continue;const p=placementOf(c);if(!p)continue;const end=cachedPlacementEnd(path,raw,p);if(end!==undefined)ranges.push(Decoration.widget({widget:new StickyWidget(c,store),side:1}).range(end));}
   this.decorations=Decoration.set(ranges,true);this.atomic=Decoration.set(anchors,true);
  }
 },{decorations:v=>v.decorations,provide:p=>EditorView.atomicRanges.of(view=>view.plugin(p)?.atomic??Decoration.none),eventHandlers:{mouseover(event){const node=(event.target as HTMLElement).closest<HTMLElement>('[data-critique-id]');const c=store.data.comments.find(c=>c.id===node?.dataset.critiqueId);if(node&&c)store.hover(node,c);return false;},contextmenu(event){const node=(event.target as HTMLElement).closest<HTMLElement>('[data-critique-id]');const ids=(node?.dataset.studyCommentIds??node?.dataset.critiqueId??'').split(' '),comments=store.data.comments.filter(c=>ids.includes(c.id));if(comments.length){const menu=Menu.forEvent(event);for(const c of comments)menu.addItem(i=>i.setSection('selection').setTitle('Open margin note: '+(c.comment||c.intent||c.quote).slice(0,60)).setIcon('notebook-pen').onClick(()=>store.edit(c)));}return false;}}}));
 plugin.registerEvent(plugin.app.workspace.on('editor-menu',(menu,editor,info)=>{if(!editor.getSelection()||!info.file)return;menu.addItem(i=>i.setSection('selection').setTitle('Add selection to selected margin note').onClick(()=>store.addToMargin?.(editorExcerpts(editor.getValue(),editor.posToOffset(editor.getCursor('from')),editor.posToOffset(editor.getCursor('to')),info.file!.path))));}));
 plugin.registerMarkdownPostProcessor((el,ctx)=>{
  if(el.closest('.study-comment-editor,.study-comment-popover,.study-margin-pane,.evidence-reader,.evidence-paper,.evidence-editor'))return;
  let sectionPath=ctx.sourcePath;
  registerReadingContext(el,()=>sectionPath,ctx);
  const owner=ownReading(new MarkdownRenderChild(el));ctx.addChild(owner);
  owner.registerDomEvent(el,'contextmenu',event=>{
   if((event.target as HTMLElement).closest('.study-card,.study-margin-pane'))return;
   const menu=Menu.forEvent(event),shared=event as MouseEvent&{studyMarginMenu?:boolean;studyPaletteMenu?:boolean;studyVisibilityMenu?:boolean};event.preventDefault();
   const selection=el.ownerDocument.getSelection();
   if(!shared.studyMarginMenu&&selection&&selection.rangeCount&&!selection.isCollapsed&&selection.getRangeAt(0).intersectsNode(el)&&selection.toString().trim()){
    shared.studyMarginMenu=true;const anchors=readingExcerpts(selection,sectionPath);
    if(anchors.length){const first=anchors[0];store.addMarkMenu(menu,{path:first.path,quote:first.quote,before:first.before,after:first.after,anchors});menu.addItem(i=>i.setSection('selection').setTitle('Comment on selection…').setIcon('message-square').onClick(()=>store.edit({path:first.path,quote:first.quote,before:first.before,after:first.after,anchors}))).addItem(i=>i.setSection('selection').setTitle('Add selection to selected margin note').onClick(()=>store.addToMargin?.(anchors)));}
    else menu.addItem(i=>i.setSection('selection').setTitle('Select within a passage to annotate').setDisabled(true));
   }
   if(!shared.studyPaletteMenu){shared.studyPaletteMenu=true;const info=ctx.getSectionInfo(el);if(info){const offset=info.text.split('\n').slice(0,info.lineEnd+1).join('\n').length,path=sectionPath,picked=selection&&!selection.isCollapsed&&selection.toString().trim()&&protectedPath(path)?readingExcerpts(selection,path):undefined;paletteItems(menuGroup(menu,'mark-sticky','Post-it','sticky-note'),'sticky',store.paletteFor('sticky'),p=>void addStickyReading(path,{text:info.text,offset},p,picked));}menu.addItem(i=>i.setSection('selection').setTitle('Annotation palette…').setIcon('palette').onClick(()=>palette.open()));}
   if(!shared.studyVisibilityMenu){shared.studyVisibilityMenu=true;store.addVisibilityMenu(menu,{x:event.clientX,y:event.clientY});}
  });
  el.dataset.studyCommentSection='';
  class ReadingAnnotations extends MarkdownRenderChild{
   private pending=false;private alive=false;private stopSelection?:()=>void;
   onload(){
    this.alive=true;this.registerEvent(plugin.app.vault.on('rename',(file,old)=>{if(sectionPath===old||sectionPath.startsWith(old+'/'))sectionPath=file.path+sectionPath.slice(old.length);}));
    store.listeners.add(this.refresh);this.register(()=>store.listeners.delete(this.refresh));
    this.refresh();
   }
   onunload(){this.alive=false;this.stopSelection?.();for(const math of el.querySelectorAll<HTMLElement>('.math'))clearMathMarks(math);for(const mark of readingMarks(el))mark.dispatchEvent(new Event('mouseleave'));}
   refresh=(change?:ReviewChange)=>{
    if(!this.alive||change&&(!change.annotations||!change.paths.has(sectionPath)))return;
    const comments=store.data.comments.filter(c=>!c.resolved&&store.isAnnotationVisible(c)&&!c.questionId&&c.kind!=='sticky').flatMap(c=>readingCopies(c,sectionPath)).filter(c=>!c.anchors||readingAnchorApplies(el,c.excerpt));
    const marks=[...readingMarks(el),...el.querySelectorAll<HTMLElement>('[data-study-math-ids]')],text=readingText(el);
    if(change&&!marks.some(m=>(m.dataset.studyMathIds??m.dataset.studyCommentIds??m.dataset.studyReadingComment??'').split(' ').some(id=>change.commentIds.has(id)))&&!comments.some(c=>change.commentIds.has(c.id)&&(c.excerpt.kind==='math'||c.quote&&text.includes(c.quote))))return;
    if(!marks.length&&!comments.some(c=>c.excerpt.kind==='math'||c.quote&&text.includes(c.quote)))return;
    if(hasReadingSelection(el)){this.pending=true;if(!this.stopSelection){const retry=()=>{if(this.pending&&!hasReadingSelection(el)){this.pending=false;this.stopSelection?.();this.refresh();}};el.ownerDocument.addEventListener('selectionchange',retry);this.stopSelection=()=>{el.ownerDocument.removeEventListener('selectionchange',retry);this.stopSelection=undefined;};}return;}
    this.pending=false;this.stopSelection?.();
    paintReadingComments(el,comments,{hover:(mark,c)=>store.hover(mark,store.data.comments.find(x=>x.id===c.id)??c),edit:c=>store.edit(store.data.comments.find(x=>x.id===c.id)??c)});
   };
  }
  ctx.addChild(ownReading(new ReadingAnnotations(el)));
  class ReadingStickies extends MarkdownRenderChild{
   onload(){store.listeners.add(this.paint);this.register(()=>store.listeners.delete(this.paint));this.paint();}
   onunload(){this.clear();}
   private clear(){el.querySelectorAll('.study-sticky-anchor').forEach(n=>n.remove());}
   paint=(change?:ReviewChange)=>{
    if(change&&(!change.annotations||!change.paths.has(sectionPath)))return;
    const placed=store.data.comments.filter(c=>c.kind==='sticky'&&!c.deletedAt&&c.path===sectionPath&&placementOf(c));
    if(!placed.length&&!el.querySelector('.study-sticky-anchor'))return;this.clear();
    const info=ctx.getSectionInfo(el);if(!info)return;
    let from=0;for(let i=0,at=0;i<info.lineStart&&at>=0;i++){at=info.text.indexOf('\n',at);if(at<0)break;at++;from=at;}
    let to=from;for(let i=info.lineStart;i<=info.lineEnd;i++){const next=info.text.indexOf('\n',to);to=next<0?info.text.length:next+(i<info.lineEnd?1:0);}
    for(const c of placed){if(!store.isAnnotationVisible(c))continue;const end=cachedPlacementEnd(sectionPath,info.text,placementOf(c)!);if(end===undefined||!endInRange(end,from,to))continue;
     let target:HTMLElement=el;while(target.lastElementChild instanceof HTMLElement&&/^(P|UL|OL|LI|BLOCKQUOTE|DIV|TABLE|TBODY|TR|TD|TH|H[1-6]|CALLOUT)$/i.test(target.lastElementChild.tagName)&&!target.lastElementChild.matches('.study-sticky-anchor,.math,.MathJax,mjx-container,pre,.callout-title'))target=target.lastElementChild;
     target.append(stickyMarker(el.ownerDocument,c,store));}
   };
  }
  ctx.addChild(ownReading(new ReadingStickies(el)));
 });
 plugin.registerEvent(plugin.app.vault.on('rename',(file,old)=>{let changed=false;for(const c of store.data.comments)if(c.path===old||c.path.startsWith(old+'/')){c.path=file.path+c.path.slice(old.length);changed=true;}for(const c of store.data.comments)for(const a of c.anchors??[])if(a.path===old||a.path.startsWith(old+'/')){a.path=file.path+a.path.slice(old.length);changed=true;}for(const q of store.data.questions)if(q.path===old||q.path.startsWith(old+'/')){q.path=file.path+q.path.slice(old.length);changed=true;}if(changed)void store.save({paths:new Set(),commentIds:new Set(),annotations:false});}));
}
