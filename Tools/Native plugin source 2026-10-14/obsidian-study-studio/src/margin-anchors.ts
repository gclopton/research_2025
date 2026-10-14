import {locateMarginAnchor} from './math-anchor-location';
import {partFromRange,partFromSource} from './math-parts';
import {Notice} from 'obsidian';
import type {MarkdownPostProcessorContext,MarkdownSectionInformation} from 'obsidian';
import {MarginAnchor,locateQuote} from './review-model';
import {equations} from './math-model';
const contexts=new WeakMap<HTMLElement,{path:()=>string;info:()=>MarkdownSectionInformation|null}>();
const sourceIndexes=new Map<string,{text:string;lines:number[];hits:Map<string,{from:number;to:number}|undefined>}>();
function index(path:string,text:string){let value=sourceIndexes.get(path);if(value?.text!==text){const lines=[0];let at=-1;while((at=text.indexOf('\n',at+1))>=0)lines.push(at+1);value={text,lines,hits:new Map()};sourceIndexes.set(path,value);if(sourceIndexes.size>4)sourceIndexes.delete(sourceIndexes.keys().next().value!);}return value!;}
export function registerReadingContext(el:HTMLElement,path:()=>string,ctx:MarkdownPostProcessorContext){contexts.set(el,{path,info:()=>ctx.getSectionInfo(el)});}
function sectionContext(root:HTMLElement){let el:HTMLElement|null=root;while(el){const context=contexts.get(el),info=context?.info();if(context&&info)return {context,info,el};el=el.parentElement?.closest<HTMLElement>('[data-study-comment-section]')??null;}}
function ownedText(root:HTMLElement){const walker=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n:Node|null,text='';while((n=walker.nextNode()))if(n.parentElement?.closest('[data-study-comment-section]')===root&&!n.parentElement.closest('code,pre,mjx-container,.math,button,input,textarea'))text+=n.textContent??'';return text;}
export function readingAnchorApplies(root:HTMLElement,a:MarginAnchor){const found=sectionContext(root);if(!found)return false;const {context,info,el}=found;if(el!==root&&!a.sectionSource)return false;const entry=index(context.path(),info.text),from=entry.lines[info.lineStart]??0,to=entry.lines[info.lineEnd+1]??info.text.length;
 if(a.sectionSource)return info.text.slice(from,to).trimEnd()===a.sectionSource.trimEnd()&&(!a.renderedRoot||a.renderedRoot===ownedText(root));
 const key=JSON.stringify([a.quote,a.before,a.after]);if(!entry.hits.has(key))entry.hits.set(key,locateMarginAnchor(info.text,a));const hit=entry.hits.get(key);return !!hit&&hit.from>=from&&hit.to<=to;
}
export function editorExcerpts(raw:string,from:number,to:number,path:string):MarginAnchor[]{
 const inside=equations(raw).find(q=>from>=q.bodyFrom&&to<=q.bodyTo);
 if(inside){const mj=(window as any).MathJax;try{const rendered=mj?.tex2chtml(inside.body,{display:inside.display}) as HTMLElement|undefined;const math=rendered?.querySelector<HTMLElement>('mjx-math');const part=math&&partFromSource(math,inside.body,from-inside.bodyFrom,to-inside.bodyFrom);if(part)return [{id:crypto.randomUUID(),path,quote:inside.raw,before:raw.slice(Math.max(0,inside.from-48),inside.from),after:raw.slice(inside.to,inside.to+48),kind:'math',part,renderedQuote:'$'+part.nodes.map(n=>n.latex).join(' ')+'$'}];}catch{/* Preserve the equation when its semantic tree cannot be mapped. */}new Notice('Select this part in rendered math, then right-click to add a note.');return [];}
 const result:MarginAnchor[]=[];const selection=raw.slice(from,to);let start=0;
 const add=(end:number)=>{const part=selection.slice(start,end);if(part.trim()){const a=from+start,b=from+end;result.push({id:crypto.randomUUID(),path,quote:part,before:raw.slice(Math.max(0,a-48),a),after:raw.slice(b,b+48),kind:equations(part).some(q=>q.raw.trim()===part.trim())?'math':'text'});}};
 for(const match of selection.matchAll(/\n\s*\n/g)){add(match.index!);start=match.index!+match[0].length;}add(selection.length);return result;
}
function sourceAnchor(path:string,info:MarkdownSectionInformation,quote:string,before:string,after:string,pieces:string[]):MarginAnchor{
 const entry=index(path,info.text),from=entry.lines[info.lineStart]??0,to=entry.lines[info.lineEnd+1]??info.text.length,section=info.text.slice(from,to);
 let hit=locateQuote(section,{quote,before,after});
 // A formatted selection can span Markdown delimiters. Unique boundary text
 // identifies the source interval while its rendered quotation is retained.
 if(!hit&&pieces.length>1){const first=locateQuote(section,{quote:pieces[0],before,after:''}),last=locateQuote(section,{quote:pieces.at(-1)!,before:'',after});if(first&&last&&first.from<=last.from)hit={from:first.from,to:last.to};}
 const a:MarginAnchor={id:crypto.randomUUID(),path,quote:hit?section.slice(hit.from,hit.to):quote,before:hit?info.text.slice(Math.max(0,from+hit.from-48),from+hit.from):before,after:hit?info.text.slice(from+hit.to,from+hit.to+48):after,renderedQuote:quote,renderedBefore:before,renderedAfter:after,kind:'text'};
 if(!hit)a.sectionSource=section;return a;
}
export function readingExcerpts(selection:Selection,path:string):MarginAnchor[]{
 if(!selection.rangeCount||selection.isCollapsed)return [];const range=selection.getRangeAt(0),doc=range.startContainer.ownerDocument!;
 const preview=(range.startContainer.parentElement??doc.body).closest('.markdown-preview-view')??doc.body,result:MarginAnchor[]=[];
 for(const root of Array.from(preview.querySelectorAll<HTMLElement>('[data-study-comment-section]'))){
  if(!range.intersectsNode(root))continue;const found=sectionContext(root);if(!found||found.context.path()!==path)continue;const {info}=found;
  const walker=doc.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null,raw='',selected='',first=-1,last=0;const pieces:string[]=[];
  while((node=walker.nextNode())){const parent=node.parentElement;if(parent?.closest('[data-study-comment-section]')!==root||parent.closest('code,pre,mjx-container,.math,button,input,textarea'))continue;const text=node.textContent??'';
   if(range.intersectsNode(node)){const start=node===range.startContainer?range.startOffset:0,end=node===range.endContainer?range.endOffset:text.length;const piece=text.slice(start,end);if(piece){if(first<0)first=raw.length+start;last=raw.length+end;selected+=piece;pieces.push(piece);}}
   raw+=text;
  }
  if(selected.trim()){const anchor=sourceAnchor(path,info,selected,raw.slice(Math.max(0,first-48),first),raw.slice(last,last+48),pieces);if(found.el!==root){const ix=index(path,info.text);anchor.sectionSource=info.text.slice(ix.lines[info.lineStart]??0,ix.lines[info.lineEnd+1]??info.text.length);anchor.renderedRoot=raw;}result.push(anchor);}
  const math=Array.from(root.querySelectorAll<HTMLElement>('.math')).filter(el=>el.closest('[data-study-comment-section]')===root);const entry=index(path,info.text),offset=entry.lines[info.lineStart]??0,section=info.text.slice(offset,entry.lines[info.lineEnd+1]??info.text.length),qs=equations(section);
  math.forEach((el,i)=>{if(range.intersectsNode(el)&&qs[i]){const q=qs[i],from=offset+q.from,to=offset+q.to;result.push({id:crypto.randomUUID(),path,quote:q.raw,before:info.text.slice(Math.max(0,from-48),from),after:info.text.slice(to,to+48),kind:'math',...(el.contains(range.startContainer)&&el.contains(range.endContainer)?{part:partFromRange(el.querySelector<HTMLElement>('mjx-math')!,range)}:{})});}});
 }
 return result;
}
export function readingMathTargets(root:HTMLElement,a:MarginAnchor):HTMLElement[]{const context=contexts.get(root),info=context?.info();if(!info)return [];const entry=index(a.path,info.text),offset=entry.lines[info.lineStart]??0,qs=equations(info.text.slice(offset,entry.lines[info.lineEnd+1]??info.text.length));const elements=Array.from(root.querySelectorAll<HTMLElement>('.math')).filter(el=>el.closest('[data-study-comment-section]')===root);const hit=locateMarginAnchor(info.text,a);return qs.flatMap((q,i)=>hit&&offset+q.from===hit.from&&elements[i]?[elements[i]]:[]);}

