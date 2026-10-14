import {Attempt} from './model';
export interface PracticeReviewState {
 fullIds:string[]; rootContext:string; required:1|2; randomize:boolean;
 round:number; streaks:Record<string,number>;
}
/** Each submitted round contributes at most one success per question. */
export function nextReview(ids:string[],records:(Attempt|undefined)[],state:PracticeReviewState){
 const streaks={...state.streaks};
 const remaining:string[]=[];
 ids.forEach((id,i)=>{
  const r=records[i],g=r?.grade;
  const correct=r?.mode==='attempt'&&g&&!g.pending&&g.possible>0&&g.earned===g.possible;
  if(state.round===0){if(!correct){streaks[id]=0;remaining.push(id);}}
  else {streaks[id]=correct?(streaks[id]??0)+1:0;if(streaks[id]<state.required)remaining.push(id);}
 });
 return {remaining,state:{...state,round:state.round+1,streaks}};
}
