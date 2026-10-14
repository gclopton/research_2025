/** Citation parsing and bibliography planning, independent of the Obsidian UI. */
export interface CiteMember {key:string;prefix:string;suffix:string}
export interface CiteOccurrence {from:number;to:number;raw:string;members:CiteMember[];evidence?:string}
export interface CSLItem {id:string;title?:string;author?:{family?:string;given?:string;literal?:string}[];editor?:{family?:string;given?:string;literal?:string}[];issued?:{'date-parts'?:Array<Array<string|number>>};'container-title'?:string;'container-title-short'?:string;volume?:string;issue?:string;page?:string;publisher?:string;'publisher-place'?:string;DOI?:string;URL?:string;type?:string}
export interface Reference {key:string;number:number;item?:CSLItem;short:string;full:string;url?:string;occurrences:{slide:string;href:string}[]}
export function plain(value:unknown):string {return typeof value==='string'?value.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim():'';}
const keyPattern='[\\p{L}\\p{N}_][\\p{L}\\p{N}:.#$%&+?~_/-]*';
export function citations(text:string):CiteOccurrence[]{
  // Preserve positions while excluding literal code, math, links and custom code links.
  let masked=text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*(?:\n|$)/gm,m=>' '.repeat(m.length))
    .replace(/(`+)[^\n]*?\1|\$\$[\s\S]*?\$\$|(?<!\\)\$[^\n$]+\$|<!--[^]*?-->|\{\{[^]*?\}\}|!?\[\[[^\n]*?\]\]|!?\[[^\]\n]*\]\([^\n]*?\)/g,m=>' '.repeat(m.length));
  const found:CiteOccurrence[]=[];
  const group=new RegExp('(?<![\\\\!])\\[([^\\]\\n]*@[^\\]\\n]+)\\]','gu');
  for(const m of masked.matchAll(group)){
    const members:CiteMember[]=[];let valid=true;
    for(const part of m[1].split(';')){
      const matches=[...part.matchAll(new RegExp('@('+keyPattern+')','gu'))];
      if(matches.length!==1){valid=false;break;}
      const k=matches[0],key=k[1].replace(/[.:,!?]+$/,'');
      members.push({key,prefix:part.slice(0,k.index).replace(/-$/,'').trim(),suffix:part.slice(k.index!+1+key.length).trim()});
    }
    if(!valid||!members.length)continue;
    const from=m.index!,end=from+m[0].length,tail=text.slice(end).match(/^\s*\[[^\]\n]*\]\((obsidian:\/\/study-evidence[^)\n]+)\)/);
    let evidence:string|undefined,to=end;
    if(tail)try{const keys=(new URL(tail[1]).searchParams.get('keys')||'').split('|').sort(),cited=members.map(c=>c.key).sort();if(JSON.stringify(keys)===JSON.stringify(cited)){evidence=tail[1];to+=tail[0].length;}}catch{}
    found.push({from,to,raw:text.slice(from,end),members,evidence});
  }
  const bare=new RegExp('(?<![\\w@\\\\/])@('+keyPattern+')','gu');
  for(const m of masked.matchAll(bare)){
    if(found.some(c=>m.index!>=c.from&&m.index!<c.to))continue;
    // Do not partially parse an unsupported bracketed group.
    const line=masked.slice(masked.lastIndexOf('\n',m.index)+1,m.index);
    if(line.lastIndexOf('[')>line.lastIndexOf(']'))continue;
    const key=m[1].replace(/[.:,!?]+$/,'');found.push({from:m.index!,to:m.index!+key.length+1,raw:'@'+key,members:[{key,prefix:'',suffix:''}]});
  }
  return found.sort((a,b)=>a.from-b.from);
}
export function referenceText(item:CSLItem){
  const names=(item.author?.length?item.author:item.editor)||[];
  const surnames=names.map(n=>plain(n.literal||n.family||n.given)).filter(Boolean);
  const author=surnames.length>2?`${surnames[0]} et al.`:surnames.join(' & ');
  const year=String(item.issued?.['date-parts']?.[0]?.[0]??'n.d.');
  const journal=plain(item['container-title-short']||item['container-title']);
  const doi=plain(item.DOI).replace(/^https?:\/\/(?:dx\.)?doi.org\//,'');
  const url=doi?`https://doi.org/${doi}`:/^https?:\/\//i.test(item.URL||'')?item.URL:undefined;
  const short=[author||plain(item.title)||item.id,journal||plain(item.publisher),year].filter(Boolean).join(', ')+ (doi?`. doi:${doi}`:'');
  const authors=names.map(n=>n.literal?plain(n.literal):[plain(n.family),plain(n.given)].filter(Boolean).join(', ')).join('; ');
  const publication=[plain(item['container-title']),year,plain(item.volume)+(item.issue?` (${plain(item.issue)})`:''),plain(item.page)].filter(Boolean).join(', ');
  const full=[authors,plain(item.title),publication,plain(item.publisher),doi?`doi:${doi}`:url].filter(Boolean).reduce((out,part)=>out+(out?(out.endsWith('.')?' ':'. '):'')+part,'');
  return {short,full:full||item.id,url};
}
export function referencePages(refs:Reference[],budget=1250):Reference[][]{
 const pages:Reference[][]=[];let page:Reference[]=[],used=0;
 for(const ref of refs){const cost=Math.max(180,ref.full.length+45);if(page.length&&(page.length>=5||used+cost>budget)){pages.push(page);page=[];used=0;}page.push(ref);used+=cost;}
 if(page.length)pages.push(page);return pages;
}
export function buildReferences(groups:{slide:string;occurrences:CiteOccurrence[]}[],items:Map<string,CSLItem>){
 const refs=new Map<string,Reference>();
 for(const group of groups)for(const cite of group.occurrences)for(const member of cite.members){
   let ref=refs.get(member.key);if(!ref){const item=items.get(member.key);ref={key:member.key,number:refs.size+1,item,...(item?referenceText(item):{short:`Missing bibliography entry: @${member.key}`,full:`Missing bibliography entry: @${member.key}`}),occurrences:[]};refs.set(member.key,ref);}
   if(cite.evidence&&!ref.occurrences.some(o=>o.href===cite.evidence&&o.slide===group.slide))ref.occurrences.push({slide:group.slide,href:cite.evidence});
 }
 return refs;
}

export function pdfCandidates(note:string):string[]{
 const parts=note.split('/'),name=parts.pop()!.replace(/\.md$/i,'.pdf'),folder=parts.join('/');
 const paths=[`${folder}/${name}`];
 const mark=parts.findIndex(p=>['markdown_originals','markdown'].includes(p));
 if(mark>=0)paths.push([...parts.slice(0,mark),'pdfs',name].join('/'));
 return [...new Set(paths)];
}
export function webVersion(ref:Reference):string|undefined{
 for(const value of [ref.item?.URL,ref.url])try{if(value){const url=new URL(value);if(/^https?:$/.test(url.protocol)&&!url.pathname.toLowerCase().endsWith('.pdf'))return value;}}catch{}
 return undefined;
}
