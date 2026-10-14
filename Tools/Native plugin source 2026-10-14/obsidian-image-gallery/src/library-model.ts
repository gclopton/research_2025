export const CATALOG_PATH='.paper-library/catalog.json';
export const LEGACY_CATALOG_PATH='Papers/.library/catalog.json';
export interface PaperSource {title:string;authors?:string;year?:number;doi?:string;citekey?:string;pdf:{path:string;sha256:string;bytes:number;pages?:number};conversion?:{path:string};cleanup?:{markdownPath:string;verifiedAt:string;pdfSha256:string;markdownSha256:string};equivalentPdfs?:{sha256:string;reason:string}[];aliases?:{path:string;target:string}[];related?:{type:string;source:string}[];evidence?:string[]}
export interface PaperLibrary {title:string;parent:string|null;folder?:string}
export interface LibraryCatalog {schema:1;revision:number;sourceRoot?:string;folderAliases?:{path:string;target:string}[];sources:Record<string,PaperSource>;libraries:Record<string,PaperLibrary>;memberships:{library:string;source:string}[]}
export function validPath(p:string){return !!p&&!p.startsWith('/')&&!p.includes('\\')&&!p.split('/').some(x=>x==='..'||x==='.');}
export function validateCatalog(v:unknown):LibraryCatalog {
 const c=v as LibraryCatalog;
 if(!c||c.schema!==1||!Number.isInteger(c.revision)||!c.sources||!c.libraries||!Array.isArray(c.memberships))throw Error('Unsupported paper catalog. Your saved file has been left intact.');
 if(c.sourceRoot&&!validPath(c.sourceRoot))throw Error('Invalid paper storage folder');
 for(const a of c.folderAliases??[])if(!validPath(a.path)||!validPath(a.target)||a.path===a.target)throw Error('Invalid folder redirect');
 const paths=new Set<string>(), hashes=new Map<string,string>();
 for(const [id,s]of Object.entries(c.sources)){
  if(!id||!s.title||!s.pdf||!validPath(s.pdf.path)||!s.pdf.path.toLowerCase().endsWith('.pdf')||!/^[a-f0-9]{64}$/.test(s.pdf.sha256))throw Error('Invalid paper source '+id);
  if(!Number.isInteger(s.pdf.bytes)||s.pdf.bytes<0||s.conversion&&!s.conversion.path.endsWith('.md'))throw Error('Invalid source metadata');
  for(const hash of [s.pdf.sha256,...(s.equivalentPdfs??[]).map(e=>e.sha256)]){if(!/^[a-f0-9]{64}$/.test(hash)||hashes.has(hash)&&hashes.get(hash)!==id)throw Error('Repeated or invalid PDF identity');hashes.set(hash,id);}
  for(const p of [s.pdf.path,s.conversion?.path].filter((x):x is string=>!!x)){if(!validPath(p)||paths.has(p))throw Error('Repeated or invalid source path '+p);paths.add(p);}
  for(const a of s.aliases??[])if(!validPath(a.path)||!validPath(a.target)||![s.pdf.path,s.conversion?.path].includes(a.target))throw Error('Invalid retired source path');
 }
 for(const s of Object.values(c.sources))for(const a of s.aliases??[])if(paths.has(a.path))throw Error('Retired path is currently in use');
 const pairs=new Set<string>();
 for(const [id,l]of Object.entries(c.libraries)){if(l.folder&&!validPath(l.folder))throw Error('Invalid library folder');if(!l.title||l.parent===id||(l.parent&&!c.libraries[l.parent]))throw Error('Invalid library parent');const seen=new Set([id]);let p=l.parent;while(p){if(seen.has(p))throw Error('Library cycle');seen.add(p);p=c.libraries[p].parent;}}
 for(const m of c.memberships){const k=m.source+'|'+m.library;if(!c.sources[m.source]||!c.libraries[m.library]||pairs.has(k))throw Error('Invalid library membership');pairs.add(k);}
 return c;
}
export function libraryTrail(c:LibraryCatalog,id:string|null):string[]{const out:string[]=[];while(id){out.unshift(id);id=c.libraries[id]?.parent??null;}return out;}
export function libraryLabel(c:LibraryCatalog,id:string){return libraryTrail(c,id).map(i=>c.libraries[i].title).join(' / ');}
export function paperIds(c:LibraryCatalog,library:string|null):string[]{if(!library)return Object.keys(c.sources);const scope=new Set(Object.keys(c.libraries).filter(id=>libraryTrail(c,id).includes(library)));return [...new Set(c.memberships.filter(m=>scope.has(m.library)).map(m=>m.source))];}
export function resolvePaperPath(c:LibraryCatalog,path:string):string {
 const at=path.indexOf('#');const p=at<0?path:path.slice(0,at),suffix=at<0?'':path.slice(at);
 const candidates=[p,p+'.md'];const sources=Object.values(c.sources);
 if(sources.some(s=>[s.pdf.path,s.conversion?.path].some(x=>x&&candidates.includes(x))))return path;
 for(const s of sources){const a=s.aliases?.find(a=>candidates.includes(a.path));if(a)return (a.path===p?a.target:a.target.replace(/\.md$/,''))+suffix;}
 let resolved=p;const seen=new Set<string>();
 while(!seen.has(resolved)){seen.add(resolved);const folder=c.folderAliases?.filter(a=>resolved.startsWith(a.path+'/')).sort((a,b)=>b.path.length-a.path.length)[0];if(!folder)break;resolved=folder.target+resolved.slice(folder.path.length);}
 if(resolved!==p)return resolved+suffix;
 return path;
}

