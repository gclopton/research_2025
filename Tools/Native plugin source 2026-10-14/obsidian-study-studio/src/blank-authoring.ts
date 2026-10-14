import {equations} from './math-model';
import type {Answer} from './model';
export function blankSelection(source:string,from:number,to:number,id:string){
 if(!source.slice(from,to).trim())throw Error('Select the answer text in the prompt first.');
 if(/\{\{blank:/.test(source.slice(from,to)))throw Error('That selection already contains a blank.');
 const touching=equations(source).filter(q=>from<q.to&&to>q.from);
 let math:Answer['math'];
 if(touching.length){const q=touching[0];
  if(touching.length===1&&from<=q.bodyFrom&&to>=q.bodyTo&&(from>=q.from||!source.slice(from,q.from).trim())&&(to<=q.to||!source.slice(q.to,to).trim())){
   from=q.from;to=q.to;math=q.display?'display':'inline';
  }else if(touching.some(q=>from>q.from||to<q.to))throw Error('Include the whole equation in your selection.');
 }
 const text=source.slice(from,to),accepted=math?equations(text)[0].body.trim():text;
 const marker=`{{blank:${id}}}`;
 return {prompt:source.slice(0,from)+marker+source.slice(to),from,to:from+marker.length,answer:{id,accepted:[accepted],...(math?{math}:{})} as Answer};
}
export function blankTokens(source:string){return [...source.matchAll(/\{\{blank:([\w-]+)\}\}/g)].map(m=>({from:m.index!,to:m.index!+m[0].length,id:m[1]}));}
export function answerText(answer:Answer){const value=answer.accepted[0]??'';return answer.math?(answer.math==='display'?'$$':'$')+value+(answer.math==='display'?'$$':'$'):value;}
