import { imagePath, usefulFile } from './files';
export type FinderScope = 'documents' | 'images' | 'all';
export type Range = [number, number];
export type Fuzzy = (text:string)=>{score:number;matches:Range[]}|null;
export interface FinderEntry {path:string;name:string;folder:string;extension:string;mtime:number;aliases:string[];recent:number}
export interface FinderMatch {entry:FinderEntry;nameRanges:Range[];pathRanges:Range[];alias?:string;aliasRanges?:Range[];tier:number;score:number}
export function finderQuery(query:string) {
 const extensions:string[]=[];
 const terms=query.trim().split(/\s+/).filter(t=>{if(/^\.[a-z][a-z0-9]*$/i.test(t)){extensions.push(t.slice(1).toLowerCase());return false;}return !!t;});
 return {text:terms.join(' '),extensions};
}
export function inScope(e:FinderEntry,scope:FinderScope,extensions:string[]) {
 if(!usefulFile(e.path))return false;
 if(extensions.length)return extensions.includes(e.extension);
 return scope==='all'||(scope==='images'?imagePath(e.path):['md','pdf'].includes(e.extension));
}
export function rankFiles(entries:FinderEntry[],scope:FinderScope,extensions:string[],query:string,fuzzy:Fuzzy|null):FinderMatch[]{
 const found:FinderMatch[]=[];
 for(const entry of entries){
  if(!inScope(entry,scope,extensions))continue;
  let match:FinderMatch={entry,nameRanges:[],pathRanges:[],tier:0,score:0};
  if(fuzzy){
   const name=fuzzy(entry.name),alias=entry.aliases.map(text=>({text,hit:fuzzy(text)})).filter(a=>a.hit).sort((a,b)=>b.hit!.score-a.hit!.score)[0];
   if(name){match.nameRanges=name.matches;match.score=name.score;match.tier=entry.name.toLowerCase().startsWith(query.toLowerCase())?4:3;}
   else if(alias){match.tier=2;match.score=alias.hit!.score;match.alias=alias.text;match.aliasRanges=alias.hit!.matches;}
   else {const path=fuzzy(entry.path);if(!path)continue;match.tier=1;match.score=path.score;match.pathRanges=path.matches;const start=entry.folder.length;match.nameRanges=path.matches.map(([a,b])=>[Math.max(0,a-start),Math.min(entry.name.length,b-start)] as Range).filter(([a,b])=>b>a);}
  }
  found.push(match);
 }
 return found.sort(compareMatches);
}
export function finderLayout(width:number,size:number){
 const compact=width<560;
 const columns=compact?1:Math.max(1,Math.floor((width+14)/(230*size/100+14)));
 const cardWidth=Math.max(1,(width-14*(columns-1))/columns);
 const height=compact?100:Math.round(cardWidth*.64)+118;
 return {compact,columns,cardWidth,height,stride:height+14};
}
/** Prefer the distinguishing branch when copies have identical names. */
export function pathLabel(folder:string,max=100){
 const parts=folder.replace(/\/$/,'').split('/').filter(Boolean);
 if(!parts.length)return 'Vault root';
 if(folder.length<=max)return folder;
 const head=parts.slice(0,2).join('/');return parts.length>2?(head.length+parts.at(-1)!.length+4<=max?head:parts[0])+'/…/'+parts.at(-1)+'/':parts.join('/')+'/';
}
export function previewExcerpt(raw:string){
 const lines=raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').slice(0,5000).split('\n');let fence='';const kept:string[]=[];
 for(const line of lines){const mark=line.match(/^\s{0,3}(`{3,}|~{3,})/);if(mark){if(!fence)fence=mark[1];else if(mark[1][0]===fence[0]&&mark[1].length>=fence.length)fence='';continue;}if(!fence)kept.push(line);}
 return kept.join('\n').replace(/!\[\[[^\]]*\]\]/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/<(script|style|iframe|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<\/?(?:iframe|img|video|audio|embed|object|script|style|link)\b[^>]*>/gi,'').slice(0,1500);
}

/** Remove only the common ancestor when identical titles need folder disambiguation. */
export function folderLabels(entries:FinderEntry[]) {
 const groups=new Map<string,FinderEntry[]>(),result=new Map<string,string>();
 for(const e of entries){const group=groups.get(e.name)??[];group.push(e);groups.set(e.name,group);}
 for(const group of groups.values()){
  const folders=group.map(e=>e.folder.replace(/\/$/,'').split('/'));
  let common=0;
  if(group.length>1)while(common<folders.reduce((n,p)=>Math.min(n,p.length),Infinity)-1&&folders.every(p=>p[common]===folders[0][common]))common++;
  group.forEach((e,i)=>{let parts=folders[i].slice(common);if(parts.at(-1)?.toLowerCase()===e.name.toLowerCase())parts.pop();result.set(e.path,parts.filter(Boolean).length?(common?'…/':'')+pathLabel(parts.join('/')+'/',120):'Vault root');});
 }
 return result;
}

export function compareMatches(a:FinderMatch,b:FinderMatch){return b.tier-a.tier||b.score-a.score||a.entry.recent-b.entry.recent||b.entry.mtime-a.entry.mtime||a.entry.path.length-b.entry.path.length||a.entry.path.localeCompare(b.entry.path);}
