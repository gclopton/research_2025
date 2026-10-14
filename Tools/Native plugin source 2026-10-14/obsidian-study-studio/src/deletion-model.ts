import {embeds,embedSource,replaceEmbed} from './note-authoring';
import {ExamDefinition} from './exam-model';
import {Question} from './model';

/** Remove live embeds only, preserving all surrounding prose and surviving group members. */
export function removeQuestionEmbeds(raw:string,ids:Set<string>){
 let next=raw,count=0;
 for(const block of embeds(raw).reverse()){
  const remaining=block.ids.filter(id=>!ids.has(id));
  if(remaining.length===block.ids.length)continue;
  count+=block.ids.length-remaining.length;
  next=replaceEmbed(next,block,remaining.length?embedSource(remaining,block.group?block.title:undefined,block.prompt):(block.prompt??''));
 }
 return {raw:next,count};
}
export function examUsesQuestions(exam:ExamDefinition,selected:Question[],bank:Question[]){
 const ids=new Set(selected.map(q=>q.definition.id)),families=new Set(selected.map(q=>q.definition.familyId??q.definition.id));
 return exam.sections.some(s=>s.groups.some(g=>g.questions.some(slot=>{
  if(ids.has(slot.questionId))return true;
  const base=bank.find(q=>q.definition.id===slot.questionId);
  return slot.variants!=='exact'&&base&&families.has(base.definition.familyId??base.definition.id);
 })));
}
