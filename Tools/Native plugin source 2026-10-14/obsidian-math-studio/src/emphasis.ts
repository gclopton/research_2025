import {Tree,TreeFragment} from '@lezer/common';
import {parser} from '@lezer/markdown';
import {equations} from './model';

/** Use Markdown's delimiter rules, with TeX hidden from the Markdown parser.
 * Keeping offsets/newlines lets decorations style native math without rewriting it.
 */
export function emphasizedEquations(source:string) {
 const math=equations(source);
 if(!math.length)return [];
 let masked='',last=0;
 for(const q of math){masked+=source.slice(last,q.from)+q.raw.replace(/[^\n\r]/g,'x');last=q.to;}
 masked+=source.slice(last);
 const tree=parser.parse(masked);
 return math.filter(q=>!q.display).flatMap(q=>{
  let strong=false,em=false;
  for(let node=tree.resolveInner(q.from+1,1);node;node=node.parent!){
   if(node.name==='StrongEmphasis')strong=true;
   if(node.name==='Emphasis')em=true;
  }
  return strong||em?[{from:q.from,to:q.to,strong,em}]:[];
 });
}

/** Reuse unchanged Markdown syntax between edits. Diff the masked text itself:
 * editing a math delimiter can change masking beyond the edited characters. */
export class EmphasisIndex {
 private masked='';
 private tree?:Tree;
 scan(source:string,math=equations(source)) {
  if(!math.length){this.tree=undefined;this.masked='';return [];}
  let masked='',last=0;
  for(const q of math){masked+=source.slice(last,q.from)+q.raw.replace(/[^\n\r]/g,'x');last=q.to;}
  masked+=source.slice(last);
  let fragments:readonly TreeFragment[]=[];
  if(this.tree){
   let from=0,toA=this.masked.length,toB=masked.length;
   const length=Math.min(toA,toB);
   while(from+1024<=length&&this.masked.slice(from,from+1024)===masked.slice(from,from+1024))from+=1024;
   while(from<length&&this.masked[from]===masked[from])from++;
   while(toA-from>=1024&&toB-from>=1024&&this.masked.slice(toA-1024,toA)===masked.slice(toB-1024,toB)){toA-=1024;toB-=1024;}
   while(toA>from&&toB>from&&this.masked[toA-1]===masked[toB-1]){toA--;toB--;}
   fragments=TreeFragment.addTree(this.tree);
   if(from<toA||from<toB)fragments=TreeFragment.applyChanges(fragments,[{fromA:from,toA,fromB:from,toB}]);
  }
  const tree=parser.parse(masked,fragments);this.masked=masked;this.tree=tree;
  return math.filter(q=>!q.display).flatMap(q=>{
   let strong=false,em=false;
   for(let node=tree.resolveInner(q.from+1,1);node;node=node.parent!){if(node.name==='StrongEmphasis')strong=true;if(node.name==='Emphasis')em=true;}
   return strong||em?[{from:q.from,to:q.to,strong,em}]:[];
  });
 }
}
