import {locateQuote} from './review-model';
import type {Critique,MarginAnchor} from './review-model';

/** Sidecar placement for a post-it on a protected source. The post-it appears
 * after the last character of `quote`; the source text itself is never changed. */
export interface StickyPlacement {quote:string;before:string;after:string;renderedQuote?:string}
export type PlacedSticky=Critique&{placement?:StickyPlacement};

const CONTEXT=48,TAIL=160,EXTEND=640;

export function validPlacement(p:any):p is StickyPlacement{return !!p&&typeof p==='object'&&typeof p.quote==='string'&&p.quote.trim().length>0&&typeof p.before==='string'&&typeof p.after==='string'&&(p.renderedQuote===undefined||typeof p.renderedQuote==='string');}
/** Malformed external records are ignored rather than painted. */
export function placementOf(c:Critique|undefined):StickyPlacement|undefined{const p=(c as PlacedSticky|undefined)?.placement;return c?.kind==='sticky'&&validPlacement(p)?p:undefined;}

/** Runs of non-blank lines. Fenced code and display math stay whole; leading frontmatter is not a block. */
export function sourceBlocks(text:string):{from:number;to:number}[]{
 const blocks:{from:number;to:number}[]=[];let offset=0,fence='',math=false,start=-1,end=0,lineNo=0,front=false;
 const lines=text.split('\n');
 for(const line of lines){
  const from=offset,to=offset+line.length;offset=to+1;
  if(lineNo++===0&&line.trim()==='---'){front=true;continue;}
  if(front){if(line.trim()==='---'||line.trim()==='...')front=false;continue;}
  const f=/^\s*(`{3,}|~{3,})/.exec(line);
  if(f&&!math){if(!fence)fence=f[1][0];else if(f[1][0]===fence)fence='';}
  else if(!fence){const marks=(line.match(/\$\$/g)??[]).length;if(marks%2===1)math=!math;}
  const blank=!line.trim()&&!fence&&!math;
  if(blank){if(start>=0){blocks.push({from:start,to:end});start=-1;}continue;}
  if(start<0)start=from;end=to;
 }
 if(start>=0)blocks.push({from:start,to:end});
 return blocks;
}
export function nearestBlock(text:string,offset:number){const blocks=sourceBlocks(text);return blocks.find(b=>offset>=b.from&&offset<=b.to)??[...blocks].reverse().find(b=>b.to<=offset)??blocks.find(b=>b.from>=offset);}

function uniqueAt(text:string,p:StickyPlacement,start:number){const hit=locateQuote(text,p);return !!hit&&hit.from===start;}
/** Choose the shortest tail of [from,to) that, with its context, identifies exactly this position. */
function tailPlacement(text:string,from:number,to:number):StickyPlacement|undefined{
 for(let length=Math.min(TAIL,to-from);;length=Math.min(to-from+EXTEND,length*2)){
  const start=Math.max(0,to-length),p={quote:text.slice(start,to),before:text.slice(Math.max(0,start-CONTEXT),start),after:text.slice(to,to+CONTEXT)};
  if(p.quote.trim()&&uniqueAt(text,p,start))return p;
  if(start===0||length>=to-from+EXTEND)return;
 }
}
/** A selection anchors at its end; a caret anchors at the end of the nearest block. */
export function placementFor(text:string,from:number,to:number):StickyPlacement|undefined{
 let s=Math.max(0,Math.min(from,to)),e=Math.min(text.length,Math.max(from,to));
 while(s<e&&/\s/.test(text[s]))s++;while(e>s&&/\s/.test(text[e-1]))e--;
 if(e>s)return tailPlacement(text,s,e);
 const block=nearestBlock(text,s);return block?tailPlacement(text,block.from,block.to):undefined;
}
/** Use the end of a selection already anchored by the margin machinery, if it resolves in this text. */
export function placementFromAnchors(text:string,anchors:MarginAnchor[]|undefined):StickyPlacement|undefined{
 const a=[...(anchors??[])].reverse().find(a=>a.kind!=='math'&&!a.sectionSource&&a.quote.trim());if(!a)return;
 const hit=locateQuote(text,a);if(!hit)return;
 const p:StickyPlacement={quote:a.quote,before:a.before,after:a.after};if(a.renderedQuote&&a.renderedQuote!==a.quote)p.renderedQuote=a.renderedQuote;return p;
}
/** Offset immediately after the placement quote, or undefined when it is missing or ambiguous. */
export function locatePlacement(text:string,p:StickyPlacement){return locateQuote(text,p)?.to;}
export function endInRange(end:number,from:number,to:number){return end>from&&end<=to;}

const cache=new Map<string,{text:string;hits:Map<string,number|undefined>}>();
export function cachedPlacementEnd(path:string,text:string,p:StickyPlacement){
 let entry=cache.get(path);if(entry?.text!==text){entry={text,hits:new Map()};cache.delete(path);cache.set(path,entry);if(cache.size>6)cache.delete(cache.keys().next().value!);}
 const key=JSON.stringify([p.quote,p.before,p.after]);if(!entry.hits.has(key))entry.hits.set(key,locatePlacement(text,p));return entry.hits.get(key);
}
