export interface EvidencePassage {quote:string; comment?:string}
export interface EvidenceArea {kind:'image'|'table'; target:string; rect:[number,number,number,number]; comment?:string}
export interface EvidenceTarget {path:string; passages:EvidencePassage[]; areas?:EvidenceArea[]; window?:boolean}
export function parseEvidence(raw:string):EvidenceTarget {
 const v=JSON.parse(raw);
 if(!v||typeof v.path!=='string'||!v.path.endsWith('.md')||v.path.startsWith('/')||v.path.split('/').includes('..')||!Array.isArray(v.passages)||(!v.passages.length&&!v.areas?.length)||v.passages.length>30)throw Error('Invalid evidence link');
 for(const p of v.passages)if(!p||typeof p.quote!=='string'||!p.quote.trim()||p.quote.length>20000||(p.comment!==undefined&&typeof p.comment!=='string'))throw Error('Invalid evidence passage');
 if(v.areas!==undefined){if(!Array.isArray(v.areas)||v.areas.length>30)throw Error('Invalid evidence areas');for(const a of v.areas){if(!a||!['image','table'].includes(a.kind)||typeof a.target!=='string'||!a.target||!Array.isArray(a.rect)||a.rect.length!==4||a.rect.some((n:unknown)=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>1)||a.rect[2]<=0||a.rect[3]<=0||a.rect[0]+a.rect[2]>1.000001||a.rect[1]+a.rect[3]>1.000001||(a.comment!==undefined&&typeof a.comment!=='string'))throw Error('Invalid evidence area');}}
 return v;
}
/** Refuse ambiguous matches: selecting the wrong evidence is worse than no highlight. */
export function uniquePassage(text:string,quote:string):{from:number;to:number}|null {
 const from=text.indexOf(quote);return from<0||text.indexOf(quote,from+1)>=0?null:{from,to:from+quote.length};
}
export function evidenceURI(vault:string,target:EvidenceTarget):string {
 return `obsidian://study-evidence?vault=${encodeURIComponent(vault)}&target=${encodeURIComponent(JSON.stringify(target))}`;
}
