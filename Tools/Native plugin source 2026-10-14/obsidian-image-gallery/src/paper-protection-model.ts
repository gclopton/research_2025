import {LibraryCatalog,normalizedTitle} from './library-model';
export const basename=(path:string)=>path.split('/').at(-1)??path;
export const stem=(path:string)=>basename(path).replace(/\.(md|pdf)$/i,'');
const key=(name:string)=>normalizedTitle(name.replace(/\.md$/i,''));
export class PaperProtectionIndex {
 readonly assetRoots:string[]=[];
 readonly protectedPaths=new Map<string,string>();readonly canonicalPaths=new Map<string,string>();readonly reserved=new Map<string,Set<string>>();
 constructor(readonly catalog:LibraryCatalog){
  for(const [id,s] of Object.entries(catalog.sources)){
   for(const p of [s.pdf.path,s.conversion?.path].filter((x):x is string=>!!x))this.canonicalPaths.set(p,id);
   for(const title of [s.title,stem(s.pdf.path),s.conversion&&stem(s.conversion.path),...(s.aliases??[]).map(a=>stem(a.path))].filter((x):x is string=>!!x)){
    const k=key(title);if(!k)continue;const owners=this.reserved.get(k)??new Set();owners.add(id);this.reserved.set(k,owners);
   }
   // A changed external file must never silently unlock a reviewed source.
   if(s.cleanup&&Number.isFinite(Date.parse(s.cleanup.verifiedAt))&&s.cleanup.markdownPath===s.conversion?.path){this.protectedPaths.set(s.pdf.path,id);this.protectedPaths.set(s.conversion.path,id);this.assetRoots.push(s.conversion.path.slice(0,s.conversion.path.lastIndexOf('/'))+'/images');}
  }
 }
 isAsset(path:string){return !/\.md$/i.test(path)&&this.assetRoots.some(root=>path===root||path.startsWith(root+'/'));}
 isProtected(path:string){return this.protectedPaths.has(path)||this.isAsset(path);}
 ownerForName(path:string):Set<string>|undefined {
  if(!/\.(md|pdf)$/i.test(path))return;
  let name=stem(path),owners=this.reserved.get(key(name));if(owners)return owners;
  // Native Duplicate adds a number; those are still indistinguishable paper copies.
  for(let i=0;i<3;i++){const next=name.replace(/(?:[\s_-]+(?:copy|backup|old version|\d+)|\s*\((?:copy|backup|old version|\d+)\))$/i,'').trim();if(next===name)break;name=next;owners=this.reserved.get(key(name));if(owners)return owners;}
 }
 assertDestination(path:string,from?:string){
  const owners=this.ownerForName(path);if(!owners)return;
  const canonical=this.canonicalPaths.get(path);if(!from&&canonical&&owners.has(canonical))return;
  const id=from&&this.canonicalPaths.get(from);
  if(id&&from!.split('.').at(-1)!==path.split('.').at(-1))throw Error('Keep the canonical paper file type unchanged.');
  if(id&&owners.size===1&&owners.has(id))return;
  throw Error('This title belongs to “'+this.catalog.sources[[...owners][0]].title+'”. Use a distinct name such as “Paper title — Outline”.');
 }
 assertContent(path:string,before:string|ArrayBuffer,after:string|ArrayBuffer){
  if(!this.isProtected(path)||sameContent(before,after))return;
  throw Error('Cleaned paper text is protected. Annotations are available; use “Create working copy” to edit the text.');
 }
}
export function sameContent(a:string|ArrayBuffer,b:string|ArrayBuffer){if(typeof a==='string'||typeof b==='string')return a===b;const x=new Uint8Array(a),y=new Uint8Array(b);return x.length===y.length&&x.every((v,i)=>v===y[i]);}
export function workingCopyName(sourceName:string,description:string){
 const requested=description.trim(),descriptor=/^\d+$/.test(requested)?`Working copy ${requested}`:requested;if(!descriptor||/^(?:copy|backup|old version)$/i.test(descriptor)||/[\\/:*?"<>|\[\]#\x00-\x1f]/.test(descriptor))throw Error('Choose a descriptive suffix, such as Outline, Summary, or Worked examples.');
 return `${stem(sourceName)} — ${descriptor}.md`;
}
