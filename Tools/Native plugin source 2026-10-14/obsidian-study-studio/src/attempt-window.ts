export const ATTEMPT_COLUMNS=5;
/** Align each row's newest attempt at the right; preserve its lifetime number. */
export function visibleAttempt<T>(attempts:readonly T[],column:number,columnCount:number){
 const index=attempts.length-Math.min(ATTEMPT_COLUMNS,columnCount)+column;
 return index>=0&&index<attempts.length?{attempt:attempts[index],number:index+1}:undefined;
}
export function attemptColumnLabel(column:number,count:number){
 const ago=count-column-1;
 return ago===0?'Latest':ago===1?'Previous':`${ago} attempts ago`;
}
