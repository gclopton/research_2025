/** Stable MathJax semantic anchors. Layout wrappers and line-break nodes are ignored. */
import {mathSignature,mathParentSignature,semanticMatches,latexSignature} from './math-semantic';
export interface MathPartNode {latex:string;parentLatex:string;occurrence:number;semantic?:{key:string;parent:string;occurrence:number;count:number}}
export interface MathPart {nodes:MathPartNode[]}
function validSemantic(s:any){return s===undefined||!!s&&typeof s.key==='string'&&typeof s.parent==='string'&&Number.isSafeInteger(s.occurrence)&&Number.isSafeInteger(s.count)&&s.occurrence>=0&&s.count>s.occurrence;}
export function validMathPart(p:any):p is MathPart{return !!p&&Array.isArray(p.nodes)&&p.nodes.length>0&&p.nodes.length<=128&&p.nodes.every((n:any)=>n&&typeof n.latex==='string'&&typeof n.parentLatex==='string'&&Number.isSafeInteger(n.occurrence)&&n.occurrence>=0&&validSemantic(n.semantic));}
export function semanticNodes(math:Element){return Array.from(math.querySelectorAll<HTMLElement>('[data-latex]'));}
function parentLatex(node:Element){return node.parentElement?.closest('[data-latex]')?.getAttribute('data-latex')?.trim()??'';}
export function describePart(math:Element,nodes:HTMLElement[]):MathPart{
 const all=semanticNodes(math);return {nodes:nodes.map(n=>{const latex=n.getAttribute('data-latex')!.trim(),parent=parentLatex(n),key=mathSignature(n),parentKey=mathParentSignature(n),matches=semanticMatches(math,key,parentKey),ordinal=matches.findIndex(x=>x===n||x.contains(n));return {latex,parentLatex:parent,occurrence:all.filter(x=>x.getAttribute('data-latex')?.trim()===latex&&parentLatex(x)===parent).indexOf(n),...(ordinal>=0?{semantic:{key,parent:parentKey,occurrence:ordinal,count:matches.length}}:{})};})};
}
export function resolvePart(math:Element,part:MathPart):HTMLElement[]{const all=semanticNodes(math);const found=part.nodes.map(n=>{
 const exact=all.filter(x=>x.getAttribute('data-latex')?.trim()===n.latex.trim()&&parentLatex(x)===n.parentLatex.trim())[n.occurrence];if(exact)return exact;
 const key=n.semantic?.key??latexSignature(n.latex,math.ownerDocument),parent=n.semantic?.parent??latexSignature(n.parentLatex,math.ownerDocument);if(!key||parent===undefined)return;
 const matches=semanticMatches(math,key,parent);if(n.semantic)return matches.length===n.semantic.count?matches[n.semantic.occurrence]:undefined;
 return matches.length===1&&n.occurrence===0?matches[0]:undefined;
 });if(!found.every(Boolean))return [];const nodes=found as HTMLElement[];return nodes.every((n,i)=>!i||!!(nodes[i-1].compareDocumentPosition(n)&4))?nodes:[];}
function selectedGlyphs(math:Element,range:Range){return Array.from(math.querySelectorAll<HTMLElement>('mjx-c')).filter(n=>{const r=n.ownerDocument.createRange();r.selectNodeContents(n);return range.compareBoundaryPoints(Range.END_TO_START,r)<0&&range.compareBoundaryPoints(Range.START_TO_END,r)>0;});}
export function partFromRange(math:HTMLElement,range:Range):MathPart|undefined{
 const glyphs=selectedGlyphs(math,range);if(!glyphs.length)return;
 const selected=new Set(glyphs);const covered=(n:Element)=>{const g=[...n.querySelectorAll('mjx-c')];return g.length>0&&g.every(x=>selected.has(x as HTMLElement));};
 // Promote only fully covered structures; a partial number snaps to its token.
 const picked=new Set<HTMLElement>();for(const glyph of glyphs){let n=glyph.closest<HTMLElement>('[data-latex]');if(!n||n===math)continue;let p=n.parentElement?.closest<HTMLElement>('[data-latex]');while(p&&p!==math&&math.contains(p)&&covered(p)){n=p;p=n.parentElement?.closest<HTMLElement>('[data-latex]');}picked.add(n);}
 const nodes=[...picked].filter(n=>![...picked].some(p=>p!==n&&p.contains(n)));
 if(covered(math))return;return nodes.length?describePart(math,nodes):undefined;
}
export function partAtTarget(math:HTMLElement,target:Element):MathPart|undefined{const n=target.closest<HTMLElement>('[data-latex]');return n&&n!==math&&math.contains(n)?describePart(math,[n]):undefined;}
/** Map source selections through the same semantic tree. Offsets remain in original TeX. */
export function partFromSource(math:HTMLElement,body:string,from:number,to:number):MathPart|undefined{
 let failed=false;const ranges=new Map<HTMLElement,{from:number;to:number}>();
 const canon=(s:string)=>{let text='',positions:number[]=[];for(let i=0;i<s.length;i++)if(!/[\s{}]/.test(s[i])){text+=s[i];positions.push(i);}return {text,positions};};
 const visit=(parent:HTMLElement,start:number,end:number)=>{const children=semanticNodes(parent).filter(n=>n.parentElement?.closest('[data-latex]')===parent);let cursor=start;
  for(const n of children){const value=canon(n.getAttribute('data-latex')??'').text,available=canon(body.slice(cursor,end));if(!value)continue;const at=available.text.indexOf(value);if(at<0){failed=true;return;}const a=cursor+available.positions[at],b=cursor+available.positions[at+value.length-1]+1;ranges.set(n,{from:a,to:b});visit(n,a,b);cursor=b;}
 };visit(math,0,body.length);if(failed)return;
 const chosen=[...ranges].filter(([n,r])=>r.from<to&&r.to>from&&!semanticNodes(n).some(child=>{const c=ranges.get(child);return c&&c.from<to&&c.to>from;})).map(([n])=>n);
 if(!chosen.length)return;const picked=new Set(chosen);for(const n of chosen){let p=n.parentElement?.closest<HTMLElement>('[data-latex]');while(p&&p!==math){const r=ranges.get(p);if(!r||r.from<from||r.to>to)break;picked.add(p);p=p.parentElement?.closest<HTMLElement>('[data-latex]');}}
 const nodes=[...picked].filter(n=>![...picked].some(p=>p!==n&&p.contains(n)));const selected=canon(body.slice(from,to)).text;const valid=nodes.every(n=>{const v=canon(n.getAttribute('data-latex')??'').text;return selected.includes(v)||v.includes(selected);});return nodes.length&&valid?describePart(math,nodes):undefined;
}
