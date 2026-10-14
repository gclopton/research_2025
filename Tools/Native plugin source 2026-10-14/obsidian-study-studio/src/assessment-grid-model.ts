import {ExamSession,examScores} from './exam-model';

/** Legacy records belong to a chapter only when every frozen question shares it. */
export function assessmentChapter(session:ExamSession,courseId:string):string|undefined {
 if(session.exam.scope)return session.exam.scope.kind==='chapter'?session.exam.scope.chapterId:undefined;
 let common:Set<string>|undefined;
 for(const entry of session.entries){
  const ids=new Set((entry.question.definition.chapters??[]).filter(c=>c.courseId===courseId).map(c=>c.chapterId));
  common=common===undefined?ids:new Set([...common].filter(id=>ids.has(id)));
 }
 return common?.size===1?[...common][0]:undefined;
}
export function assessmentGrid(records:{session:ExamSession;path:string}[],courseId:string,chapterId?:string){
 const groups=new Map<string,{id:string;title:string;kind:string;attempts:{id:string;date:string;path:string;earned:number;possible:number;pending:number}[]}>();
 for(const {session:s,path}of records){
  if(s.state!=='submitted'||(courseId==='unassigned'?!!s.course:s.course?.id!==courseId))continue;
  if(chapterId&&assessmentChapter(s,courseId)!==chapterId)continue;
  const group=groups.get(s.exam.id)??{id:s.exam.id,title:s.exam.title,kind:s.exam.kind??'Assessment',attempts:[]};
  if(group.attempts.some(a=>a.id===s.id))continue;
  group.attempts.push({id:s.id,date:s.finished!,path,...examScores(s).overall});groups.set(s.exam.id,group);
 }
 for(const group of groups.values())group.attempts.sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)||a.id.localeCompare(b.id));
 return [...groups.values()].sort((a,b)=>a.title.localeCompare(b.title));
}
