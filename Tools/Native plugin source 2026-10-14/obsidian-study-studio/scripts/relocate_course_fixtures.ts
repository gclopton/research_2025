import {readFileSync,writeFileSync,readdirSync,mkdirSync,renameSync,existsSync,rmdirSync} from 'node:fs';import {dirname} from 'node:path';import {parseQuestion} from '../src/model';import {parseExam} from '../src/exam-model';
const root='fixtures',moves:{from:string;to:string;id?:string;kind?:'question'|'exam'}[]=[];
for(const course of ['Calculus','French','Python','Fluid Dynamics']){
 const folder=`Courses/${course}/Questions`;
 if(!existsSync(root+'/'+folder))continue;
 for(const name of readdirSync(root+'/'+folder)){
  const from=folder+'/'+name,q=parseQuestion(readFileSync(root+'/'+from,'utf8'),from),chapter='Chapter '+q.definition.chapters![0].title.replace(' · ',' - '),to=`Courses/${course}/${chapter}/Questions/${name}`;moves.push({from,to,id:q.definition.id,kind:'question'});
 }
}
for(const name of ['Checkpoint','Immediate practice exam']){
 const from=`Courses/Fluid Dynamics/Exams/${name}.md`,to=`Courses/Fluid Dynamics/Chapter 02 - Fluid Kinematics/Exams/${name}.md`;if(existsSync(root+'/'+from))moves.push({from,to,id:parseExam(readFileSync(root+'/'+from,'utf8')).id,kind:'exam'});
}
if(existsSync(root+'/Courses/Fluid Dynamics/Lesson.md'))moves.push({from:'Courses/Fluid Dynamics/Lesson.md',to:'Courses/Fluid Dynamics/Chapter 02 - Fluid Kinematics/Lesson.md'});
if(!moves.length)throw Error('Fixture relocation already completed.');
for(const m of moves){if(existsSync(root+'/'+m.to))throw Error('Destination exists: '+m.to);mkdirSync(dirname(root+'/'+m.to),{recursive:true});renameSync(root+'/'+m.from,root+'/'+m.to);}
const files=(p:string):string[]=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(p+'/'+e.name):[p+'/'+e.name]);
for(const file of files(root).filter(p=>p.endsWith('.md'))){const old=readFileSync(file,'utf8');let text=old;for(const m of moves){text=text.replaceAll(m.from.replace(/\.md$/,''),m.to.replace(/\.md$/,''));}if(text!==old)writeFileSync(file,text);}
for(const path of ['Courses/Calculus/Questions','Courses/French/Questions','Courses/Python/Questions','Courses/Fluid Dynamics/Questions','Courses/Fluid Dynamics/Exams'])if(existsSync(root+'/'+path)&&!readdirSync(root+'/'+path).length)rmdirSync(root+'/'+path);
writeFileSync('src/lab-chapter-moves.ts','// Explicit moves for the isolated course lab; native FileManager preserves note links.\nexport const labChapterMoves = '+JSON.stringify(moves,null,2)+' as const;\n');
console.log('Relocated fixture files:',moves.length);
