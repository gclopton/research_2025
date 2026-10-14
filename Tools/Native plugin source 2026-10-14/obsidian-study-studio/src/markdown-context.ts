import {parser as commonmark,Strikethrough} from '@lezer/markdown';
import {TreeFragment} from '@lezer/common';
const parser=commonmark.configure(Strikethrough);
/** Shared CommonMark boundaries: indentation in a list is not necessarily code.
 * Keep separate bounded caches for short fields and large notes, so small
 * equation fragments cannot evict a main note's incremental tree. */
type Context={tree:ReturnType<typeof parser.parse>;excluded:{from:number;to:number}[];reusedFragments:number};
const largeCache=new Map<string,Context>(),smallCache=new Map<string,Context>();
export function markdownContext(source:string){
 const cache=source.length<4096?smallCache:largeCache;
 const old=cache.get(source);if(old){cache.delete(source);cache.set(source,old);return old;}
 let fragments:readonly TreeFragment[]=[];
 const previous=source.length<4096?undefined:[...cache.entries()].sort((a,b)=>Math.abs(a[0].length-source.length)-Math.abs(b[0].length-source.length))[0];
 if(previous){const [before,context]=previous;let from=0,toA=before.length,toB=source.length;
  while(from<toA&&from<toB&&before[from]===source[from])from++;
  while(toA>from&&toB>from&&before[toA-1]===source[toB-1]){toA--;toB--;}
  fragments=TreeFragment.applyChanges(TreeFragment.addTree(context.tree),[{fromA:from,toA,fromB:from,toB}]);
 }
 const tree=parser.parse(source,fragments),excluded:{from:number;to:number}[]=[];
 tree.iterate({enter:n=>{if(['CodeBlock','FencedCode','InlineCode'].includes(n.name)){excluded.push({from:n.from,to:n.to});return false;}}});
 const front=/^---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)(?:\r?\n|$)/.exec(source);if(front)excluded.push({from:0,to:front[0].length});
 excluded.sort((a,b)=>a.from-b.from);const result={tree,excluded,reusedFragments:fragments.length};cache.set(source,result);if(cache.size>4)cache.delete(cache.keys().next().value!);return result;
}
