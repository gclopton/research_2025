import {citationText} from './citation-anchor';
export interface CitationIdentity {file:string;id:string;raw:string}
export interface ReviewSelection {quote?:string;before?:string;after?:string;image?:string;table?:number;[key:string]:unknown}
export function sourceTableLocations(source:string,tables:string[]){
 let cursor=0;return tables.map((raw,i)=>{const at=source.indexOf(raw,cursor);if(at<0)throw Error('Table source location unavailable.');cursor=at+raw.length;const fromLine=source.slice(0,at).split('\n').length;return {tableNumber:i+1,fromLine,toLine:fromLine+raw.split('\n').length-1,raw};});
}
function fenced(text:string,language:string){const longest=Math.max(0,...Array.from(text.matchAll(/`+/g),m=>m[0].length));const fence='`'.repeat(Math.max(4,longest+1));return [fence+language,text,fence];}
export function citationCandidates(source:string,quote:string){
 const terms=(s:string)=>new Set(citationText(s).text.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
 const wanted=terms(quote);if(!wanted.size)return [];
 const lines=source.split('\n'),parts:{fromLine:number;toLine:number;excerpt:string;overlap:number}[]=[];
 let start=0,inFence=false,fence='';
 for(let i=0;i<=lines.length;i++){
  const line=lines[i]||'',opening=line.match(/^\s*(`{3,}|~{3,})/);
  if(opening){if(!inFence){inFence=true;fence=opening[1][0];}else if(opening[1][0]===fence)inFence=false;start=i+1;continue;}
  if(inFence){start=i+1;continue;}
  if(!line.trim()||i===lines.length){
   const raw=lines.slice(start,i).join('\n');
   if(raw.trim()){
    const found=terms(raw),overlap=[...wanted].filter(t=>found.has(t)).length/wanted.size;
    if(overlap>=.5)parts.push({fromLine:start+1,toLine:i,excerpt:raw.slice(0,2400),overlap});
   }start=i+1;
  }
 }
 return parts.sort((a,b)=>b.overlap-a.overlap||a.fromLine-b.fromLine).slice(0,3).map(({overlap,...p})=>({...p,verified:false,method:'shared words; inspect original source before accepting'}));
}
export function reportIssues(source:string,selections:ReviewSelection[],messages:string[]){
 return messages.map(message=>{
  const index=Number(message.match(/^Selection (\d+):/)?.[1])-1,s=selections[index];
  return {selectionNumber:index+1,reason:message.replace(/^Selection \d+:\s*/,''),kind:s?.quote?'text':s?.image?'figure':'table',savedSelection:s,
   candidatePassages:s?.quote?citationCandidates(source,s.quote):[],
   sourceMentions:s?.image?source.split('\n').flatMap((line,i)=>line.includes(String(s.image))?[{line:i+1,text:line.slice(0,1200)}]:[]):[]};
 });
}
export function reviewMarkdown(report:{generatedAt:string;identity:{recordPath:string;claimId:string;citekey:string;sourcePath:string};recordSha256:string;sourceSha256:string;recordChangedSinceOpen:boolean;issues:ReturnType<typeof reportIssues>},jsonName:string){
 const out=['# Citation source review','',`Generated ${report.generatedAt}. This report covers one source paper, not the whole vault.`,
 '',`Source: ${report.identity.sourcePath}`,`Citation record: ${report.identity.recordPath}`,`Claim: ${report.identity.claimId}`,`Citekey: ${report.identity.citekey}`,
 '',`Machine-readable report: [[${jsonName}]]`,'',`Record SHA256: ${report.recordSha256}`,`Source SHA256: ${report.sourceSha256}`,
 '',report.recordChangedSinceOpen?'The citation record changed since the viewer opened. Reopen it before making repairs.':'The citation record still matches the version reviewed.',
 '', 'Before editing, verify both file hashes. Keep the saved quotation and annotation metadata. Candidate passages are search suggestions, not verified replacements. Do not silently accept changed numbers, signs, negation, units, or ambiguous duplicates. After a repair, reopen the viewer and regenerate this report.'];
 if(!report.issues.length)out.push('','No flagged selections in this source.');
 for(const issue of report.issues){out.push('',`## Selection ${issue.selectionNumber} — ${issue.kind}`,'',issue.reason,'','Saved selection:','', ...fenced(JSON.stringify(issue.savedSelection,null,2),'json'));for(const c of issue.candidatePassages)out.push('',`Candidate, source lines ${c.fromLine}–${c.toLine} — unverified:`, '', ...fenced(c.excerpt,'markdown'));for(const m of issue.sourceMentions)out.push('',`Source image reference, line ${m.line}:`,'',...fenced(m.text,'markdown'));}
 return out.join('\n')+'\n';
}
