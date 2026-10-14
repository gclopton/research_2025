export const codeLanguages = {python:'Python',bash:'Linux shell (Bash)',mathematica:'Wolfram Language / Mathematica',cpp:'C++'};
export interface CodeDefinition {language:keyof typeof codeLanguages;source:string}
export function codeMarkers(source:string){return [...source.matchAll(/\{\{blank:([\w-]+)\}\}/g)].map(m=>({id:m[1],from:m.index!,to:m.index!+m[0].length}));}
export function makeCodeBlank(source:string,from:number,to:number,id:string){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to>source.length||from>=to||!source.slice(from,to).trim())throw Error('Select some code first.');
 if(!/^[\w-]+$/.test(id)||codeMarkers(source).some(m=>m.id===id))throw Error('Blank ID must be new and valid.');
 if(codeMarkers(source).some(m=>from<m.to&&to>m.from))throw Error('Select supplied code without overlapping an existing blank.');
 return {source:source.slice(0,from)+`{{blank:${id}}}`+source.slice(to),answer:source.slice(from,to)};
}
export function fillCode(source:string,answers:Record<string,string>){return source.replace(/\{\{blank:([\w-]+)\}\}/g,(_,id:string)=>answers[id]??`{{blank:${id}}}`);}
export function normalizeCodeAnswer(value:string,policy:'exact'|'trim-outer'='exact'){const normalized=value.replace(/\r\n?/g,'\n');return policy==='trim-outer'?normalized.trim():normalized;}
export function codeFence(source:string,language=''){const n=Math.max(3,...[...source.matchAll(/`+/g)].map(m=>m[0].length+1));const fence='`'.repeat(n);return `${fence}${language}\n${source}\n${fence}`;}
