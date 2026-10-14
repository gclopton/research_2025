import {ChapterPlacement} from "./chapter-model";
import {Attempt, validate, grade, gradingRule} from './model';
import {parseSession} from './exam-model';
import {CourseContext,validateCourseContext} from './course-model';
import {restoreDraft,signature} from './practice-state';
export interface HistoryFile {path:string;raw:string;kind:'practice'|'exam'}
export interface HistoryRow {
 practiceContext?:string;
 chapters?:ChapterPlacement[];
 key:string;source:'practice'|'exam';paths:string[];questionId:string;familyId:string;title:string;concepts:string[];
 course:CourseContext;finished:string;mode:'attempt'|'reveal';classification:'first'|'retry'|'reveal';
 assessment?:'pending'|'self-assessed'|'unanswered';
 earned:number|null;possible:number|null;activeSeconds:null;examId?:string;sessionId?:string;section?:string;
}
function parseAttempt(raw:string):Attempt {
 const a=JSON.parse(raw) as Attempt;
 if(!a||a.version!==1||!a.id||typeof a.id!=='string'||!['attempt','reveal'].includes(a.mode)||a.questionId!==a.question?.definition?.id||!Number.isFinite(Date.parse(a.finished))||a.gradingRule!==gradingRule(a.question))throw Error('Invalid attempt record.');
 validate(a.question.definition,a.question.prompt);
 if(a.course!==undefined)validateCourseContext(a.course);
 if(!restoreDraft({version:1,signature:signature(a.question),started:a.started,order:a.choiceOrder,response:a.response,mathIds:[]},a.question))throw Error('Invalid attempt response.');
 if(JSON.stringify(a.grade)!==JSON.stringify(a.mode==='attempt'?grade(a.question,a.response):null))throw Error('Stored grade does not match frozen response.');
 return a;
}
/** Normalize authoritative files only, never the completion cache or current question membership. */
export function normalizeHistory(files:HistoryFile[]) {
 const records=new Map<string,{canonical:string;rows:HistoryRow[];active:boolean}>(),conflicts=new Set<string>(),errors:string[]=[];
 for(const file of files){try{
  let key:string,value:unknown,rows:HistoryRow[],active=false;
  if(file.kind==='practice'){
   const a=parseAttempt(file.raw);key=`practice:${a.id}`;value=a;
   rows=[{key,source:'practice',practiceContext:a.context,paths:[file.path],questionId:a.questionId,familyId:a.question.definition.familyId??a.questionId,title:a.question.definition.title,concepts:a.question.definition.concepts,chapters:a.question.definition.chapters,course:a.course??null,finished:a.finished,mode:a.mode,classification:'reveal',assessment:a.grade?.pending?'pending':a.grade?.basis,earned:a.grade?.pending?null:a.grade?.earned??null,possible:a.grade?.possible??null,activeSeconds:null}];
  }else{
   const s=parseSession(file.raw);key=`exam:${s.id}`;value=s;
   active=s.state==='active';
   rows=s.entries.filter(e=>s.state==='submitted'||e.submittedAt).map(e=>({key:`${key}:${e.id}`,source:'exam' as const,paths:[file.path],questionId:e.question.definition.id,familyId:e.question.definition.familyId??e.question.definition.id,title:e.question.definition.title,concepts:e.question.definition.concepts,chapters:e.question.definition.chapters,course:s.course??null,finished:e.submittedAt??s.finished!,mode:'attempt' as const,classification:'first' as const,assessment:e.result!.pending?'pending':e.result!.basis,earned:e.result!.pending?null:e.result!.earned,possible:e.result!.possible,activeSeconds:null,examId:s.exam.id,sessionId:s.id,section:e.sectionTitle}));
  }
  const canonical=stable(value),prior=records.get(key);
  if(prior){if(prior.canonical!==canonical){conflicts.add(key);errors.push(`Conflicting copies of ${key}: ${file.path}. Excluded from history.`);}else for(const row of prior.rows)row.paths.push(file.path);}
  else records.set(key,{canonical,rows,active});
 }catch(e){errors.push(`${file.path}: ${String(e)}`);}}
 const rows=[...records].filter(([key])=>!conflicts.has(key)).flatMap(([,v])=>v.rows).sort((a,b)=>Date.parse(a.finished)-Date.parse(b.finished)||a.key.localeCompare(b.key));
 const seen=new Set<string>();for(const row of rows){if(row.assessment==='pending')continue;if(row.mode==='reveal'){row.classification='reveal';continue;}const key=JSON.stringify([row.course?.id??null,row.questionId]);row.classification=seen.has(key)?'retry':'first';seen.add(key);}
 return {rows,errors,activeSessions:[...records].filter(([key,v])=>key.startsWith('exam:')&&!conflicts.has(key)&&v.active).length};
}
function stable(value:unknown):string {if(Array.isArray(value))return '['+value.map(stable).join(',')+']';if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}';return JSON.stringify(value);}
export function filterHistory(rows:HistoryRow[],courseId:'all'|'unassigned'|string,kind='all') {return rows.filter(r=>(courseId==='all'||(courseId==='unassigned'?!r.course:r.course?.id===courseId))&&(kind==='all'||r.classification===kind));}
