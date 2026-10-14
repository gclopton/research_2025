import {draftKey} from './practice-state';
export const within=(path:string,root:string)=>path===root||path.startsWith(root+'/');
export function moveCacheContext<T>(cache:Record<string,T>,from:string,to:string){
 const moves:[string,string,T][]=[];
 for(const [key,value]of Object.entries(cache)){let parts:unknown;try{parts=JSON.parse(key);}catch{continue;}if(Array.isArray(parts)&&parts.length===2&&parts[0]===from&&typeof parts[1]==='string'){const next=draftKey(to,parts[1]);if(Object.hasOwn(cache,next)&&JSON.stringify(cache[next])!==JSON.stringify(value))throw Error('Conflicting practice state at the destination; nothing was replaced.');moves.push([key,next,value]);}}
 for(const [old,next,value]of moves){cache[next]=value;delete cache[old];}
}
/** Plan changes on copies so destination conflicts never partially move state. */
export function moveNoteLocations(locations:Record<string,string>,from:string,to:string){
 const next={...locations},entries=Object.entries(locations).filter(([path])=>within(path,from));
 for(const [path,id]of entries){const destination=to+path.slice(from.length);if(Object.hasOwn(next,destination)&&next[destination]!==id)throw Error('A different practice note already owns the destination.');}
 for(const [path]of entries)delete next[path];for(const [path,id]of entries)next[to+path.slice(from.length)]=id;return next;
}
export function legacyNotePaths(...caches:Record<string,unknown>[]){const paths=new Set<string>();for(const cache of caches)for(const key of Object.keys(cache)){try{const [path]=JSON.parse(key);if(typeof path==='string'&&path.endsWith('.md'))paths.add(path);}catch{}}return [...paths];}
