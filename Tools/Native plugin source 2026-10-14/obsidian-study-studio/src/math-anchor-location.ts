import {equations} from './math-model';
import {locateQuote,MarginAnchor} from './review-model';

const equationCache=new Map<string,ReturnType<typeof equations>>();
function indexedEquations(text:string){let qs=equationCache.get(text);if(!qs){qs=equations(text);equationCache.set(text,qs);if(equationCache.size>2)equationCache.delete(equationCache.keys().next().value!);}return qs;}

/** Color/format edits change TeX; the surrounding prose can still identify its equation. */
export function locateMarginAnchor(text:string,a:Pick<MarginAnchor,'quote'|'before'|'after'|'kind'>){
 const exact=locateQuote(text,a);if(exact||a.kind!=='math')return exact;
 const before=a.before.trimEnd(),after=a.after.trimStart();
 if(!before&&!after)return;
 const candidates=indexedEquations(text).filter(q=>{
  const left=text.slice(0,q.from).trimEnd(),right=text.slice(q.to).trimStart();
  return (before?left.endsWith(before):left==='')&&(after?right.startsWith(after):right==='');
 });
 if(candidates.length===1)return {from:candidates[0].from,to:candidates[0].to};
}
