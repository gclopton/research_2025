import {parseQuestion,Question} from './model';
export interface IndexSource {
  paths():string[];
  read(path:string):Promise<string | undefined>;
}
/** Rebuildable in-memory index. The Markdown files remain authoritative. */
export class QuestionIndex {
  private entries=new Map<string,Question>();
  private ids=new Map<string,Map<string,Question>>();
  private duplicates=new Set<string>();
  private errors=new Map<string,string>();
  private dirty=new Set<string>();
  private seeded=false;
  private flight?:Promise<void>;
  private sorted?:Question[];
  private stopped=false;
  reads=0;
  flushes=0;
  lastFlushMs=0;
  constructor(private source:IndexSource){}
  has(path:string){return this.entries.has(path)||this.errors.has(path)||this.dirty.has(path);}
  invalidatePrefix(prefix:string){for(const path of new Set([...this.entries.keys(),...this.errors.keys(),...this.dirty]))if(path.startsWith(prefix+"/"))this.invalidate(path);}
  invalidate(path:string){if(!this.stopped)this.dirty.add(path);}
  discover(){for(const path of this.source.paths())if(!this.entries.has(path)&&!this.errors.has(path))this.invalidate(path);}
  dispose(){this.stopped=true;this.dirty.clear();}
  private remove(path:string){
    const old=this.entries.get(path);
    if(old){const id=old.definition.id, matches=this.ids.get(id)!;matches.delete(path);if(!matches.size)this.ids.delete(id);if(matches.size<2)this.duplicates.delete(id);this.entries.delete(path);}
    this.errors.delete(path);this.sorted=undefined;
  }
  private async drain(){
    const start=performance.now();this.flushes++;
    while(this.dirty.size&&!this.stopped){
      const batch=[...this.dirty];this.dirty.clear();let next=0;
      await Promise.all(Array.from({length:Math.min(8,batch.length)},async()=>{
        while(next<batch.length&&!this.stopped){
          const path=batch[next++];
          let q:Question|undefined,error:string|undefined;
          try{this.reads++;const raw=await this.source.read(path);if(raw!==undefined)q=parseQuestion(raw,path);}
          catch(e){error=e instanceof Error?e.message:String(e);}
          // An event during the read invalidates this result; the next batch reads it again.
          if(this.stopped||this.dirty.has(path))continue;
          this.remove(path);
          if(error)this.errors.set(path,error);
          if(q){this.entries.set(path,q);const id=q.definition.id, matches=this.ids.get(id)??new Map<string,Question>();matches.set(path,q);this.ids.set(id,matches);if(matches.size>1)this.duplicates.add(id);}
        }
      }));
    }
    this.lastFlushMs=performance.now()-start;
  }
  async ready(){
    if(this.stopped)throw Error('Question index is closed.');
    if(!this.seeded){this.seeded=true;this.discover();}
    while(this.dirty.size||this.flight){
      if(!this.flight)this.flight=this.drain().finally(()=>{this.flight=undefined;});
      await this.flight;
    }
    if(this.errors.size){const [path,message]=this.errors.entries().next().value!;throw Error(`${path}: ${message}`);}
    if(this.duplicates.size)throw Error(`Duplicate question ID: ${this.duplicates.values().next().value}. Give copied questions a new ID.`);
  }
  async all(){await this.ready();return [...(this.sorted??= [...this.entries.values()].sort((a,b)=>a.definition.title.localeCompare(b.definition.title)))];}
  async find(id:string){await this.ready();const q=this.ids.get(id)?.values().next().value;if(!q)throw Error(`Question ${id} not found. Keep the question note in the vault.`);return q;}
  stats(){return {questions:this.entries.size,reads:this.reads,flushes:this.flushes,pending:this.dirty.size,errors:this.errors.size,duplicates:this.duplicates.size,lastFlushMs:Math.round(this.lastFlushMs)};}
}
