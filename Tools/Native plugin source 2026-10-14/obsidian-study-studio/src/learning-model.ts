import {HistoryRow} from './history-model';
import {Question} from './model';
export const REVIEW_INTERVALS=[1,3,7,14,30,60];
export function localDay(date:Date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function shiftDay(day:string,days:number){const [y,m,d]=day.split('-').map(Number),date=new Date(y,m-1,d,12);date.setDate(date.getDate()+days);return localDay(date);}
export function validDay(day:unknown):day is string{return typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&shiftDay(day,0)===day;}
export interface ReviewItem {question:Question;status:'new'|'due'|'overdue'|'scheduled';due:string|null;stage:number;last:string|null;lapses:number;}
/** Transparent v1 scheduling, not a calibrated memory model. First scored event per local day advances;
 * any failure on that day resets. Repeated same-day correct answers cannot farm longer intervals. */
export function reviewQueue(bank:Question[],rows:HistoryRow[],courseId:string,today=localDay(new Date())):ReviewItem[]{
 if(!validDay(today))throw Error('Invalid review date');
 return bank.filter(q=>q.definition.courseIds?.includes(courseId)&&!['short-answer','drawing'].includes(q.definition.type)).map(question=>{
  const events=rows.filter(r=>r.course?.id===courseId&&r.questionId===question.definition.id&&r.mode==='attempt'&&r.assessment!=='pending'&&r.assessment!=='unanswered'&&r.earned!==null&&r.possible!==null&&r.possible>0).sort((a,b)=>a.finished.localeCompare(b.finished)||a.key.localeCompare(b.key));
  const days=new Map<string,boolean>();for(const e of events){const day=localDay(new Date(e.finished));if(day>today)continue;days.set(day,(days.get(day)??true)&&e.earned===e.possible);}
  let stage=-1,lapses=0,last:string|null=null,due:string|null=null;for(const [day,success]of days){if(success)stage=Math.min(stage+1,REVIEW_INTERVALS.length-1);else{stage=0;lapses++;}last=day;due=shiftDay(day,REVIEW_INTERVALS[stage]);}
  const status:ReviewItem['status']=due===null?'new':due<today?'overdue':due===today?'due':'scheduled';return {question,status,due,stage,last,lapses};
 }).sort((a,b)=>(a.due??'9999').localeCompare(b.due??'9999')||a.question.definition.title.localeCompare(b.question.definition.title));
}
export interface PlanEvent {id:string;courseId:string;day:string;title:string;note:string;}
export function parsePlan(raw:string):PlanEvent[]{const x=JSON.parse(raw);if(!Array.isArray(x)||x.some(e=>!e||typeof e.id!=='string'||typeof e.courseId!=='string'||!validDay(e.day)||typeof e.title!=='string'||!e.title.trim()||typeof e.note!=='string')||new Set(x.map(e=>e.id)).size!==x.length)throw Error('Invalid study calendar file');return x;}
