import {locateMarginAnchor} from './math-anchor-location';
import {Plugin,Menu,MarkdownView,editorInfoField,editorLivePreviewField} from 'obsidian';
import {EditorView,ViewPlugin} from 'obsidian-cm/view';
import {Critique,MarginAnchor,locateQuote,safeColor,darkCommentColor} from './review-model';
import {ReviewStore,ReviewChange} from './review';
import {excerpts} from './margin-model';
import {equations,Equation} from './math-model';
import {partAtTarget,partFromRange,resolvePart} from './math-parts';
import {readingEquationAnchor} from './margin-anchors';
import {markAttributes} from './comment-marks';
type MathComment=Critique&{excerpt?:MarginAnchor};
const painted=new WeakMap<HTMLElement,{signature:string;math:HTMLElement;restore:(()=>void)[]}>();
export function clearMathMarks(root:HTMLElement){const old=painted.get(root);if(old){for(const undo of old.restore)undo();painted.delete(root);}}
export function paintMathMarks(root:HTMLElement,comments:MathComment[]){
 const math=root.querySelector<HTMLElement>('mjx-math');if(!math)return;const signature=JSON.stringify(comments.map(c=>[c.id,c.color,c.darkColor,c.markStyle,c.excerpt?.part]));const old=painted.get(root);if(old?.signature===signature&&old.math===math)return;clearMathMarks(root);
 const lineGroups:{nodes:HTMLElement[];comment:Critique}[]=[];const targets=new Map<HTMLElement,Critique[]>();for(const c of comments){const part=c.excerpt?.part;const nodes=part?resolvePart(math,part):[math];if(nodes.length>1&&c.markStyle==='underline')lineGroups.push({nodes,comment:c});for(const n of nodes){const list=targets.get(n)??[];if(!list.some(x=>x.id===c.id))list.push(c);targets.set(n,list);}}
 const restore:(()=>void)[]=[];
 for(const [node,original]of targets){let colored:HTMLElement|null=node,explicit=!!node.querySelector('[style*="color"]');while(colored&&math.contains(colored)){if(colored.style.color){explicit=true;break;}colored=colored.parentElement;}const cs=explicit?original.map(c=>c.markStyle==='text'?{...c,markStyle:'underline' as const}:c):original;const attrs=markAttributes(cs),style=root.ownerDocument.createElement('span').style;style.cssText=attrs.style.replace(/var\(--study-highlight-strength,40%\)/g,node===math&&comments.some(c=>c.excerpt?.part)?'24%':'var(--study-highlight-strength,40%)');const localLines=cs.filter(c=>c.markStyle==='underline'&&!lineGroups.some(g=>g.comment.id===c.id));const localStyle=root.ownerDocument.createElement('span').style;localStyle.cssText=markAttributes(localLines.length?localLines:[{...cs[0],markStyle:'highlight'}]).style;for(const key of ['--critique-lines','--critique-lines-dark'])style.setProperty(key,localStyle.getPropertyValue(key));for(const key of ['--critique-lines','--critique-lines-dark'])style.setProperty(key,style.getPropertyValue(key).replace(/0 (\d+)px 0 /g,(_m,n)=>`inset 0 -${Number(n)+1}px 0 `));const values=[...Array(style.length)].map((_,i)=>style.item(i));const saved=values.map(key=>[key,node.style.getPropertyValue(key),node.style.getPropertyPriority(key)]);const previous=node.getAttribute('data-study-math-ids'),had=node.classList.contains('study-math-mark'),hadText=node.classList.contains('study-math-text');
  for(const key of values)node.style.setProperty(key,style.getPropertyValue(key));node.classList.add('study-math-mark');if(cs.some(c=>c.markStyle==='text'))node.classList.add('study-math-text');node.dataset.studyMathIds=cs.map(c=>c.id).join(' ');
  restore.push(()=>{for(const [k,v,p]of saved){if(v)node.style.setProperty(k,v,p);else node.style.removeProperty(k);}if(!had)node.classList.remove('study-math-mark');if(!hadText)node.classList.remove('study-math-text');if(previous===null)node.removeAttribute('data-study-math-ids');else node.setAttribute('data-study-math-ids',previous);if(!node.getAttribute('style'))node.removeAttribute('style');});
 }
 if(lineGroups.length){const overlay=root.ownerDocument.createElement('span');overlay.className='study-math-lines';root.append(overlay);
  const draw=()=>{overlay.replaceChildren();const base=overlay.getBoundingClientRect(),rootBox=root.getBoundingClientRect(),scale=rootBox.width/(root.offsetWidth||rootBox.width)||1;for(const [index,g]of lineGroups.entries()){const groups:{left:number;right:number;top:number;bottom:number}[]=[];for(const n of g.nodes){const r=n.getBoundingClientRect();if(!r.width)continue;let row=groups.find(x=>r.top<x.bottom&&r.bottom>x.top);if(row){row.left=Math.min(row.left,r.left);row.right=Math.max(row.right,r.right);row.top=Math.min(row.top,r.top);row.bottom=Math.max(row.bottom,r.bottom);}else groups.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom});}for(const r of groups){const line=root.ownerDocument.createElement('span');line.className='study-math-line';line.style.cssText=`left:${(r.left-base.left)/scale}px;top:${(r.bottom-base.top)/scale+1+index*3}px;width:${(r.right-r.left)/scale}px;--math-line-color:${safeColor(g.comment.color)};--math-line-dark:${darkCommentColor(g.comment)}`;overlay.append(line);}}};const win=root.ownerDocument.defaultView!;let frame=win.requestAnimationFrame(draw);const resize=new ResizeObserver(()=>{win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(draw);});resize.observe(root);resize.observe(math);if(root.parentElement)resize.observe(root.parentElement);const redraw=()=>{win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(draw);};win.addEventListener('resize',redraw);root.addEventListener('scroll',draw,true);restore.push(()=>{win.cancelAnimationFrame(frame);resize.disconnect();win.removeEventListener('resize',redraw);root.removeEventListener('scroll',draw,true);overlay.remove();});
 }
 painted.set(root,{signature,math,restore});
}
function liveEquation(view:EditorView,root:HTMLElement,qs:Equation[]){try{const pos=view.posAtDOM(root),latex=root.querySelector('mjx-math')?.getAttribute('data-latex');return qs.find(q=>q.from<=pos&&q.to>=pos);}catch{return;}}
function liveAnchor(view:EditorView,root:HTMLElement):MarginAnchor|undefined{const info=view.state.field(editorInfoField,false),raw=view.state.doc.toString(),q=liveEquation(view,root,equations(raw));if(!info?.file||!q)return;return {id:crypto.randomUUID(),path:info.file.path,quote:q.raw,before:raw.slice(Math.max(0,q.from-48),q.from),after:raw.slice(q.to,q.to+48),kind:'math'};}
export function selectedMathAnchor(markdown:MarkdownView):MarginAnchor|undefined {
 const selection=markdown.containerEl.ownerDocument.getSelection();if(!selection||selection.isCollapsed||!selection.rangeCount||!markdown.file)return;
 const range=selection.getRangeAt(0),start=range.startContainer.nodeType===1?range.startContainer as HTMLElement:range.startContainer.parentElement,root=start?.closest<HTMLElement>('.math'),math=root?.querySelector<HTMLElement>('mjx-math');
 if(!root||!math||!markdown.containerEl.contains(root)||!math.contains(range.startContainer)||!math.contains(range.endContainer))return;
 const cm=root.closest<HTMLElement>('.cm-editor'),view=cm?EditorView.findFromDOM(cm):undefined,anchor=view?liveAnchor(view,root):readingEquationAnchor(root,markdown.file.path);if(!anchor)return;
 const part=partFromRange(math,range);return {...anchor,...(part?{part,renderedQuote:'$'+part.nodes.map(n=>n.latex).join(' ')+'$'}:{})};
}
export function registerMathAnnotations(plugin:Plugin,store:ReviewStore){
 const livePainters=new Set<()=>void>();const refresh=(change?:ReviewChange)=>{if(!change||change.annotations)for(const p of livePainters)p();};store.listeners.add(refresh);plugin.register(()=>store.listeners.delete(refresh));
 plugin.registerEditorExtension(ViewPlugin.fromClass(class{
  frame=0;timer:ReturnType<typeof setTimeout>|undefined;observer:MutationObserver;cachedDoc:unknown;raw='';qs:Equation[]=[];
  constructor(readonly view:EditorView){livePainters.add(this.schedule);this.observer=new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n instanceof Element&&(n.matches('.math,mjx-container,mjx-math')||n.querySelector('mjx-container')))))this.schedule();});this.observer.observe(view.contentDOM,{childList:true,subtree:true});this.schedule();}
  update(u:import('obsidian-cm/view').ViewUpdate){if(u.docChanged){if(this.timer)clearTimeout(this.timer);this.timer=setTimeout(()=>{this.timer=undefined;this.schedule();},200);}else if(!this.timer&&(u.viewportChanged||u.geometryChanged))this.schedule();}
  schedule=()=>{if(this.timer)return;if(!this.frame)this.frame=this.view.dom.ownerDocument.defaultView!.requestAnimationFrame(()=>{this.frame=0;this.paint();});};
  paint(){const info=this.view.state.field(editorInfoField,false);if(!this.view.state.field(editorLivePreviewField,false)||!info?.file)return;const cs=store.data.comments.filter(c=>!c.resolved&&store.isAnnotationVisible(c)&&!c.questionId).flatMap(c=>excerpts(c).filter(a=>a.path===info.file!.path&&a.kind==='math').map(a=>({...c,excerpt:a})));if(!cs.length&&!this.view.contentDOM.querySelector('.study-math-mark'))return;
   if(this.cachedDoc!==this.view.state.doc){this.cachedDoc=this.view.state.doc;this.raw=this.view.state.doc.toString();this.qs=equations(this.raw);}const hits=cs.map(c=>({c,hit:locateMarginAnchor(this.raw,c.excerpt)}));
   for(const root of this.view.contentDOM.querySelectorAll<HTMLElement>('.math')){const q=liveEquation(this.view,root,this.qs);paintMathMarks(root,q?hits.filter(x=>x.hit?.from===q.from).map(x=>x.c):[]);}
  }
  destroy(){if(this.timer)clearTimeout(this.timer);this.observer.disconnect();livePainters.delete(this.schedule);if(this.frame)this.view.dom.ownerDocument.defaultView!.cancelAnimationFrame(this.frame);for(const root of this.view.contentDOM.querySelectorAll<HTMLElement>('.math'))clearMathMarks(root);}
 }));
 const attach=(doc:Document)=>{
  plugin.registerDomEvent(doc,'mouseover',event=>{const node=(event.target as HTMLElement).closest<HTMLElement>('[data-study-math-ids]');if(!node||node.closest('.study-margin-pane,.modal,.evidence-reader,.evidence-paper'))return;const ids=(node.dataset.studyMathIds??'').split(' '),cs=store.data.comments.filter(c=>ids.includes(c.id)&&!c.resolved);if(cs.length===1)store.hover(node,cs[0]);});
  plugin.registerDomEvent(doc,'contextmenu',event=>{const target=event.target as HTMLElement,root=target.closest<HTMLElement>('.math');if(!root||root.closest('.study-margin-pane,.evidence-reader,.evidence-paper,.modal'))return;const math=root.querySelector<HTMLElement>('mjx-math');if(!math)return;
   const cm=root.closest<HTMLElement>('.cm-editor'),view=cm?EditorView.findFromDOM(cm):undefined;const markdown=plugin.app.workspace.getLeavesOfType('markdown').map(l=>l.view).find(v=>v instanceof MarkdownView&&v.containerEl.contains(root)) as MarkdownView|undefined;
   const anchor=view?liveAnchor(view,root):markdown?.file?readingEquationAnchor(root,markdown.file.path):undefined;if(!anchor)return;
   const selection=doc.getSelection(),range=selection&&!selection.isCollapsed&&selection.rangeCount?selection.getRangeAt(0):undefined;const selected=!!range&&math.contains(range.startContainer)&&math.contains(range.endContainer);
   if(range&&!selected)return;const part=selected?partFromRange(math,range!):partAtTarget(math,target);const chosen={...anchor,...(part?{part,renderedQuote:'$'+part.nodes.map(n=>n.latex).join(' ')+'$'}:{})};
   const noteIds=new Set<string>();let ancestor:HTMLElement|null=target;while(ancestor&&root.contains(ancestor)){for(const id of (ancestor.dataset.studyMathIds??'').split(' '))if(id)noteIds.add(id);ancestor=ancestor.parentElement;}
   (event as MouseEvent&{studyMarginMenu?:boolean}).studyMarginMenu=true;event.preventDefault();const menu=Menu.forEvent(event),open=(a:MarginAnchor)=>store.edit({path:a.path,quote:a.quote,before:a.before,after:a.after,anchors:[a]});
   store.addMarkMenu(menu,{path:chosen.path,quote:chosen.quote,before:chosen.before,after:chosen.after,anchors:[chosen]});
   for(const c of store.data.comments.filter(c=>noteIds.has(c.id)&&!c.resolved))menu.addItem(i=>i.setSection('study-margin').setTitle('Open margin note: '+(c.comment||c.intent).slice(0,55)).onClick(()=>store.edit(c)));
   menu.addItem(i=>i.setSection('study-margin').setTitle(noteIds.size?(selected?'Add another comment on selection…':part?'Add another comment on this symbol…':'Add another comment on this equation…'):(selected?'Comment on selection…':part?'Comment on this symbol…':'Comment on this equation…')).onClick(()=>open(chosen)));
   menu.addItem(i=>i.setSection('study-margin').setTitle('Add selection to selected margin note').onClick(()=>store.addToMargin?.([chosen])));
   if(part)menu.addItem(i=>i.setSection('study-margin').setTitle('Comment on whole equation…').onClick(()=>open(anchor)));
  },true);
  plugin.registerDomEvent(doc,'click',event=>{const target=event.target as HTMLElement;if(!target.closest('.math')||!target.closest('.markdown-preview-view'))return;const selection=doc.getSelection();if(selection&&!selection.isCollapsed)return;const ids:string[]=[];let node:HTMLElement|null=target;while(node&&!node.matches('.markdown-preview-view,.cm-content')){for(const id of (node.dataset.studyMathIds??'').split(' '))if(id&&!ids.includes(id))ids.push(id);node=node.parentElement;}
   const cs=ids.flatMap(id=>store.data.comments.filter(c=>c.id===id&&!c.resolved));if(!cs.length)return;event.preventDefault();event.stopImmediatePropagation();if(cs.length===1)store.edit(cs[0]);else{const menu=new Menu();for(const c of cs)menu.addItem(i=>i.setTitle((c.intent||'Note')+': '+(c.comment||c.quote).slice(0,70)).onClick(()=>store.edit(c)));menu.showAtMouseEvent(event);}
  },true);
 };
 attach(document);plugin.registerEvent(plugin.app.workspace.on('window-open',(_win,win)=>attach(win.document)));
}
