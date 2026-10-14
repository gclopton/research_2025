import {Kind,Scientific,ScientificOccurrence,parseScientific,scientificBlocks,scientificNumbers} from './scientific-core';
interface DocumentIndex {raw:string;blocks:ScientificOccurrence[];numbers:Map<string,string>;parsed:Map<string,Scientific|Error>}
/** File and unsaved-buffer variants coexist; unchanged YAML is reused across both. */
export class ScientificDocumentIndex {
 private documents=new Map<string,Map<'buffer'|'file',DocumentIndex>>();
 private pending=new Map<string,Promise<DocumentIndex>>();
 constructor(private limit=8,private parse:typeof parseScientific=parseScientific){}
 get(path:string,raw:string,source:'buffer'|'file'='buffer'):DocumentIndex {
  const variants=this.documents.get(path)??new Map<'buffer'|'file',DocumentIndex>();
  const previous=variants.get(source),other=variants.get(source==='buffer'?'file':'buffer');
  if(previous?.raw===raw)return previous;
  if(other?.raw===raw){variants.set(source,other);return other;}
  const parsed=new Map<string,Scientific|Error>();
  const blocks=scientificBlocks(raw,(kind:Kind,source:string)=>{
   const key=kind+'\0'+source;let value=parsed.get(key)??previous?.parsed.get(key)??other?.parsed.get(key);
   if(!value)try{value=this.parse(kind,source);}catch(e){value=e instanceof Error?e:new Error(String(e));}
   parsed.set(key,value);if(value instanceof Error)throw value;return value;
  });
  const result={raw,blocks,numbers:scientificNumbers(blocks.map(b=>b.value)),parsed};
  variants.set(source,result);this.documents.delete(path);this.documents.set(path,variants);
  while(this.documents.size>this.limit)this.documents.delete(this.documents.keys().next().value!);
  return result;
 }
 /** Modification invalidates an in-flight read. Its waiters follow the fresh read. */
 invalidate(path:string){this.pending.delete(path);}
 read(path:string,load:()=>Promise<string>):Promise<DocumentIndex>{
  const existing=this.pending.get(path);if(existing)return existing;
  const pending:Promise<DocumentIndex>=Promise.resolve().then(load).then(raw=>this.pending.get(path)===pending?this.get(path,raw,'file'):this.read(path,load)).finally(()=>{if(this.pending.get(path)===pending)this.pending.delete(path);});
  this.pending.set(path,pending);return pending;
 }
 clear(){this.documents.clear();this.pending.clear();}
}
const indexes=new WeakMap<object,ScientificDocumentIndex>();
export function scientificIndex(owner:object){let index=indexes.get(owner);if(!index){index=new ScientificDocumentIndex();indexes.set(owner,index);}return index;}
