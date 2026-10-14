import {parseDocument,stringify} from 'yaml';
export interface Paint {color?:string;darkColor?:string;opacity?:number;comment?:string}
export interface Selection extends Paint {quote?:string;before?:string;after?:string;image?:string;table?:number;whole?:boolean;rect?:number[];cells?:number[][];sha256?:string}
export interface Paper {citekey:string;label:string;path:string;selections:Selection[]}
export interface Claim {label:string;papers:Paper[];citedFrom?:{vault:string;path:string;heading?:string}}
export interface EvidenceRecords {version:1;claims:Record<string,Claim>}
export const safePath=(path:string)=>typeof path==='string'&&!!path&&!path.startsWith('/')&&!path.includes('\\')&&!path.split('/').includes('..')&&!/^[a-z]+:/i.test(path);
export function validateSelection(s:Selection){
 if(!s||[s.quote!==undefined,s.image!==undefined,s.table!==undefined].filter(Boolean).length!==1)throw Error('Choose exactly one text, image or table target.');
 for(const color of [s.color,s.darkColor])if(color!==undefined&&!/^#[\da-f]{6}$/i.test(color))throw Error('Colors must be six-digit hexadecimal values.');
 if(s.opacity!==undefined&&(!Number.isFinite(s.opacity)||s.opacity<0||s.opacity>1))throw Error('Opacity must be between 0 and 1.');
 for(const t of [s.quote,s.before,s.after,s.comment])if(t!==undefined&&typeof t!=='string')throw Error('Quote, context and comment must be text.');
 if(s.quote!==undefined&&!s.quote.trim())throw Error('Empty quotation.');
 if(s.image!==undefined&&!safePath(s.image))throw Error('Image path must stay within the source directory.');
 if(s.table!==undefined&&(!Number.isInteger(s.table)||s.table<1))throw Error('Tables are numbered from 1.');
 if(s.rect&& (s.rect.length!==4||s.rect.some(n=>!Number.isFinite(n)||n<0||n>1)||s.rect[2]<=0||s.rect[3]<=0||s.rect[0]+s.rect[2]>1.000001||s.rect[1]+s.rect[3]>1.000001))throw Error('Invalid rectangle.');
 if(s.cells&&(!Array.isArray(s.cells)||!s.cells.length||s.cells.some(c=>!Array.isArray(c)||c.length!==2||c.some(n=>!Number.isInteger(n)||n<1))))throw Error('Cells use [row, column], numbered from 1.');
 if(s.image&&!s.whole&&!s.rect)throw Error('Image needs whole: true or rect.');
 if(s.table&&!s.whole&&!s.cells)throw Error('Table needs whole: true or cells.');
 if((s.image||s.table)&&!/^([\da-f]{64})$/i.test(s.sha256||''))throw Error('Figure/table requires sha256; save it using the source menu to calculate this.');
}
export function readRecords(raw:string):EvidenceRecords {
 const d=parseDocument(raw,{uniqueKeys:true});if(d.errors.length)throw Error(d.errors[0].message);const r=d.toJS({maxAliasCount:0}) as EvidenceRecords;
 if(!r||r.version!==1||!r.claims||Array.isArray(r.claims)||typeof r.claims!=='object')throw Error('Expected version: 1 and a claims mapping.');
 for(const [id,c] of Object.entries(r.claims)){
  if(['__proto__','constructor','prototype'].includes(id)||!/^[\w-]+$/.test(id)||!c||typeof c.label!=='string'||!Array.isArray(c.papers)||!c.papers.length)throw Error(`Invalid claim ${id}`);
  const keys=new Set<string>();for(const p of c.papers){if(!p||typeof p.citekey!=='string'||!p.citekey||keys.has(p.citekey)||typeof p.label!=='string'||!safePath(p.path)||!p.path.endsWith('.md')||!Array.isArray(p.selections)||!p.selections.length)throw Error(`Invalid or duplicate paper in ${id}`);keys.add(p.citekey);for(const s of p.selections){try{validateSelection(s);}catch(e){throw Error(`${id} / ${p.citekey}: ${e instanceof Error?e.message:String(e)}`);}}}
 }return r;
}
export const writeRecords=(r:EvidenceRecords)=>stringify(r,{lineWidth:0});
export function recordURI(vault:string,file:string,id:string,keys:string[]=[],window=true){return 'obsidian://study-evidence?'+Object.entries({vault,file,id,...(keys.length?{keys:keys.join('|')}:{ }),window:String(window)}).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&');}
export const normalized=(s:string)=>s.replace(/\s+/g,' ').trim();
export function findPassage(raw:string,s:Selection){
 const q=normalized(s.quote||'');if(!q)return null;const found:number[]=[];let at=-1;
 while((at=raw.indexOf(q,at+1))>=0){if(s.before&&!raw.slice(0,at).trimEnd().endsWith(normalized(s.before)))continue;if(s.after&&!raw.slice(at+q.length).trimStart().startsWith(normalized(s.after)))continue;found.push(at);}
 return found.length===1?{from:found[0],to:found[0]+q.length}:null;
}
export function sameKeys(a:string[],b:string[]){return a.length===b.length&&[...a].sort().every((k,i)=>k===[...b].sort()[i]);}
export async function digest(data:string|ArrayBuffer){const bytes=typeof data==='string'?new TextEncoder().encode(data):data;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');}

export function tableSources(raw:string):string[]{return [...raw.matchAll(/^\|[^\n]+\|\r?\n\|[ :|\-]+\|(?:\r?\n\|[^\n]*\|)*|<table[\s\S]*?<\/table>/gm)].map(m=>m[0]);}
export function renderablePaper(raw:string){return raw.replace(/([^\n])\n(\|[^\n]+\|\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+[ \t]*(?=\r?$))/gm,'$1\n\n$2');}
/** Hide only a fallback attached to the exact Pandoc citation occurrence. */
export function linkedEvidence(text:string){
 const matches:{from:number;to:number;href:string;citeFrom:number;citeTo:number;keys:string[]}[]=[];
 for(const m of text.matchAll(/\[([^\]\n]*@[^\]\n]+)\]\s*(\[[^\]\n]*\]\((obsidian:\/\/study-evidence[^)\n]+)\))/g)){
  try{const uri=new URL(m[3]),keys=[...m[1].matchAll(/@([\w:.+/-]+)/g)].map(x=>x[1]);if(!keys.length||!sameKeys(keys,(uri.searchParams.get('keys')||'').split('|')))continue;const from=m.index!+m[0].lastIndexOf(m[2]);matches.push({from,to:from+m[2].length,href:m[3],citeFrom:m.index!,citeTo:m.index!+m[1].length+2,keys});}catch{}
 }return matches;
}
