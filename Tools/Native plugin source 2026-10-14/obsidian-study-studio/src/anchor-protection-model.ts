import {anchorRanges,anchorsFor} from './review-model';

/** Check the resulting document, including selections, boundary edits and ID renames. */
export function lostAnchorIds(before:string, after:string):string[] {
  return lostFromRanges(anchorRanges(before),anchorRanges(after));
}
function lostFromRanges(before:ReturnType<typeof anchorRanges>,after:ReturnType<typeof anchorRanges>){
  const remaining=new Map<string,number>();
  for(const {id} of after)remaining.set(id,(remaining.get(id)??0)+1);
  const lost:string[]=[];
  for(const {id} of before){
    const count=remaining.get(id)??0;
    if(count)remaining.set(id,count-1);else lost.push(id);
  }
  return lost;
}

export function anchorRemovalChanges(text:string, ids:readonly string[]) {
  const selected=new Set(ids);
  return anchorRanges(text).filter(a=>selected.has(a.id)).map(a=>({from:a.from,to:a.to,insert:''}));
}

export function removalPhrase(ids:readonly string[], all:boolean) {
  return all?`REMOVE ${ids.length} ANCHORS`: `REMOVE ${ids[0]}`;
}

interface AnchorDoc {toString():string;sliceString(from:number,to:number):string;lineAt(at:number):{from:number;to:number}}
interface AnchorTransaction {startState:{doc:AnchorDoc};newDoc:AnchorDoc;changes:{iterChangedRanges(f:(fromA:number,toA:number,fromB:number,toB:number)=>void):void}}
/** Full changed lines cover anchor endings and fence changes, including joins. */
export function changedAnchorIds(tr:AnchorTransaction):string[]{
 let risky=false;
 tr.changes.iterChangedRanges((fA,tA,fB,tB)=>{
  if(risky)return;
  const a=tr.startState.doc,b=tr.newDoc;
  const old=a.sliceString(a.lineAt(fA).from,a.lineAt(tA).to),next=b.sliceString(b.lineAt(fB).from,b.lineAt(tB).to);
  risky=[old,next].some(text=>text.split('\n').some(line=>/^\s*(`{3,}|~{3,})/.test(line)||/(?:^|\s)\^[A-Za-z0-9-]+\s*$/.test(line)));
 });
 return risky?lostFromRanges(anchorsFor(tr.startState.doc),anchorsFor(tr.newDoc)):[];
}
