// Equation serialization adapted from the companion Math Studio plugin.
export interface Equation {from:number; to:number; bodyFrom:number; bodyTo:number; body:string; display:boolean; raw:string}
const escaped=(s:string,i:number)=>{let n=0;while(i>0&&s[--i]==='\\')n++;return n%2===1;};
/** Scan Markdown math while ignoring fenced code, inline code and frontmatter. */
export function equations(s:string):Equation[]{
 const out:Equation[]=[];let i=0;let fence='';let fenceLength=0;
 if(s.startsWith('---\n')||s.startsWith('---\r\n')){const m=/\r?\n(?:---|\.\.\.)\s*(?:\r?\n|$)/g;m.lastIndex=3;const end=m.exec(s);if(end)i=end.index+end[0].length;}
 while(i<s.length){
  if(i===0||s[i-1]==='\n'){
   const line=s.slice(i,s.indexOf('\n',i)<0?s.length:s.indexOf('\n',i));
   const f=/^ {0,3}(`{3,}|~{3,})/.exec(line);
   if(f){if(!fence){fence=f[1][0];fenceLength=f[1].length;}else if(f[1][0]===fence&&f[1].length>=fenceLength)fence='';i+=line.length+1;continue;}
   if(fence||/^ {4}|^\t/.test(line)){i+=line.length+1;continue;}
  }
  if(s[i]==='`'&&!escaped(s,i)){let n=1;while(s[i+n]==='`')n++;const end=s.indexOf('`'.repeat(n),i+n);i=end<0?i+n:end+n;continue;}
  if(s[i]!=='$'||escaped(s,i)){i++;continue;}
  const display=s[i+1]==='$';const size=display?2:1;const start=i;let j=i+size;
  if(!display&&/\s/.test(s[j]??'')){i++;continue;}
  let end=-1;
  while(j<s.length){
   if(!display&&s[j]==='\n')break;
   // An unfinished expression must not consume a later paragraph or fenced block.
   if(display&&s[j]==='\n'&&/^[ \t]*\r?\n/.test(s.slice(j+1)))break;
   if(display&&s[j]==='\n'&&/^ {0,3}(?:`{3,}|~{3,})/.test(s.slice(j+1)))break;
   if(s[j]==='$'&&!escaped(s,j)){
    // Single and double dollar delimiters never close one another.
    if(!display&&s[j+1]==='$')break;
    if(display&&s[j+1]!=='$')break;
    end=j;break;
   }j++;
  }
  if(end<0){i+=size;continue;}
  if(!display&&(/\s/.test(s[end-1]??'')||/\d/.test(s[end+1]??''))){i=end+size;continue;}
  const to=end+size;out.push({from:start,to,bodyFrom:start+size,bodyTo:end,body:s.slice(start+size,end),display,raw:s.slice(start,to)});i=to;
 }
 return out;
}
export interface Tag {kind:'none'|'manual'|'auto';label:string;id?:string}
export function splitTag(body:string):{latex:string;tag:Tag}{
 const auto=/% math-studio:auto:([a-zA-Z0-9-]+)/.exec(body);
 const tags=[...body.matchAll(/\\tag\{([^{}]*)\}/g)];
 const tag=tags.length===1?tags[0]:undefined;
 return {latex:body.replace(/% math-studio:auto:[a-zA-Z0-9-]+\s*/g,'').replace(/\\tag\{[^{}]*\}/g,'').trim(),tag:auto?{kind:'auto',label:tag?.[1]??'',id:auto[1]}:tag?{kind:'manual',label:tag[1]}:{kind:'none',label:''}};
}
export function unsupported(body:string):string|null{
 if(/\\(?:newcommand|renewcommand|def|gdef|require|html\w*|href|includegraphics|class|style)\b/.test(body))return 'This equation uses a macro definition or an external/HTML command. Keep editing it in native LaTeX.';
 const stripped=body.replace(/% math-studio:auto:[a-zA-Z0-9-]+/g,'');
 if(/(^|[^\\])%/.test(stripped))return 'This equation contains LaTeX comments. Native editing preserves them exactly.';
 if((body.match(/\\tag\b/g)||[]).length>1||/\\tag\*/.test(body)||/\\label\b|\\ref\b|\\eqref\b/.test(body))return 'This equation uses labels, references or multiple tags. Use native editing to preserve them.';
 if(/\\tag\{[^}]*\{/.test(body))return 'Nested equation tags are supported in native editing only.';
 return null;
}
export function compose(original:Equation,latex:string,tag:Tag):string{
 const label=tag.label.trim();if(/[{}\\\n\r]/.test(label))throw Error('Use a plain equation label without braces, backslashes or line breaks.');
 let body=latex.trim();if(tag.kind!=='none'&&original.display)body+=`\\tag{${label||'1'}}`;
 if(tag.kind==='auto'&&original.display)body+=`\n% math-studio:auto:${tag.id||crypto.randomUUID()}`;
 if(original.display)return `$$\n${body}\n$$`;
 return `$${body}$`;
}
export function numberingEdits(doc:string):{from:number;to:number;insert:string}[]{
 let n=0;const ids=new Set<string>();const edits=[];
 for(const q of equations(doc)){
  const {tag}=splitTag(q.body);if(tag.kind!=='auto'||!q.display)continue;n++;
  let raw=q.raw;const id=tag.id!;if(ids.has(id))raw=raw.replace(`math-studio:auto:${id}`,`math-studio:auto:${crypto.randomUUID()}`);ids.add(id);
  raw=/\\tag\{[^{}]*\}/.test(raw)?raw.replace(/\\tag\{[^{}]*\}/,`\\tag{${n}}`):raw.replace(/\n% math-studio:auto:/,`\\tag{${n}}\n% math-studio:auto:`);
  if(raw!==q.raw)edits.push({from:q.from,to:q.to,insert:raw});
 }
 return edits;
}
export function safeReplacement(doc:string,q:Equation,replacement:string){if(doc.slice(q.from,q.to)!==q.raw)throw Error('The equation changed outside this visual editor. Your draft is kept open; cancel and reopen the current equation.');return {from:q.from,to:q.to,insert:replacement};}

/** Empty visual slots become ordinary empty TeX groups, never plugin commands. */
export function saveableLatex(latex:string):string {
 return latex.replace(/\\placeholder(?:\[[^\]]*\])?\{[^{}]*\}/g,'{}');
}

export function fieldEquations(value: string, answers: boolean): Equation[] {
  if (!answers) return equations(value);
  const result: Equation[] = []; let offset = 0;
  for (const line of value.split('\n')) {
    const start = line.search(/\S/);
    if (start >= 0) {
      const body = line.trim(), from = offset + start;
      const parsed = equations(body);
      result.push(parsed.length === 1 && parsed[0].raw === body
        ? {...parsed[0], from, to: from + body.length, bodyFrom: from + (parsed[0].display ? 2 : 1), bodyTo: from + body.length - (parsed[0].display ? 2 : 1)}
        : {from, to: from + body.length, bodyFrom: from, bodyTo: from + body.length, raw: body, body, display: false});
    }
    offset += line.length + 1;
  }
  return result;
}
export function replaceFieldMath(source: string, q: Equation, latex: string, tag: Tag): string {
  const replacement = q.bodyFrom === q.from ? latex.trim() : compose(q, latex, tag);
  if (q.bodyFrom === q.from && /[\r\n]/.test(replacement)) throw Error('Keep each accepted answer on one line.');
  safeReplacement(source, q, replacement);
  return source.slice(0, q.from) + replacement + source.slice(q.to);
}


/** Resolve an equation at the caret, including a newly typed empty inline pair. */
export function equationAt(source:string, at:number):Equation|undefined {
 // Caret intent takes precedence over the document scanner: $|$ is an empty
 // inline pair, even when a later display opener makes it look like $$…$$.
 // Keep this local to caret lookup; normal rendering/numbering still uses equations().
 if(at>0&&source[at-1]==='$'&&source[at]==='$'&&source[at-2]!=='$'&&source[at+1]!=='$'&&!escaped(source,at-1)){
   // Reuse the scanner to reject code/frontmatter rather than bypassing it.
   const probe=source.slice(0,at)+'x'+source.slice(at);
   if(equations(probe).some(q=>q.from===at-1&&!q.display))
     return {from:at-1,to:at+1,bodyFrom:at,bodyTo:at,body:'',display:false,raw:'$$'};
 }
 return equations(source).find(q=>at>=q.from&&at<=q.to);
}
