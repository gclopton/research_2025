import { stringify } from 'yaml';
import { Kind, Question, parseQuestion, template } from './model';

function cells(line: string): string[] {
  let text=line.trim(); if(text.startsWith('|')) text=text.slice(1);
  if(text.endsWith('|') && !text.endsWith('\\|')) text=text.slice(0,-1);
  const out:string[]=[]; let cell='',ticks=0;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='\\' && text[i+1]==='|') {cell+='\\|';i++;continue;}
    if(c==='`') {let n=1;while(text[i+n]==='`')n++; if(!ticks)ticks=n;else if(ticks===n)ticks=0;cell+='`'.repeat(n);i+=n-1;continue;}
    if(c==='|'&&!ticks){out.push(cell.trim());cell='';}else cell+=c;
  }
  out.push(cell.trim());return out;
}
export function selectedTable(selection: string) {
  const lines=selection.trim().split(/\r?\n/);
  if(lines.length<3 || !lines[0].includes('|')) return null;
  const columns=cells(lines[0]), separator=cells(lines[1]);
  if(separator.length!==columns.length || !separator.every(x=>/^:?-{3,}:?$/.test(x))) return null;
  const rows=lines.slice(2).map(cells);
  if(rows.some(row=>row.length!==columns.length)) throw Error('Select a complete rectangular Markdown table, including its header and separator.');
  return {columns,rows:rows.map(row=>row.map(text=>({text})))};
}
export function intakeDraft(kind:Kind,id:string,title:string,selection:string,path:string):Question {
  const q=parseQuestion(template(kind,id,title,selection),path);
  if(kind==='choice'){q.definition.choices!.forEach(c=>c.text='');q.definition.correct=[];q.prompt=selection;q.explanation='';}
  if(kind==='table'){q.prompt='';q.explanation='';q.definition.answers=[];q.definition.table={columns:['',''],rows:Array.from({length:2},()=>[{text:''},{text:''}])};}
  if(kind==='table' && selection.trim()) {
    const table=selectedTable(selection);
    if(!table) throw Error('For table import, select the complete Markdown table including the header separator, or start with no selection.');
    q.definition.table=table;
  }
  if(kind==='table'){
    q.definition.answers=[];
    q.definition.table!.rows=q.definition.table!.rows.map(row=>row.map(cell=>{
      const blank=`cell-${crypto.randomUUID()}`,sourceText=cell.text??'';
      q.definition.answers!.push({id:blank,accepted:sourceText.trim()?[sourceText.trim().replace(/^\$\$?([\s\S]*?)\$\$?$/,'$1').trim()]:[]});
      return {blank,sourceText};
    }));
  }
  if(kind==='code' && selection.trim()) {
    const fenced=/^```(python|bash|sh|mathematica|wolfram|cpp|c\+\+)?[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/.exec(selection.trim());
    const language=fenced?.[1];q.definition.code={language:language==='sh'?'bash':language==='wolfram'?'mathematica':language==='c++'?'cpp':(language||'python') as 'python',source:fenced?fenced[2]:selection};q.definition.answers=[];q.prompt='Complete the missing code.';
  }
  if(kind==='blank') {q.prompt=selection;q.definition.answers=[];q.explanation='';}
  q.raw=`---\n${stringify({study:q.definition})}---\n\n## Prompt\n\n${q.prompt}\n\n## Explanation\n\n${q.explanation}\n`;
  return q;
}
export function cardInsertion(source:string,selectionEnd:number,id:string) {
  const newline=source.indexOf('\n',selectionEnd);
  const at=newline<0?source.length:newline;
  return {at,text:`\n\n\`\`\`study\n${id}\n\`\`\`\n`};
}

/** Locate explicitly quoted callout blocks, excluding Markdown fenced examples. */
function callouts(source: string) {
  const lines: {start:number;end:number;text:string}[]=[];
  let offset=0;
  for(const text of source.split('\n')) {lines.push({start:offset,end:offset+text.length,text});offset+=text.length+1;}
  const spans:{start:number;end:number;depth:number;after:number}[]=[];
  let fence='';let fenceLength=0;
  for(let i=0;i<lines.length;i++) {
    const line=lines[i], mark=/^ {0,3}(`{3,}|~{3,})/.exec(line.text);
    if(mark) {if(!fence){fence=mark[1][0];fenceLength=mark[1].length;}else if(mark[1][0]===fence&&mark[1].length>=fenceLength)fence='';continue;}
    if(fence)continue;
    const header=/^ {0,3}((?:> ?)+)\[![^\]]+\][+-]?(?:\s|$)/.exec(line.text);
    if(!header)continue;
    const depth=(header[1].match(/>/g)||[]).length;
    let j=i+1;
    for(;j<lines.length;j++) {
      const quote=/^ {0,3}((?:> ?)+)/.exec(lines[j].text);
      if(!quote || (quote[1].match(/>/g)||[]).length<depth)break;
      const next=/^ {0,3}((?:> ?)+)\[![^\]]+\][+-]?(?:\s|$)/.exec(lines[j].text);
      if(next && (next[1].match(/>/g)||[]).length===depth)break;
    }
    let anchor=j;
    while(anchor<lines.length && !lines[anchor].text.trim())anchor++;
    const after=anchor<lines.length && /^\^[\w-]+\s*$/.test(lines[anchor].text) ? lines[anchor].end : lines[j-1].end;
    spans.push({start:line.start,end:lines[j-1].end,depth,after});i=j-1;
  }
  return {lines,spans};
}
export function calloutSelection(source:string,from:number,to:number):{text:string;insertionEnd:number} {
  const {lines,spans}=callouts(source);
  const relevant=spans.filter(span=>from<span.end && to>span.start);
  if(!relevant.length)return {text:source.slice(from,to),insertionEnd:to};
  const pieces:string[]=[];
  for(const line of lines) {
    if(line.start>=to || line.end<from)continue;
    const start=Math.max(from,line.start),end=Math.min(to,line.end);
    const span=relevant.find(span=>line.start>=span.start&&line.end<=span.end);
    let cleanStart=start;
    if(span) {
      const prefix=/^ {0,3}((?:> ?)+)/.exec(line.text);
      if(prefix) {
        let removed=0,depth=0;
        while(removed<prefix[0].length && depth<span.depth){if(prefix[0][removed++]==='>'){depth++;if(prefix[0][removed]===' ')removed++;}}
        cleanStart=Math.max(start,line.start+removed);
      }
      if(line.start===span.start)continue; // surrounding callout heading is not question content
    }
    pieces.push(source.slice(Math.min(cleanStart,end),end));
  }
  return {text:pieces.join('\n'),insertionEnd:Math.max(to,...relevant.map(span=>span.after))};
}
