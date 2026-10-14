import {Question} from './model';
/** Explicit source position, then stable natural path order for older questions. */
export function chapterOrder(questions:Question[]){return [...questions].sort((a,b)=>(a.definition.sourceOrder??Infinity)-(b.definition.sourceOrder??Infinity)||a.path.localeCompare(b.path,undefined,{numeric:true}));}
export function shuffledPractice(questions:Question[],random:()=>number=Math.random){const result=[...questions];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
