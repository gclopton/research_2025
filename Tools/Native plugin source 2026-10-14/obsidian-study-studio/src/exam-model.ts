import {CourseContext,validateCourseContext,validateMembership} from "./course-model";
import {parse,stringify,parseDocument} from 'yaml';
import {restoreDraft,signature} from './practice-state';
import {Question,Response,Grade,grade,orderChoices,selectVariants,validate as validateQuestion} from './model';
export interface Ordered {id:string;after?:string[]}
export interface ExamSlot extends Ordered {questionId:string;variants:'exact'|1|2|3|'all'}
export interface ExamGroup extends Ordered {title:string;shuffleQuestions:boolean;questions:ExamSlot[]}
export interface ExamSection extends Ordered {title:string;shuffleGroups:boolean;groups:ExamGroup[]}
export interface ExamDefinition {scope?:{kind:"course"}|{kind:"chapter";chapterId:string};kind?:"assignment"|"quiz"|"test"|"exam";grading?:'on-submit'|'immediate';courseIds?:string[];version:1;id:string;title:string;mode:'all'|'sections';allowBack:boolean;shuffleSections:boolean;sections:ExamSection[]}
export interface ExamEntry {submittedAt?:string;id:string;sectionId:string;sectionTitle:string;groupId:string;groupTitle:string;question:Question;order:string[];response:Response;mathIds:string[];result?:Grade}
export interface ExamSession {course?:CourseContext;version:1;id:string;exam:ExamDefinition;started:string;finished?:string;state:'active'|'submitted';currentSection:number;sectionOrder:string[];entries:ExamEntry[]}
const check=(ok:unknown,message:string)=>{if(!ok)throw Error(message);};
const validId=(v:unknown):v is string=>typeof v==='string'&&/^[\w-]+$/.test(v);
function order<T extends Ordered>(items:T[],shuffle:boolean,random:()=>number):T[]{
 check(Array.isArray(items)&&items.length>0,'Sections, groups and question lists cannot be empty.');
 const ids=new Set(items.map(x=>x.id));check(ids.size===items.length&&items.every(x=>validId(x.id)),'IDs must be unique within their list.');
 for(const x of items)check(x.after===undefined||(Array.isArray(x.after)&&x.after.every(id=>ids.has(id)&&id!==x.id)),'Ordering dependencies must reference another ID in the same list.');
 const pool=[...items],done=new Set<string>(),out:T[]=[];
 while(pool.length){const ready=pool.filter(x=>(x.after??[]).every(id=>done.has(id)));check(ready.length,'Ordering dependencies contain a cycle.');const next=shuffle?ready[Math.floor(random()*ready.length)]:pool[0];check(ready.includes(next),'Fixed order conflicts with an after dependency.');out.push(next);done.add(next.id);pool.splice(pool.indexOf(next),1);}
 return out;
}
export function validateExam(e:ExamDefinition){
 validateMembership(e?.courseIds);
 check(e?.kind===undefined||["assignment","quiz","test","exam"].includes(e.kind),"Invalid assessment kind.");
 check(e?.scope===undefined||(e.scope.kind==="course"||(e.scope.kind==="chapter"&&validId(e.scope.chapterId))),"Invalid assessment scope.");
 check(e?.grading===undefined||['on-submit','immediate'].includes(e.grading),'Invalid grading mode.');
 check(e&&e.version===1&&validId(e.id)&&typeof e.title==='string'&&e.title.trim(),'Exam needs version 1, an ID and a title.');
 check(['all','sections'].includes(e.mode)&&typeof e.allowBack==='boolean'&&typeof e.shuffleSections==='boolean','Invalid presentation settings.');
 const sectionIds=new Set<string>(),groupIds=new Set<string>(),slotIds=new Set<string>();
 for(const s of order(e.sections,e.shuffleSections,()=>0)){
  check(typeof s.title==='string'&&s.title.trim()&&typeof s.shuffleGroups==='boolean','Section needs a title and shuffle setting.');sectionIds.add(s.id);
  for(const g of order(s.groups,s.shuffleGroups,()=>0)){
   check(!groupIds.has(g.id),'Group IDs must be unique across the exam.');groupIds.add(g.id);
   check(typeof g.title==='string'&&g.title.trim()&&typeof g.shuffleQuestions==='boolean','Group needs a title and shuffle setting.');
   for(const slot of order(g.questions,g.shuffleQuestions,()=>0)){check(!slotIds.has(slot.id),'Question slot IDs must be unique across the exam.');slotIds.add(slot.id);check(validId(slot.questionId)&&['exact',1,2,3,'all'].includes(slot.variants),'Invalid question reference or variant count.');}
  }
 }
}
export function parseExam(raw:string):ExamDefinition {const m=/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);check(m,'Exam needs YAML frontmatter.');const e=parse(m![1])?.studyExam;validateExam(e);return e;}
export function serializeExam(exam:ExamDefinition){validateExam(exam);return `---\n${stringify({studyExam:exam})}---\n\n# ${exam.title}\n\n\`\`\`study-exam\n${exam.id}\n\`\`\`\n`;}
export function createSession(exam:ExamDefinition,bank:Question[],id:string,random:()=>number=Math.random,course:CourseContext=null):ExamSession{
 validateCourseContext(course);
 validateExam(exam);const byId=new Map(bank.map(q=>[q.definition.id,q]));const used=new Set<string>(),entries:ExamEntry[]=[];const sections=order(exam.sections,exam.shuffleSections,random);
 for(const s of sections)for(const g of order(s.groups,s.shuffleGroups,random))for(const slot of order(g.questions,g.shuffleQuestions,random)){
  const q=byId.get(slot.questionId);check(q,`Missing question: ${slot.questionId}`);
  const family=q!.definition.familyId??q!.definition.id;
  const pool=bank.filter(x=>(x.definition.familyId??x.definition.id)===family);
  const selected=slot.variants==='exact'?[q!]:selectVariants(pool,slot.variants==='all'?pool.length:slot.variants,random);
  for(const selectedQuestion of selected){check(!used.has(selectedQuestion.definition.id),'A question was selected twice. Use one family slot with multiple variants instead of overlapping references.');used.add(selectedQuestion.definition.id);entries.push({id:`${slot.id}-${selectedQuestion.definition.id}`,sectionId:s.id,sectionTitle:s.title,groupId:g.id,groupTitle:g.title,question:structuredClone(selectedQuestion),order:orderChoices(selectedQuestion,random),response:{choices:[],blanks:{}},mathIds:[]});}
 }
 return {version:1,id,course:structuredClone(course),exam:structuredClone(exam),started:new Date().toISOString(),state:'active',currentSection:0,sectionOrder:sections.map(s=>s.id),entries};
}
export function submitSession(session:ExamSession):ExamSession {check(session.state==='active','Exam is already submitted.');const result=structuredClone(session);result.state='submitted';result.finished=new Date().toISOString();for(const e of result.entries){if(e.submittedAt)continue;if((["short-answer","drawing"].includes(e.question.definition.type))){delete e.response.selfAssessment;e.response.reviewed=true;}e.result=grade(e.question,e.response);}return result;}
export function submitEntry(session:ExamSession,id:string):ExamSession {
 check(session.state==='active'&&session.exam.grading==='immediate','Individual submission requires immediate grading.');
 const next=structuredClone(session),entry=next.entries.find(e=>e.id===id);check(entry&&!entry.submittedAt,'Question is missing or already submitted.');
 if(['short-answer','drawing'].includes(entry!.question.definition.type)){delete entry!.response.selfAssessment;entry!.response.reviewed=true;}
 entry!.submittedAt=new Date().toISOString();entry!.result=grade(entry!.question,entry!.response);return next;
}
export function examScores(session:ExamSession){const sum=(entries:ExamEntry[])=>({earned:entries.reduce((n,e)=>n+(e.result?.pending?0:e.result?.earned??0),0),possible:entries.reduce((n,e)=>n+(!e.result||e.result.pending?0:e.result.possible),0),pending:entries.filter(e=>e.result?.pending).length});return {overall:sum(session.entries),sections:session.sectionOrder.map(id=>({id,title:session.entries.find(e=>e.sectionId===id)!.sectionTitle,...sum(session.entries.filter(e=>e.sectionId===id))}))};}
export function parseSession(raw:string):ExamSession {
 const s=JSON.parse(raw) as ExamSession;check(s?.version===1&&validId(s.id)&&['active','submitted'].includes(s.state),'Invalid exam session.');validateExam(s.exam);if(s.course!==undefined)validateCourseContext(s.course);
 check(Array.isArray(s.entries)&&s.entries.length>0&&Array.isArray(s.sectionOrder)&&s.sectionOrder.length===s.exam.sections.length&&new Set(s.sectionOrder).size===s.sectionOrder.length&&s.sectionOrder.every(id=>s.exam.sections.some(x=>x.id===id)),'Invalid frozen exam sections.');
 check(Number.isInteger(s.currentSection)&&s.currentSection>=0&&s.currentSection<s.sectionOrder.length,'Invalid current section.');
 check(typeof s.started==='string'&&Number.isFinite(Date.parse(s.started))&&(s.state!=='submitted'||(typeof s.finished==='string'&&Number.isFinite(Date.parse(s.finished)))),'Invalid session timestamps.');
 for(const e of s.entries){if(e.submittedAt!==undefined)check(s.exam.grading==='immediate'&&typeof e.submittedAt==='string'&&Number.isFinite(Date.parse(e.submittedAt))&&Date.parse(e.submittedAt)>=Date.parse(s.started),'Invalid question submission.');if(s.state==='active'&&!e.submittedAt)check(e.result===undefined&&e.response?.selfAssessment===undefined&&e.response?.reviewed===undefined,'Unsubmitted questions cannot contain results or self-assessment.');validateQuestion(e.question?.definition,e.question?.prompt);check(restoreDraft({version:1,signature:signature(e.question),started:s.started,order:e.order,response:e.response,mathIds:e.mathIds},e.question),'Invalid session answer or option order.');if(s.state==='submitted'||e.submittedAt)check(JSON.stringify(e.result)===JSON.stringify(grade(e.question,e.response)),'Stored result disagrees with the frozen response.');check(s.sectionOrder.includes(e.sectionId)&&e.response&&Array.isArray(e.response.choices)&&e.response.choices.every(x=>typeof x==='string')&&e.response.blanks&&Object.values(e.response.blanks).every(x=>typeof x==='string')&&Array.isArray(e.order)&&Array.isArray(e.mathIds),'Invalid frozen response.');}
 check(new Set(s.entries.map(e=>e.id)).size===s.entries.length,'Repeated session entry.');
 return s;
}

export function replaceExam(raw:string,exam:ExamDefinition){validateExam(exam);const match=/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);check(match,'Exam needs YAML frontmatter.');const doc=parseDocument(match![1]);check(!doc.errors.length,'Invalid exam frontmatter.');doc.set('studyExam',exam);return '---\n'+doc.toString()+'---'+raw.slice(match![0].length);}

export function assessWrittenEntry(session:ExamSession,id:string,scores:Record<string,number>):ExamSession {

 const next=structuredClone(session),e=next.entries.find(e=>e.id===id);
 check(session.state==='submitted'||(session.exam.grading==='immediate'&&e?.submittedAt),'Submit the question before self-assessing.');
 check(e&&(["short-answer","drawing"].includes(e.question.definition.type)),'Choose a written response.');
 e!.response.reviewed=true;e!.response.selfAssessment=structuredClone(scores);e!.result=grade(e!.question,e!.response);return next;
}
