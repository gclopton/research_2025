/** Read-only source import. Copies only final notes, linked support, and assets to the lab. */
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {join,dirname,relative,resolve,basename,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {stringify} from 'yaml';
import {serialize,parseQuestion,grade,Definition} from '../src/model';
const source='/Users/gradyclopton/ObsidianVaults/fluid_dynamics';
const lab=process.argv[2];if(lab!=='/Users/gradyclopton/ObsidianVaults/study_studio_lab')throw Error('This importer targets the isolated lab only.');
const vff=join(source,'Books/NPTEL/Theoretical/Viscous Fluid Flow - 112103302');
const tensor=join(source,'Courses/Viscous Flow and Heat Transfer - UIUC ME 411');
const course='viscous-fluid-flow',base='Courses/Viscous Fluid Flow';
const dirs=(p:string)=>readdirSync(p,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>join(p,x.name));
const finals=(p:string)=>dirs(p).flatMap(d=>readdirSync(d).filter(n=>n.endsWith('final draft.md')).map(n=>join(d,n))).sort();
const fluid=finals(vff),tensors=finals(tensor).filter(f=>/002[ab] - Tensor/.test(f));
if(fluid.length!==24||tensors.length!==8)throw Error(`Inspect source selection: ${fluid.length} fluid, ${tensors.length} tensor.`);
const selected=[...tensors,...fluid];const pending=new Map<string,Buffer>();const manifests:any[]=[];const unresolved=new Set<string>();
const put=(p:string,value:string|Buffer)=>{const data=Buffer.isBuffer(value)?value:Buffer.from(value);if(pending.has(p)&&!pending.get(p)!.equals(data))throw Error('Conflicting generated path '+p);pending.set(p,data);};
const walk=(p:string):string[]=>readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?(/Review snapshots|\.git|node_modules/.test(x.name)?[]:walk(join(p,x.name))):[join(p,x.name)]);
const all=[...walk(vff),...walk(tensor)];const names=new Map<string,string[]>();for(const f of all){for(const name of [basename(f),basename(f,extname(f))])names.set(name,[...(names.get(name)??[]),f]);}
function dest(ref:string,from:string){let name=ref.split('|')[0].split('#')[0].trim().replace(/^<|>$/g,'');try{name=decodeURIComponent(name);}catch{}if(!name||/^[a-z]+:/i.test(name))return;const candidates=[resolve(dirname(from),name),join(source,name)];for(const c of candidates)for(const suffix of ['', '.md'])if(existsSync(c+suffix)&&all.includes(c+suffix))return c+suffix;const matches=[...new Set(names.get(name)??[])];const final=matches.filter(f=>selected.includes(f));return final.length===1?final[0]:matches.length===1?matches[0]:undefined;}
function links(raw:string){return [...raw.matchAll(/!?\[\[([^\]]+)\]\]|!?\[[^\]\n]*\]\(([^\n]+?)\)/g)].map(m=>m[1]??m[2]);}
const allowedNote=(f:string)=>selected.includes(f)||/^(Definitions|Results and Theorems|Results Index|Glossary|Notation|Symbols)(?: and .*| Index)?\.md$/i.test(basename(f));
const queue=[...selected];for(const d of new Set(selected.map(dirname)))for(const n of readdirSync(d))if(allowedNote(join(d,n)))queue.push(join(d,n));
const copied=new Set<string>();while(queue.length){const f=queue.shift()!;if(copied.has(f))continue;copied.add(f);const bytes=readFileSync(f),path=relative(source,f);put(path,bytes);manifests.push({source:path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});if(extname(f)==='.md'){for(const link of links(bytes.toString())){const target=dest(link,f);if(target&&(extname(target)!=='.md'||allowedNote(target)))queue.push(target);else if(!/^[a-z]+:/i.test(link)&&link.split('#')[0])unresolved.add(`${path} → ${link}`);}}}
let questionCount=0;const chapters:any[]=[];
function chapter(number:number,files:string[]){const chapterId=`vff-${String(number).padStart(3,'0')}`,title=number===0?'00 - Tensor Analysis':basename(dirname(files[0])).replace(/^0/,''),folder=`${base}/${number===0?'000 - Tensor Analysis':basename(dirname(files[0]))}`;
 const qs:{id:string;title:string;set:string}[]=[];const parts:string[]=[];
 for(const file of files){const raw=readFileSync(file,'utf8'),part=number===0?Number(/Lecture (\d+)/.exec(file)![1]):undefined,rel=relative(source,file),link=rel.slice(0,-3);parts.push(`[[${link}|${part?`Part ${part} — `:''}${basename(file).replace(/^.*? (?:Tensor Analysis|Tensor Calculus) - /,'').replace(/ - final draft\.md$/, '').replace(/\.md$/,'')}]]`);
  const lines=raw.split('\n');let section='Worked exercises',n=0;
  for(let i=0;i<lines.length;i++){if(/^#{1,2} /.test(lines[i]))section=lines[i].replace(/^#+ /,'');const hit=/^> \[!exercise\][+-]?\s*(.*)/.exec(lines[i]);if(!hit)continue;n++;let end=i+1;while(end<lines.length&&/^>/.test(lines[end]))end++;
   const block=lines.slice(i+1,end).map(l=>l.replace(/^> ?/,'')).join('\n').trim();if(!block)continue;
   let solution=end;while(solution<Math.min(end+35,lines.length)&&!/^##### solution/i.test(lines[solution]))solution++;
   const extra=solution<Math.min(end+35,lines.length)?lines.slice(end,solution).join('\n').replace(/^\^[\w-]+\s*$/gm,'').trim():'';
   const promptRaw=block+(extra?'\n\n'+extra:'');const relocate=(s:string)=>s.replace(/(!?\[[^\]\n]*\]\()([^\n]+?)(\))/g,(m,a,b,c)=>{const d=dest(b,file);return d?a+relative(source,d).split('/').map(encodeURIComponent).join('/')+c:m;});
   const id=`${chapterId}${part?'-p'+part:''}-ex${n}`,set=(part?`Part ${part} · `:'')+section,title=hit[1]||`Exercise ${n}`;
   const anchor=lines.slice(end,end+4).find(l=>/^\^[\w-]+$/.test(l))?.slice(1);
   const reference=`[[${link}${anchor?'#^'+anchor:''}|Open the source exercise and its worked solution]]\n\nCompare your derivation with the worked solution following **${title}**. Check each requested part, assumptions, signs, units, and boundary conditions.`;
   const d:Definition={version:1,id,title,type:'short-answer',courseIds:[course],chapters:[{courseId:course,chapterId,title}],concepts:[`Practice set: ${set}`],written:{reference,rubric:[{id:'complete',text:'I checked every requested part against the source solution and my reasoning and results agree.'}]}};
   d.chapters![0].title=number===0?'00 - Tensor Analysis':basename(dirname(files[0])).replace(/^0/,'');
   const path=`${folder}/Questions/${id}.md`,text=serialize(d,relocate(promptRaw),reference);const q=parseQuestion(text,path);if(!grade(q,{choices:[],blanks:{}}).basis)throw Error('Invalid self-assessment');put(path,text);qs.push({id,title,set});questionCount++;
  }
 }
 const materials=parts.map((link,i)=>{const m=/\[\[([^|]+)\|([^\]]+)\]\]/.exec(link)!;const raw=readFileSync(files[i],'utf8');const headings=[...raw.matchAll(/^#{1,2} (.+)$/gm)].map(h=>h[1].replace(/^\d+(?:\.\d+)*\.?\s*/, '')).filter(h=>!/^Exercises|Notation|Symbols/i.test(h));return {number:i+1,title:headings[0]??m[2],path:m[1],description:headings.slice(1,3).join(' · ')};});
 const structure=materials.length>1?{parts:materials}:{material:materials[0].path};
 const note=`---\n${stringify({studyChapter:{courseId:course,chapterId,title,number,icon:number===0?'sigma':'waves',...structure}})}---\n\n# ${title}\n\n\`\`\`study-chapter-home\n\`\`\`\n`;
 put(`${folder}/Chapter.md`,note);chapters.push({title,number,path:`${folder}/Chapter`,questions:qs.length,parts:files.length});
}
chapter(0,tensors);for(const f of fluid)chapter(Number(basename(dirname(f)).slice(0,3)),[f]);
put(`${base}/Course.md`,`---\n${stringify({studyCourse:{version:1,id:course,title:'Viscous Fluid Flow'},studyHome:{symbol:'∇',color:'#507b98'}})}---\n\n# Viscous Fluid Flow\n\nTensor analysis prerequisites and completed viscous-flow chapters.\n\n${chapters.map(c=>`[[${c.path}|${c.title}]]`).join('\n\n')}\n`);
put('Project docs/Viscous Fluid Flow import.json',JSON.stringify({chapters,questionCount,files:manifests,unresolvedLinks:[...unresolved]},null,2)+'\n');
for(const [p,bytes]of pending){const target=join(lab,p);if(p==='Project docs/Viscous Fluid Flow import.json')continue;if(existsSync(target)&&!readFileSync(target).equals(bytes))throw Error('Refusing to overwrite differing lab file: '+p);}
let added=0;for(const [p,bytes]of pending){const target=join(lab,p);if(!existsSync(target)||p==='Project docs/Viscous Fluid Flow import.json'){mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);added++;}}
console.log(JSON.stringify({chapters:chapters.length,tensorParts:8,finalNotes:selected.length,questions:questionCount,sourceFiles:manifests.length,unresolvedLinks:unresolved.size,added},null,2));
