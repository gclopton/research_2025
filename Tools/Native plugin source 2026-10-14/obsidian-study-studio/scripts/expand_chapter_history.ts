/** Additive, repeatable Chapter 1 dashboard dataset. Never rewrites existing records. */
import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {parseQuestion,makeAttempt,Question,Response} from '../src/model';
import {parseExam,serializeExam,createSession,submitSession,assessWrittenEntry,parseSession,ExamDefinition} from '../src/exam-model';
import {normalizeHistory,HistoryFile} from '../src/history-model';
import {assessmentGrid} from '../src/assessment-grid-model';
const root=process.argv[2];if(root!=='/Users/gradyclopton/ObsidianVaults/study_studio_lab')throw Error('Lab vault only.');
const base='Courses/French I/01 - First conversations',course={id:'french-i',title:'French I'};
const bank=readdirSync(`${root}/${base}/Questions`).filter(f=>f.endsWith('.md')).map(f=>{const path=`${base}/Questions/${f}`;return parseQuestion(readFileSync(`${root}/${path}`,'utf8'),path);});
if(bank.length!==37||bank.some(q=>!q.definition.chapters?.some(p=>p.chapterId==='fri-01'&&p.courseId===course.id)))throw Error('Unexpected chapter bank');
const automatic=bank.filter(q=>q.definition.type!=='short-answer');
function answer(q:Question,good:boolean):Response{
 const d=q.definition;
 if(d.type==='short-answer')return {choices:[],blanks:{response:'Bonjour ! Un thé, s’il vous plaît. Merci beaucoup. Au revoir !'}};
 return {choices:d.choices?(good?d.correct!:d.choices.filter(c=>!d.correct?.includes(c.id)).slice(0,1).map(c=>c.id)):[],blanks:Object.fromEntries((d.answers??[]).map(a=>[a.id,good?a.accepted[0]:(a.accepted[0]==='bonjour'?'bonsoir':a.accepted[0]==='merci'?'pardon':'bonjour')]))};
}
const pending=new Map<string,string>();const put=(p:string,t:string)=>pending.set(p,t);
const exams:[ExamDefinition,number[]][]=[];
for(const [name,targets]of [['Checkpoint',[.57,.79,.93,.86,1]],['Vocabulary recall',[.4,.6,.8,.87,.73,1]]] as [string,number[]][]){const e=parseExam(readFileSync(`${root}/${base}/Exams/${name}.md`,'utf8'));exams.push([e,targets]);}
function add(id:string,title:string,kind:ExamDefinition['kind'],questions:Question[],targets:number[]){
 const e:ExamDefinition={version:1,id,title,kind,scope:{kind:'chapter',chapterId:'fri-01'},courseIds:[course.id],mode:'all',allowBack:true,shuffleSections:false,sections:[{id:'section',title,shuffleGroups:false,groups:[{id:'group',title:'Questions',shuffleQuestions:false,questions:questions.map((q,i)=>({id:`slot-${i}`,questionId:q.definition.id,variants:'exact'}))}]}]};
 const raw=serializeExam(e).replace('---\n','---\nstudyAssessment:\n  kind: '+(kind==='quiz'?'quiz':'exam')+'\n');parseExam(raw);put(`${base}/Exams/${title}.md`,raw);exams.push([e,targets]);
}
add('fri-01-greetings-quiz','Greetings and courtesy quiz','quiz',automatic.slice(0,10),[.5,.7,.9,1]);
add('fri-01-reading-quiz','Reading and register quiz','quiz',automatic.slice(-5),[.4,.8,.6,1]);
add('fri-01-chapter-test','First conversations test','test',automatic,[.6,.77,.89,.94]);
add('fri-01-written-assignment','A polite exchange assignment','assignment',[bank.find(q=>q.definition.id==='fri-01-36')!],[.5,.75,1]);
const records:HistoryFile[]=[];
function save(kind:'exam'|'practice',v:{id:string}){const path=`Study Studio/${kind==='exam'?'Exam sessions':'Attempts'}/${v.id}.json`,raw=JSON.stringify(v,null,2)+'\n';records.push({path,raw,kind});put(path,raw);}
let sessionCount=0;
for(const [index,[exam,targets]]of exams.entries())for(const [round,target]of targets.entries()){
 let s=createSession(exam,bank,`fri-ch1-expanded-${exam.id}-${round+1}`,()=>.4,course);
 const auto=s.entries.filter(e=>e.question.definition.type!=='short-answer'),n=Math.round(auto.length*target);
 // Rotate the missed questions so retries are not identical answer patterns.
 const correct=new Set(auto.map((e,i)=>({e,rank:(i+round*7)%auto.length})).sort((a,b)=>a.rank-b.rank).slice(0,n).map(x=>x.e.id));
 for(const e of s.entries)e.response=answer(e.question,correct.has(e.id));
 s=submitSession(s);
 for(const e of s.entries.filter(e=>e.question.definition.type==='short-answer'))if(!(index===0&&round===targets.length-1)){
  const scores=Object.fromEntries(e.question.definition.written!.rubric.map((r,i)=>[r.id,i<Math.round(target*e.question.definition.written!.rubric.length)?1:0]));s=assessWrittenEntry(s,e.id,scores);
 }
 const day=2+round*5+index%3;s.started=new Date(Date.UTC(2026,8,day,13+index)).toISOString();s.finished=new Date(Date.parse(s.started)+(index===4?40:12)*60000).toISOString();
 parseSession(JSON.stringify(s));save('exam',s);sessionCount++;
}
let practiceCount=0;
for(let day=0;day<18;day++)for(let j=0;j<9;j++){
 const q=automatic[(day*11+j*3)%automatic.length];const good=(day*31+j*17)%100<([55,65,75,85,70,95][Math.floor(day/3)]);
 const start=new Date(Date.UTC(2026,8,1+day,9,j*4)).toISOString();
 const a=makeAttempt(q,answer(q,good),q.definition.choices?.map(c=>c.id)??[],'attempt','First conversations practice',start,`fri-ch1-expanded-practice-${day}-${j}`,course);a.finished=new Date(Date.parse(start)+90000).toISOString();save('practice',a);practiceCount++;
}
const verified=normalizeHistory(records);if(verified.errors.length)throw Error(verified.errors.join('\n'));
const grid=assessmentGrid(records.filter(r=>r.kind==='exam').map(r=>({session:parseSession(r.raw),path:r.path})),course.id,'fri-01');if(grid.length!==6)throw Error('Unexpected assessment rows');
for(const [p,t]of pending)if(existsSync(`${root}/${p}`)&&readFileSync(`${root}/${p}`,'utf8')!==t)throw Error('Preserving differing file: '+p);
let added=0;for(const [p,t]of pending)if(!existsSync(`${root}/${p}`)){mkdirSync(dirname(`${root}/${p}`),{recursive:true});writeFileSync(`${root}/${p}`,t);added++;}
console.log(JSON.stringify({added,sessionCount,practiceCount,normalizedResponses:verified.rows.length,assessments:grid.map(g=>({title:g.title,attempts:g.attempts.length,scores:g.attempts.map(a=>`${a.earned}/${a.possible}${a.pending?' pending':''}`)}))},null,2));
