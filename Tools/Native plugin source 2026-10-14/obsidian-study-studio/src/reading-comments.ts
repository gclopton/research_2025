import {paintMathMarks,clearMathMarks} from './math-annotations';
import {Menu} from 'obsidian';
import {commentSegments,renderedQuote,markAttributes,markClass} from './comment-marks';
import {readingMathTargets} from './margin-anchors';
import {Critique,MarginAnchor,locateQuote,safeColor,darkCommentColor} from './review-model';

const sectionSelector='[data-study-comment-section]';
const markSelector='[data-study-reading-comment]';
export function readingMarks(root:HTMLElement):HTMLElement[]{
 return Array.from(root.querySelectorAll<HTMLElement>(markSelector)).filter(mark=>mark.parentElement?.closest(sectionSelector)===root);
}
export function hasReadingSelection(root:HTMLElement){
 const selection=root.ownerDocument.getSelection();
 return !!selection&&!selection.isCollapsed&&(root.contains(selection.anchorNode)||root.contains(selection.focusNode));
}
export function readingText(root:HTMLElement){
 const walker=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_TEXT);let text='',node:Node|null;
 while((node=walker.nextNode())){const parent=node.parentElement;if(parent?.closest(sectionSelector)===root&&!parent.closest('code,pre,mjx-container,.math,button,input,textarea'))text+=node.textContent??'';}
 return text;
}
/** Replace only annotation spans. Figures, math, links and their event handlers retain identity. */
export function paintReadingComments(root:HTMLElement,comments:(Critique&{excerpt?:MarginAnchor})[],handlers:{hover:(mark:HTMLElement,c:Critique)=>void;edit:(c:Critique)=>void}){
 const parents=new Set<Node>();
 for(const mark of readingMarks(root)){
  mark.dispatchEvent(new Event('mouseleave'));
  if(mark.parentNode)parents.add(mark.parentNode);
  mark.replaceWith(...Array.from(mark.childNodes));
 }
 for(const parent of parents){for(let node=parent.firstChild;node;node=node.nextSibling){if(node.nodeType===Node.TEXT_NODE)while(node.nextSibling?.nodeType===Node.TEXT_NODE){node.textContent=(node.textContent??'')+(node.nextSibling.textContent??'');node.nextSibling.remove();}}}
 const activate=(mark:HTMLElement,cs:Critique[],event:Event)=>{event.preventDefault();event.stopPropagation();if(cs.length===1){handlers.edit(cs[0]);return;}const menu=new Menu();for(const c of cs)menu.addItem(item=>item.setTitle((c.intent||'Note')+': '+(c.comment||c.quote).slice(0,70)).onClick(()=>handlers.edit(c)));const box=mark.getBoundingClientRect();menu.showAtPosition({x:box.left,y:box.bottom});};
 const decorate=(mark:HTMLElement,cs:Critique[])=>{mark.className=markClass(cs);for(const [k,v]of Object.entries(markAttributes(cs)))mark.setAttribute(k,v);mark.dataset.studyReadingComment=cs[0].id;mark.tabIndex=0;mark.setAttribute('role','button');mark.setAttribute('aria-description',cs.length>1?`Choose from ${cs.length} margin notes`:'Open margin note');if(cs.length>1)mark.title=`${cs.length} notes: `+cs.map(c=>c.intent||'Note').join(' · ');mark.onclick=e=>activate(mark,cs,e);mark.onkeydown=e=>{if(e.key==='Enter')activate(mark,cs,e);};if(cs.length===1)mark.onmouseenter=()=>handlers.hover(mark,cs[0]);};
 const mathTargets=new Map<HTMLElement,(Critique&{excerpt?:MarginAnchor})[]>();
 for(const c of comments.filter(c=>c.excerpt?.kind==='math'))for(const target of readingMathTargets(root,c.excerpt!)){const list=mathTargets.get(target)??[];if(!list.some(x=>x.id===c.id))list.push(c);mathTargets.set(target,list);}
 for(const target of root.querySelectorAll<HTMLElement>('.math'))if(target.closest(sectionSelector)===root)paintMathMarks(target,mathTargets.get(target)??[]);
 const walker=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes:Text[]=[];let node:Node|null;
 while((node=walker.nextNode())){const parent=node.parentElement;if(parent?.closest(sectionSelector)===root&&!parent.closest('code,pre,mjx-container,.math,.study-critique,button,input,textarea'))nodes.push(node as Text);}
 const raw=nodes.map(n=>n.data).join('');const ranges=comments.filter(c=>c.excerpt?.kind!=='math').flatMap(c=>{const at=renderedQuote(raw,c);return at?[{...at,comment:c}]:[];});const segments=commentSegments(ranges);let offset=0;
 for(const original of nodes){const length=original.length,end=offset+length;let tail=original,consumed=0;
  for(const segment of segments){const start=Math.max(segment.from,offset)-offset,stop=Math.min(segment.to,end)-offset;if(stop<=start)continue;
   const piece=tail.splitText(start-consumed);tail=piece.splitText(stop-start);consumed=stop;const mark=root.ownerDocument.createElement('span');decorate(mark,segment.comments);piece.replaceWith(mark);mark.append(piece);
  }offset=end;
 }
}
