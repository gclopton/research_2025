import {markdownContext} from './markdown-context';
/** Fenced code ranges for visual styling. Contents are never transformed or executed. */
export function fencedCode(source:string){
 const blocks:{from:number;to:number;lines:number[];language:string}[]=[];let start=-1,marker='',length=0,language='',lines:number[]=[];
 let offset=0;for(const line of source.split('\n')){const m=/^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
  if(start<0&&m){start=offset;marker=m[1][0];length=m[1].length;language=m[2].trim().split(/\s/)[0];lines=[offset];}
  else if(start>=0){lines.push(offset);if(m&&m[1][0]===marker&&m[1].length>=length&&!m[2].trim()){blocks.push({from:start,to:offset+line.length,lines,language});start=-1;}}
  offset+=line.length+1;
 }
 if(start>=0)blocks.push({from:start,to:source.length,lines,language});return blocks;
}

import {equations} from './math-model';
/** Keep the entire equation source visible while any selection touches it. */
export function renderedEquations(source:string,selections:readonly {from:number;to:number}[],readOnly=false){
 return equations(source).filter(q=>q.body.trim() && (readOnly||!selections.some(s=>s.from<=q.to&&s.to>=q.from)));
}

/** Existing valid equations form parsing boundaries during edits elsewhere. */
export function anchoredEquations(source:string,anchors:readonly {from:number;to:number}[]){
 const code=markdownContext(source).excluded;
 const preserved=anchors.flatMap(a=>{
  if(a.from<0||a.to>source.length||a.from>=a.to||code.some(b=>a.from<b.to&&a.to>b.from))return [];
  let slashes=0;for(let i=a.from-1;i>=0&&source[i]==='\\';i--)slashes++;
  if(slashes%2)return [];
  const fragment=source.slice(a.from,a.to);
  if(fragment.startsWith('$')&&!fragment.startsWith('$$')&&(source[a.from-1]==='$'||source[a.to]==='$'))return [];
  const parsed=equations(fragment);
  return parsed.length===1&&parsed[0].from===0&&parsed[0].to===fragment.length?[{...parsed[0],from:a.from,to:a.to,bodyFrom:parsed[0].bodyFrom+a.from,bodyTo:parsed[0].bodyTo+a.from}]:[];
 }).sort((a,b)=>a.from-b.from);
 // Preserve global context (code fences, frontmatter); reject only competing math spans.
 const candidates=equations(source).filter(q=>!preserved.some(a=>q.from<a.to&&q.to>a.from));
 return [...candidates,...preserved].sort((a,b)=>a.from-b.from);
}
