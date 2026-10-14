import {CourseContext,validateCourseContext} from "./course-model";
import {parse} from 'yaml';
import {Question, Response, validateSelfAssessment} from './model';
export interface PracticeDraft {course?:CourseContext;version:1; signature:string; started:string; order:string[]; response:Response; mathIds:string[]}
export function signature(q:Question):string {return JSON.stringify([q.definition,q.prompt,q.explanation]);}
export function draftKey(context:string,id:string):string {return JSON.stringify([context,id]);}
export function restoreDraft(value:unknown,q:Question):PracticeDraft|undefined {
  const d=value as PracticeDraft;
  if(!d || d.version!==1 || d.signature!==signature(q) || typeof d.started!=='string' || !Number.isFinite(Date.parse(d.started)))return;
  try {if(d.course!==undefined)validateCourseContext(d.course);}catch{return;}
  const ids=new Set((["short-answer","drawing"].includes(q.definition.type))?['response']:q.definition.answers?.map(a=>a.id)??[]), choices=new Set(q.definition.choices?.map(c=>c.id)??[]);
  if(!Array.isArray(d.order)||d.order.length!==choices.size||new Set(d.order).size!==choices.size||!d.order.every(id=>choices.has(id)))return;
  if(!d.response || !Array.isArray(d.response.choices)||!d.response.choices.every(id=>choices.has(id))||!d.response.blanks||typeof d.response.blanks!=='object'||Array.isArray(d.response.blanks))return;
  if(q.definition.type==='ordering'&&(new Set(d.response.choices).size!==d.response.choices.length||![0,choices.size].includes(d.response.choices.length)))return;
  if(!Object.entries(d.response.blanks).every(([id,v])=>ids.has(id)&&typeof v==='string'))return;
  if(!Array.isArray(d.mathIds)||!d.mathIds.every(id=>ids.has(id)))return;
  try{validateSelfAssessment(q,d.response);}catch{return;}
  return structuredClone(d);
}
export interface QuestionGroup {title:string; prompt?:string; questions:string[]}
export function parseGroup(source:string):QuestionGroup {
  const g=parse(source);
  if(!g || (g.prompt!==undefined&&typeof g.prompt!=='string') || typeof g.title!=='string'||!g.title.trim()||!Array.isArray(g.questions)||!g.questions.every((id:unknown)=>typeof id==='string'&&/^[\w-]+$/.test(id))||new Set(g.questions).size!==g.questions.length)throw Error('A study-group needs a title and a list of unique question IDs.');
  return {title:g.title.trim(),...(g.prompt?{prompt:g.prompt}:{}),questions:g.questions};
}
export function noteQuestionIds(source:string):string[] {
  const ids:string[]=[];
  for(const match of source.matchAll(/^```(study|study-group)[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm)) {
    if(match[1]==='study-group')ids.push(...parseGroup(match[2]).questions);
    else {const id=match[2].trim();if(/^[\w-]+$/.test(id))ids.push(id);}
  }
  return [...new Set(ids)];
}

/** Cache keys only. Authoritative attempts and exam sessions are never reset. */
export function practiceResetKeys(context:string,ids:readonly string[],drafts:Record<string,unknown>,completions:Record<string,unknown>):string[]{
 const targets=new Set(ids.map(id=>draftKey(context,id)));
 return [...new Set([...Object.keys(drafts),...Object.keys(completions)])].filter(key=>targets.has(key));
}
