import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync} from 'node:fs';import {dirname} from 'node:path';
import {parseQuestion,serialize,makeAttempt,grade,Question,Response,Definition} from '../src/model';
import {parseExam,serializeExam,createSession,submitSession,assessWrittenEntry,parseSession,ExamDefinition} from '../src/exam-model';
import {normalizeHistory,HistoryFile} from '../src/history-model';import {practiceSetSummary} from '../src/practice-set-model';
const root=process.argv[2];if(root!=='/Users/gradyclopton/ObsidianVaults/study_studio_lab')throw Error('Lab only');
const base='Courses/Viscous Fluid Flow/000 - Tensor Analysis',course={id:'viscous-fluid-flow',title:'Viscous Fluid Flow'},chapterId='vff-000';
const bank=readdirSync(`${root}/${base}/Questions`).filter(f=>f.endsWith('.md')&&!f.startsWith('tensor-check-')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).map(f=>parseQuestion(readFileSync(`${root}/${base}/Questions/${f}`,'utf8'),`${base}/Questions/${f}`));
const source='Courses/Viscous Flow and Heat Transfer - UIUC ME 411/002a - Tensor Analysis/002a 1g Tensor Analysis - Lecture 2 - final draft';
const pending=new Map<string,string>(),records:HistoryFile[]=[],fresh:Question[]=[];
function add(title:string,prompt:string,extra:Partial<Definition>,explanation:string){const id=`tensor-check-${fresh.length+1}`;const d:Definition={version:1,id,title,type:'choice',courseIds:[course.id],chapters:[{courseId:course.id,chapterId,title:'00 - Tensor Analysis'}],concepts:['Practice set: Part 2 · Index notation checkpoint'],...extra};const path=`${base}/Questions/${id}.md`,raw=serialize(d,prompt,explanation+`\n\n[[${source}|Review Part 2]]`);const q=parseQuestion(raw,path);pending.set(path,raw);fresh.push(q);return q;}
function choice(title:string,prompt:string,options:string[],explain:string){add(title,prompt,{choices:options.map((text,i)=>({id:`c${i}`,text})),correct:['c0'],shuffle:true},explain);}
function blank(title:string,prompt:string,accepted:string[],explain:string){add(title,prompt,{type:'blank',answers:[{id:'a',accepted}]},explain);}
choice('Identify the summed index',String.raw`In $A_{ij}x_j=b_i$, which index is summed?`,['$j$','$i$','Both $i$ and $j$','Neither'],String.raw`$j$ occurs twice in one term; $i$ selects the component equation.`);
choice('Identify the free index',String.raw`In $r_i=A_{ik}b_{kj}x_j$, which index remains free?`,['$i$','$j$','$k$','No index'],String.raw`$j$ and $k$ each occur twice; only $i$ occurs once.`);
choice('Rename a summation index',String.raw`Which expression equals $A_{ij}x_j$ after a valid dummy-index renaming?`,['$A_{ik}x_k$','$A_{ii}x_i$','$A_{ij}x_k$','$A_{kj}x_j$'],String.raw`Rename both occurrences of $j$ to $k$, preserving free index $i$.`);
choice('Check an indexed expression',String.raw`Which expression violates the usual Einstein index-count rule?`,['$a_i b_i c_i$','$A_{ij}x_j$','$a_i b_i$','$A_{ij}B_{jk}$'],String.raw`The index $i$ occurs three times in the first expression.`);
blank('Count component equations',String.raw`In a three-dimensional Cartesian basis, $A_{ij}x_j=b_i$ represents {{blank:a}} component equations.`,['3','three'],'The free index takes three values.');
blank('Count matrix entries',String.raw`The array $\delta_{ij}$ in three dimensions contains {{blank:a}} component positions, counting zeros.`,['9','nine'],'Each of two free indices has three values, giving 3 × 3 = 9.');
blank('Read an off-diagonal entry',String.raw`For the Cartesian Kronecker delta, $\delta_{12}=$ {{blank:a}}.`,['0','zero'],'Distinct indices give zero.');
blank('Evaluate a contraction',String.raw`In three dimensions, evaluate $\delta_{ii}$ using Einstein summation: {{blank:a}}.`,['3','three'],String.raw`$\delta_{11}+\delta_{22}+\delta_{33}=1+1+1=3$.`);
const written=add('Explain a contraction',String.raw`In a three-dimensional Cartesian basis, expand $A_{ij}x_j=b_i$ for $i=2$. Explain the roles of $i$ and $j$, then rename the dummy index to $k$.`,{type:'short-answer',concepts:['Practice set: Part 2 · Component reasoning'],written:{reference:String.raw`$A_{21}x_1+A_{22}x_2+A_{23}x_3=b_2$. The free index $i$ selects a row; $j$ is summed over 1, 2, 3. A consistent renaming gives $A_{ik}x_k=b_i$.`,rubric:[{id:'expansion',text:'Expands all three terms of row 2.'},{id:'free',text:'Explains that the free index selects the equation.'},{id:'dummy',text:'Identifies j as summed over 1, 2, 3.'},{id:'rename',text:'Renames both occurrences of the dummy index without changing i.'}]}},'A dummy index is local to its sum.');
for(const q of fresh.filter(q=>q!==written)){const correct={choices:q.definition.correct??[],blanks:Object.fromEntries((q.definition.answers??[]).map(a=>[a.id,a.accepted[0]]))};if(grade(q,correct).earned!==grade(q,correct).possible||grade(q,{choices:[],blanks:{}}).earned)throw Error('Invalid key');for(const a of q.definition.answers??[])for(const v of a.accepted)if(!grade(q,{choices:[],blanks:{a:v}}).earned)throw Error('Bad alternative');for(const c of q.definition.choices??[])if(c.id!=='c0'&&grade(q,{choices:[c.id],blanks:{}}).earned)throw Error('Bad distractor');}
const all=[...bank,...fresh],groups=new Map<string,Question[]>();for(const q of all){const topic=q.definition.concepts.find(c=>c.startsWith('Practice set: '))!;groups.set(topic,[...(groups.get(topic)??[]),q]);}
function response(q:Question,value:number,pendingGrade=false):Response {const d=q.definition;if(d.type==='short-answer')return {choices:[],blanks:{response:q===written?(value===1?d.written!.reference:String.raw`$A_{21}x_1+A_{22}x_2+A_{23}x_3=b_2$. I have expanded the second row. I still need to explain the free and summed indices.`):(value===1?'I completed the derivation in my notes and checked every requested part against the worked solution.':value===0?'I have identified the given quantities but have not completed a consistent derivation.':'I completed the first part; the remaining derivation and sign checks need correction.')},reviewed:true,...(pendingGrade?{}:{selfAssessment:Object.fromEntries(d.written!.rubric.map((r,i)=>[r.id,d.written!.rubric.length===1?value:i<Math.round(value*d.written!.rubric.length)?1:0]))})};return {choices:d.choices?[value===1?'c0':'c1']:[],blanks:Object.fromEntries((d.answers??[]).map(a=>[a.id,value===1?a.accepted[0]:a.accepted[0]==='0'?'1':'2']))};}
function save(kind:'practice'|'exam',v:{id:string}){const path=`Study Studio/${kind==='practice'?'Attempts':'Exam sessions'}/${v.id}.json`,raw=JSON.stringify(v,null,2)+'\n';records.push({kind,path,raw});pending.set(path,raw);}
let serial=0;
for(const [g,[topic,qs]]of [...groups].entries()){
 const mode=g%6; // Full competence, weak, partial coverage, untouched, pending, mixed progress.
 if(mode===3)continue;
 const chosen=mode===2?qs.slice(0,Math.max(1,Math.floor(qs.length/2))):qs;
 for(let round=0;round<3;round++)for(const [i,q]of chosen.entries()){
  let value=round===0?(i%2?0:.5):round===1?.5:mode===0?1:mode===1?(i%2?.5:0):mode===2?1:mode===5?(i===qs.length-1?.5:1):1;
  if(q.definition.type!=='short-answer')value=round===2?(i===qs.length-1?0:1):i%3===0?1:0;
  const isPending=mode===4&&round===2&&q.definition.type==='short-answer';
  const a=makeAttempt(q,response(q,value,isPending),q.definition.choices?.map(c=>c.id)??[],'attempt',`practice-set:chapter0-${g}:round-${round}`,new Date(Date.UTC(2026,8,2+round*9+g%6,9,i)).toISOString(),`tensor-ch0-practice-${g}-${round}-${i}`,course);a.finished=new Date(Date.parse(a.started)+180000).toISOString();save('practice',a);serial++;
 }
 if(mode===1){const q=qs[0];const a=makeAttempt(q,{choices:[],blanks:{}},[],'reveal',`Chapter 0 / ${topic}`,'2026-09-28T10:00:00Z',`tensor-ch0-reveal-${g}`,course);a.finished='2026-09-28T10:01:00Z';save('practice',a);}
}
// Ensure a pending-only set and a partly measured high-score set, regardless of source ordering.
const defs:ExamDefinition[]=[];
function exam(id:string,title:string,kind:ExamDefinition['kind'],qs:Question[],targets:number[]){const e:ExamDefinition={version:1,id,title,kind,scope:{kind:'chapter',chapterId},courseIds:[course.id],mode:'all',allowBack:true,shuffleSections:false,sections:[{id:'s',title:'Tensor analysis',shuffleGroups:false,groups:[{id:'g',title:'Questions',shuffleQuestions:false,questions:qs.map((q,i)=>({id:`slot${i}`,questionId:q.definition.id,variants:'exact'}))}]}]};const raw=serializeExam(e);parseExam(raw);pending.set(`${base}/Exams/${title}.md`,raw);defs.push(e);
 for(const [r,target]of targets.entries()){let s=createSession(e,all,`${id}-attempt-${r+1}`,()=>.3,course);s.entries.forEach((entry,i)=>entry.response=response(entry.question,i<Math.round(qs.length*target)?1:0));if(r===0&&s.entries.length>1)s.entries.at(-1)!.response={choices:[],blanks:{}};s=submitSession(s);for(const entry of s.entries)if(entry.question.definition.type==='short-answer'&&entry.response.blanks.response?.trim()&&!(kind==='assignment'&&r===targets.length-1))s=assessWrittenEntry(s,entry.id,Object.fromEntries(entry.question.definition.written!.rubric.map((c,i)=>[c.id,i<Math.round(target*4)?1:0])));
 s.started=new Date(Date.UTC(2026,8,3+r*6+defs.length,14)).toISOString();s.finished=new Date(Date.parse(s.started)+22*60000).toISOString();parseSession(JSON.stringify(s));save('exam',s);}
}
exam('tensor-ch0-index-quiz','Index conventions quiz','quiz',fresh.slice(0,4),[.25,.75,.5,1]);
exam('tensor-ch0-delta-quiz','Components and Kronecker delta quiz','quiz',fresh.slice(4,8),[.5,.75,1]);
exam('tensor-ch0-reasoning','Component reasoning assignment','assignment',[written],[.25,.5,1]);
exam('tensor-ch0-exam','Tensor notation examination','exam',fresh,[.55,.78,1]);
exam('tensor-ch0-check','Index notation review quiz','quiz',fresh.slice(0,8),[]);
for(const [i,e]of [defs[0],defs[3]].entries()){const s=createSession(e,all,`tensor-ch0-active-${i}`,()=>.4,course);s.started=`2026-09-29T${i?16:10}:00:00Z`;s.entries[0].response=response(s.entries[0].question,1);parseSession(JSON.stringify(s));save('exam',s);}
const history=normalizeHistory(records);if(history.errors.length)throw Error(history.errors.join('\n'));
const cases=[...groups].map(([title,qs])=>({title,...practiceSetSummary(qs,history.rows,course.id)}));
const states=new Set(cases.map(c=>c.status));for(const state of ['Proficient','Needs work','Unmeasured','Incomplete coverage','Developing'])if(!states.has(state))throw Error('Missing case '+state);
pending.set('Project docs/Chapter 0 data coverage.json',JSON.stringify({practiceRecords:records.filter(r=>r.kind==='practice').length,assessmentRecords:records.filter(r=>r.kind==='exam').length,questions:fresh.length,assessments:defs.map(e=>e.title),cases},null,2)+'\n');
for(const [p,t]of pending)if(existsSync(`${root}/${p}`)&&readFileSync(`${root}/${p}`,'utf8')!==t)throw Error('Preserving differing file '+p);
let added=0;for(const [p,t]of pending)if(!existsSync(`${root}/${p}`)){mkdirSync(dirname(`${root}/${p}`),{recursive:true});writeFileSync(`${root}/${p}`,t);added++;}
console.log(JSON.stringify({added,practiceRecords:records.filter(r=>r.kind==='practice').length,assessmentRecords:records.filter(r=>r.kind==='exam').length,questions:fresh.length,states:[...states],cases:cases.map(c=>({title:c.title,score:c.percent,status:c.status,coverage:`${c.coverage}/${c.total}`,pending:c.pending}))},null,2));