/** Apply queued Obsidian rename events to the latest catalog, including parent folders. */
export function relocatePaperPaths(c:LibraryCatalog,old:string,next:string,folder=false){
 const inside=(p:string)=>p===old||p.startsWith(old+'/');
 const moved=(p:string)=>inside(p)?next+p.slice(old.length):p;
 let affected=false;
 for(const s of Object.values(c.sources))for(const ref of [s.pdf,s.conversion]){
  if(!ref||!inside(ref.path))continue;
  affected=true;const before=ref.path;ref.path=moved(before);s.aliases??=[];
  if(ref===s.conversion&&s.cleanup?.markdownPath===before)s.cleanup.markdownPath=ref.path;
  for(const a of s.aliases)a.target=moved(a.target);
  s.aliases=s.aliases.filter(a=>a.path!==ref.path&&a.path!==before);
  s.aliases.push({path:before,target:ref.path});
 }
 for(const l of Object.values(c.libraries))if(l.folder&&inside(l.folder)){l.folder=moved(l.folder);affected=true;}
 const root=c.sourceRoot??'Papers';if(inside(root)){c.sourceRoot=moved(root);affected=true;}
 if(folder&&affected){
  c.folderAliases??=[];
  for(const a of c.folderAliases)a.target=moved(a.target);
  c.folderAliases=c.folderAliases.filter(a=>a.path!==a.target&&a.path!==old&&a.path!==next&&!a.path.startsWith(next+'/'));
  c.folderAliases.push({path:old,target:next});
 }
}

const libraryColors=['blue','orange','green','purple','red','cyan','yellow','pink'];
export function libraryColor(c:LibraryCatalog,id:string):string{
 const root=libraryTrail(c,id)[0];const roots=Object.keys(c.libraries).filter(k=>!c.libraries[k].parent);
 return `var(--color-${libraryColors[Math.max(0,roots.indexOf(root))%libraryColors.length]})`;
}

/** Search metadata only; the UI never constructs more than one page of PDF cards. */
export function librarySearchPage(c:LibraryCatalog,library:string|null,query:string,page=0){
 const q=query.toLowerCase().trim();
 const matched=paperIds(c,library).filter(id=>{const s=c.sources[id];return !q||`${s.title} ${s.authors??''} ${s.year??''} ${s.doi??''}`.toLowerCase().includes(q);}).sort((a,b)=>c.sources[a].title.localeCompare(c.sources[b].title,undefined,{numeric:true}));
 page=Math.max(0,Math.min(Math.floor(page),Math.max(0,Math.ceil(matched.length/40)-1)));
 return {ids:matched.slice(page*40,(page+1)*40),total:matched.length,page};
}

export function normalizedTitle(title:string){return title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\.pdf$/,'').replace(/[^a-z0-9]/g,'');}
export function duplicateMatch(c:LibraryCatalog,hash:string,title:string,doi?:string):{kind:'exact'|'candidate';ids:string[]}|null {
 const exact=Object.entries(c.sources).filter(([,s])=>s.pdf.sha256===hash||s.equivalentPdfs?.some(e=>e.sha256===hash)).map(([id])=>id);if(exact.length)return {kind:'exact',ids:exact};
 const titleKey=normalizedTitle(title);const doiKey=doi?.trim().toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//,'');
 const ids=Object.entries(c.sources).filter(([,s])=>normalizedTitle(s.title)===titleKey||normalizedTitle(`${s.authors??''} ${s.year??''} - ${s.title}`)===titleKey||!!doiKey&&s.doi?.toLowerCase()===doiKey).map(([id])=>id);
 return ids.length?{kind:'candidate',ids}:null;
}
export function addMembership(c:LibraryCatalog,source:string,library:string){if(!c.sources[source]||!c.libraries[library])throw Error('Paper or library no longer exists');if(!c.memberships.some(m=>m.source===source&&m.library===library))c.memberships.push({source,library});}
export function moveLibrary(c:LibraryCatalog,id:string,parent:string|null){if(id===parent||(parent&&libraryTrail(c,parent).includes(id)))throw Error('A library cannot be placed inside itself');c.libraries[id].parent=parent;}

/** Review provenance is metadata, never a per-card PDF or Markdown read. */
export function paperCleanupBadge(source:PaperSource){
 const review=source.cleanup;
 const verified=!!source.conversion&&!!review&&review.markdownPath===source.conversion?.path&&review.pdfSha256===source.pdf.sha256&&/^[a-f0-9]{64}$/.test(review.markdownSha256)&&Number.isFinite(Date.parse(review.verifiedAt));
 return verified
  ? {icon:'✨',label:`OCR cleanup reviewed · ${new Date(review!.verifiedAt).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}`}
  : {icon:'🤢',label:source.conversion?'Awaiting OCR cleanup':'No reading copy yet'};
}
