import {Question} from './model';
import {HistoryRow,filterHistory} from './history-model';
export const scored=(r:HistoryRow)=>r.mode==='attempt'&&r.assessment!=='pending'&&r.earned!==null&&r.possible!==null&&r.possible>0;
function ratio(rows:HistoryRow[]){const valid=rows.filter(scored);return {earned:valid.reduce((n,r)=>n+r.earned!,0),possible:valid.reduce((n,r)=>n+r.possible!,0),count:valid.length};}
export function courseMetrics(bank:Question[],history:HistoryRow[],courseId:string){
 const rows=filterHistory(history,courseId).slice().sort((a,b)=>Date.parse(a.finished)-Date.parse(b.finished)||a.key.localeCompare(b.key));
 const catalog=new Map(bank.filter(q=>courseId==='all'||(courseId==='unassigned'?!(q.definition.courseIds?.length):q.definition.courseIds?.includes(courseId))).map(q=>[q.definition.id,{id:q.definition.id,title:q.definition.title,concepts:q.definition.concepts}]));
 for(const row of rows)if(!catalog.has(row.questionId))catalog.set(row.questionId,{id:row.questionId,title:row.title,concepts:row.concepts});
 const byQuestion=new Map<string,HistoryRow[]>();for(const row of rows){const list=byQuestion.get(row.questionId)??[];list.push(row);byQuestion.set(row.questionId,list);}
 const questions=[...catalog.values()].map(q=>{const events=byQuestion.get(q.id)??[],graded=events.filter(scored);return {...q,concepts:[...new Set([...q.concepts,...events.flatMap(e=>e.concepts)])],events,graded,latest:graded.at(-1),lastSeen:events.at(-1)?.finished,pending:events.filter(r=>r.assessment==='pending').length,reveals:events.filter(r=>r.mode==='reveal').length};});
 const conceptNames=[...new Set(questions.flatMap(q=>q.concepts.length?q.concepts:['Untagged']))].sort();
 const concepts=conceptNames.map(name=>{const items=questions.filter(q=>(q.concepts.length?q.concepts:['Untagged']).includes(name));const events=rows.filter(r=>(r.concepts.length?r.concepts:['Untagged']).includes(name)),graded=events.filter(scored),latest=new Map<string,HistoryRow>();for(const e of graded)latest.set(e.questionId,e);return {name,questions:items.length,tested:latest.size,latest:ratio([...latest.values()]),first:ratio(graded.filter(r=>r.classification==='first')),pending:events.filter(r=>r.assessment==='pending').length,lastSeen:events.at(-1)?.finished};});
 const days=new Map<string,HistoryRow[]>();for(const row of rows.filter(scored)){const day=row.finished.slice(0,10);days.set(day,[...(days.get(day)??[]),row]);}
 const sessions=new Map<string,HistoryRow[]>();for(const row of rows.filter(r=>r.sessionId))sessions.set(row.sessionId!,[...(sessions.get(row.sessionId!)??[]),row]);
 return {questions,concepts,rows,first:ratio(rows.filter(r=>r.classification==='first')),retries:ratio(rows.filter(r=>r.classification==='retry')),latest:ratio(questions.flatMap(q=>q.latest?[q.latest]:[])),pending:rows.filter(r=>r.assessment==='pending').length,reveals:rows.filter(r=>r.mode==='reveal').length,days:[...days].map(([day,r])=>({day,...ratio(r)})),exams:[...sessions].map(([id,r])=>({id,examId:r[0].examId,...ratio(r),pending:r.filter(x=>x.assessment==='pending').length,sections:[...new Set(r.map(x=>x.section))].map(title=>({title,...ratio(r.filter(x=>x.section===title))}))}))};
}

/** Current inventory plus historical placement snapshots; moving a question never moves old grades. */
export function chapterMetrics(bank:Question[],history:HistoryRow[],courseId:string){
 const rows=filterHistory(history,courseId),names=new Map<string,string>();
 const placement=(chapters:{courseId:string;chapterId:string;title:string}[]|undefined)=>chapters?.find(p=>p.courseId===courseId);
 const relevant=bank.filter(q=>q.definition.courseIds?.includes(courseId));
 for(const r of rows){const p=placement(r.chapters);names.set(p?.chapterId??'unassigned-chapter',p?.title??'Unassigned chapter');}
 for(const q of relevant){const p=placement(q.definition.chapters);names.set(p?.chapterId??'unassigned-chapter',p?.title??'Unassigned chapter');}
 return [...names].sort(([a],[b])=>a.localeCompare(b)).map(([id,title])=>{const questions=relevant.filter(q=>(placement(q.definition.chapters)?.chapterId??'unassigned-chapter')===id),events=rows.filter(r=>(placement(r.chapters)?.chapterId??'unassigned-chapter')===id);return {id,title,bank:questions,history:events,metrics:courseMetrics(questions,events,courseId)};});
}
