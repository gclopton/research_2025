import {PracticeSession} from './practice-session';
import {Question} from './model';
import {HistoryRow} from './history-model';
import {scored} from './metrics-model';
export function practiceSetSummary(questions:Question[],history:HistoryRow[],courseId:string){
 const ids=new Set(questions.map(q=>q.definition.id));
 const rows=history.filter(r=>r.source==='practice'&&r.course?.id===courseId&&ids.has(r.questionId)).sort((a,b)=>Date.parse(a.finished)-Date.parse(b.finished)||a.key.localeCompare(b.key));
 const latest=new Map<string,HistoryRow>();for(const row of rows)if(scored(row))latest.set(row.questionId,row);
 const earned=[...latest.values()].reduce((n,r)=>n+r.earned!,0),possible=[...latest.values()].reduce((n,r)=>n+r.possible!,0),percent=possible?Math.round(100*earned/possible):null;
 const status=percent===null?'Unmeasured':percent<85?'Needs work':percent<90?'Developing':latest.size<ids.size?'Incomplete coverage':'Proficient';
 return {earned,possible,percent,status,coverage:latest.size,total:ids.size,attempts:rows.filter(scored).length,last:rows.at(-1)?.finished,pending:rows.filter(r=>r.assessment==='pending').length};
}

/** A column represents a deliberately started practice run, never an inferred nth response. */
export function practiceSetRuns(questions:Question[],history:HistoryRow[],courseId:string,snapshots:PracticeSession[]=[]){
 const ids=new Set(questions.map(q=>q.definition.id)),runs=new Map<string,HistoryRow[]>();
 for(const row of history){if(row.source!=='practice'||row.course?.id!==courseId||!ids.has(row.questionId)||!row.practiceContext?.startsWith('practice-set:')||row.mode!=='attempt')continue;const list=runs.get(row.practiceContext)??[];list.push(row);runs.set(row.practiceContext,list);}
 for(const snapshot of snapshots)if(snapshot.course?.id===courseId&&snapshot.context.startsWith('practice-set:')&&snapshot.attempts.some(a=>ids.has(a.questionId))&&!runs.has(snapshot.context))runs.set(snapshot.context,[]);
 return [...runs].map(([id,rows])=>{const frozen=snapshots.find(s=>s.context===id);if(frozen)return {id,date:frozen.finished,earned:frozen.attempts.reduce((n,a)=>n+a.grade!.earned,0),possible:frozen.attempts.reduce((n,a)=>n+a.grade!.possible,0),pending:0,coverage:frozen.attempts.length,total:frozen.attempts.length,rows,frozen};rows.sort((a,b)=>Date.parse(a.finished)-Date.parse(b.finished)||a.key.localeCompare(b.key));const latest=new Map<string,HistoryRow>();for(const row of rows)latest.set(row.questionId,row);const current=[...latest.values()],valid=current.filter(scored);return {frozen:undefined as PracticeSession|undefined,id,date:rows.at(-1)!.finished,earned:valid.reduce((n,r)=>n+r.earned!,0),possible:valid.reduce((n,r)=>n+r.possible!,0),pending:current.filter(r=>r.assessment==='pending').length,coverage:current.length,total:ids.size,rows:current};}).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)||a.id.localeCompare(b.id));
}
