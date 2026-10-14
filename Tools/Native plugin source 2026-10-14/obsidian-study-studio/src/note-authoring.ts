import {stringify,parse} from 'yaml';
import {parseGroup} from './practice-state';
import {ChapterPlacement,validatePlacements} from './chapter-model';
export interface Embed {start:number;end:number;raw:string;title:string;prompt?:string;ids:string[];group:boolean}
/** Only top-level fences; ignore study examples nested inside longer code fences. */
export function embeds(text:string):Embed[]{
 const out:Embed[]=[];let offset=0,open:{start:number;mark:string;length:number;type:string;body:number}|undefined;
 for(const line of text.split(/(?<=\n)/)){const value=line.replace(/\r?\n$/,''),m=/^ {0,3}(`{3,}|~{3,})(.*)$/.exec(value);
  if(m){if(!open)open={start:offset,mark:m[1][0],length:m[1].length,type:m[2].trim(),body:offset+line.length};else if(m[1][0]===open.mark&&m[1].length>=open.length&&!m[2].trim()){
   if(open.type==='study'||open.type==='study-group'){const body=text.slice(open.body,offset).trim(),group=open.type==='study-group';const g=group?parseGroup(body):{title:body,questions:[body],prompt:undefined};if(!g.questions.every(id=>/^[\w-]+$/.test(id)))throw Error('Invalid question ID.');out.push({start:open.start,end:offset+value.length,raw:text.slice(open.start,offset+value.length),title:g.title,prompt:g.prompt,ids:g.questions,group});}open=undefined;
  }}offset+=line.length;
 }return out;
}
export function embedSource(ids:string[],title?:string,prompt?:string){if(!ids.length&&!title)return '';if(new Set(ids).size!==ids.length||ids.some(id=>!/^[-\w]+$/.test(id)))throw Error('Expected unique question IDs.');return title?`\`\`\`study-group\n${stringify({title,...(prompt?{prompt}:{}),questions:ids},{defaultStringType:"QUOTE_DOUBLE"})}\`\`\``:`\`\`\`study\n${ids[0]}\n\`\`\``;}
export function replaceEmbed(text:string,embed:Embed,replacement:string){if(text.slice(embed.start,embed.end)!==embed.raw)throw Error('The note changed. Reopen its question controls.');return text.slice(0,embed.start)+replacement+text.slice(embed.end);}
export function removeMember(text:string,embed:Embed,id:string){const ids=embed.ids.filter(x=>x!==id);return replaceEmbed(text,embed,ids.length?embedSource(ids,embed.group?embed.title:undefined,embed.prompt):(embed.prompt??''));}
export function moveToGroup(text:string,source:Embed,id:string,target:Embed){if(source.start===target.start)throw Error('Choose a different group.');if(target.ids.includes(id))throw Error('That group already contains this question.');const changes=[{e:source,s:source.ids.filter(x=>x!==id)},{e:target,s:[...target.ids,id]}].sort((a,b)=>b.e.start-a.e.start);for(const {e,s}of changes)text=replaceEmbed(text,e,s.length?embedSource(s,e.group?e.title:undefined,e.prompt):(e.prompt??''));return text;}
export function chapterConfig(raw:string):ChapterPlacement|undefined{const m=/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw),p=m?parse(m[1])?.studyChapter:undefined;if(p===undefined)return;validatePlacements([p],[p.courseId]);return p;}
export function scopeQuestions<T extends {definition:{courseIds?:string[];chapters?:ChapterPlacement[]}}>(bank:T[],scope:'chapter'|'course'|'all',context?:{courseId:string;chapterId?:string}){if(scope==='all')return bank;if(!context)return [];return bank.filter(q=>scope==='course'?q.definition.courseIds?.includes(context.courseId):q.definition.chapters?.some(p=>p.courseId===context.courseId&&p.chapterId===context.chapterId));}
