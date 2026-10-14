import {validMathPart} from '../../src/math-parts';
import {Critique,MarginAnchor,CommentColor,defaultCommentPalette} from '../../src/review-model';
export function excerpts(c:Pick<Critique,'id'|'path'|'quote'|'before'|'after'|'anchors'>):MarginAnchor[]{return c.anchors??(c.quote?[{id:c.id,path:c.path,quote:c.quote,before:c.before,after:c.after}]:[]);}
export function withExcerpts(c:Critique,anchors:MarginAnchor[]):Critique{const first=anchors[0];return {...c,anchors,...(first?{path:first.path,quote:first.quote,before:first.before,after:first.after}:{quote:'',before:'',after:''})};}
export function commentPaths(c:Critique){return new Set([c.path,...excerpts(c).map(a=>a.path)]);}
export function readingCopies(c:Critique,path:string){return excerpts(c).filter(a=>a.path===path).map(a=>({...c,quote:a.renderedQuote??a.quote,before:a.renderedBefore??a.before,after:a.renderedAfter??a.after,excerpt:a}));}
export const researchPalette=defaultCommentPalette;
export function validComment(c:any):c is Critique{return !!c&&['id','path','quote','before','after','comment','color','intent','updated'].every(k=>typeof c[k]==='string')&&typeof c.resolved==='boolean'&&(c.anchors===undefined||(Array.isArray(c.anchors)&&c.anchors.every((a:any)=>a&&['id','path','quote','before','after'].every(k=>typeof a[k]==='string')&&['renderedRoot','renderedQuote','renderedBefore','renderedAfter','sectionSource'].every(k=>a[k]===undefined||typeof a[k]==='string')&&(a.kind===undefined||['text','math'].includes(a.kind))&&(a.part===undefined||validMathPart(a.part)))))&&(c.markStyle===undefined||['highlight','underline'].includes(c.markStyle));}
export function sanitizedReview(raw:any){if(raw?.version!==1||!Array.isArray(raw.comments)||!Array.isArray(raw.questions))throw Error('Review file has an invalid structure. The file was preserved.');return {...raw,comments:raw.comments.filter(validComment),questions:raw.questions.filter((q:any)=>q&&['questionId','path','title','context','updated'].every(k=>typeof q[k]==='string')&&typeof q.remove==='boolean')};}
function canonical(x:any):any{return Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;}
const same=(a:unknown,b:unknown)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
/** Three-way merge: unrelated external additions/edits survive a local save.
 * A simultaneous change to the same record is reported instead of overwritten. */
export function mergeReview(base:any,local:any,remote:any):any{
 if(remote?.version!==1||!Array.isArray(remote.comments)||!Array.isArray(remote.questions))throw Error('Review file has an invalid structure. The file was preserved.');
 const merged={...remote};
 for(const key of ['comments','questions']){
  const id=(x:any)=>key==='comments'?(validComment(x)?x.id:'invalid:'+JSON.stringify(x)):JSON.stringify([x?.questionId,x?.path,x?.context]);
  const b=new Map((base[key]??[]).map((x:any)=>[id(x),x])),l=new Map(local[key].map((x:any)=>[id(x),x])),r=new Map(remote[key].map((x:any)=>[id(x),x]));
  for(const k of new Set([...b.keys(),...l.keys()])){
   if(same(b.get(k),l.get(k)))continue;
   if(!same(b.get(k),r.get(k))&&!same(l.get(k),r.get(k))){
    if(key==='comments'){const localRecord=l.get(k) as any;if(localRecord){const copy={...localRecord,id:crypto.randomUUID(),conflictOf:k};r.set(copy.id,copy);}continue;}
    continue; // Remote question status wins; comment saving remains available.
   }
   if(l.has(k))r.set(k,l.get(k));else r.delete(k);
  }
  merged[key]=[...r.values()];
 }
 if(!same(base.palette,local.palette)&&same(base.palette,remote.palette))merged.palette=local.palette;
 return merged;
}
