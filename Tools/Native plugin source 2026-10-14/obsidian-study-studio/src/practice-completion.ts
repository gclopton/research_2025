import {Attempt} from './model';
/** Only checked, graded questions count toward a finished practice set. */
export function practiceCompletion(records:(Attempt|undefined)[]){
 const scored=records.filter((r):r is Attempt=>!!r&&r.mode==='attempt'&&!!r.grade&&!r.grade.pending&&r.grade.possible>0);
 return {ready:records.length>0&&scored.length===records.length,completed:scored.length,total:records.length,earned:scored.reduce((n,r)=>n+r.grade!.earned,0),possible:scored.reduce((n,r)=>n+r.grade!.possible,0),stamp:scored.map(r=>r.id).join('|')};
}