export function readingEquationAnchor(math:HTMLElement,path:string):MarginAnchor|undefined{const root=math.closest<HTMLElement>('[data-study-comment-section]');if(!root)return;const found=sectionContext(root);if(!found||found.context.path()!==path)return;const {info}=found,entry=index(path,info.text),offset=entry.lines[info.lineStart]??0,qs=equations(info.text.slice(offset,entry.lines[info.lineEnd+1]??info.text.length));const elements=Array.from(root.querySelectorAll<HTMLElement>('.math')).filter(el=>el.closest('[data-study-comment-section]')===root);const q=qs[elements.indexOf(math)];if(!q)return;const from=offset+q.from,to=offset+q.to;return {id:crypto.randomUUID(),path,quote:q.raw,before:info.text.slice(Math.max(0,from-48),from),after:info.text.slice(to,to+48),kind:'math'};}

export function readingInsertion(selection:Selection,path:string){if(!selection.rangeCount)return;const range=selection.getRangeAt(0),root=range.endContainer.parentElement?.closest<HTMLElement>('[data-study-comment-section]');if(!root)return;const found=sectionContext(root);if(!found||found.context.path()!==path)return;const {info}=found,entry=index(path,info.text);return {text:info.text,offset:entry.lines[info.lineEnd+1]??info.text.length};}
