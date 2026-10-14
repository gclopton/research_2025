import {citationText} from './citation-anchor';
export type TableFingerprintCell={text:string;rowspan:number;colspan:number;header:boolean};
/** Preserve every cell, span and header role; ignore presentational whitespace and typography only. */
export function canonicalTable(rows:TableFingerprintCell[][]):string {
 return JSON.stringify(rows.map(row=>row.map(c=>[citationText(c.text).text.trim(),c.rowspan,c.colspan,c.header])));
}
export function renderedTable(table:HTMLTableElement):string {
 return canonicalTable(Array.from(table.rows,r=>Array.from(r.cells,c=>{
  const copy=c.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('button,script,style,.study-sticky-placement,.study-comment-popover,.study-comment-editor').forEach(n=>n.remove());
  return {text:copy.textContent||'',rowspan:c.rowSpan,colspan:c.colSpan,header:c.tagName==='TH'};
 })));
}
/** Old records can relocate by source digest. New records can also tolerate presentation-only edits. */
export function locateTable(hashes:string[],fingerprints:string[],selection:{sha256?:string;tableFingerprint?:unknown}):number|null {
 const match=hashes.map((h,i)=>h===selection.sha256?i:-1).filter(i=>i>=0);
 if(match.length===1)return match[0];
 if(match.length>1)return null;
 if(typeof selection.tableFingerprint!=='string'||!/^([\da-f]{64})$/i.test(selection.tableFingerprint))return null;
 const formatted=fingerprints.map((h,i)=>h===selection.tableFingerprint?i:-1).filter(i=>i>=0);
 return formatted.length===1?formatted[0]:null;
}
