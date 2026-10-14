import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessmentChapter,assessmentGrid} from '../src/assessment-grid-model';
import {createSession,submitSession,ExamDefinition,validateExam} from '../src/exam-model';
import {parseQuestion,template} from '../src/model';
function session(id:string,chapters:string[],examId='checkpoint'){
 const bank=chapters.map((chapter,i)=>{const q=parseQuestion(template('choice',`q${i}`,`Question ${i}`),`q${i}.md`);q.definition.chapters=[{courseId:'course',chapterId:chapter,title:chapter}];return q;});
 const exam:ExamDefinition={version:1,id:examId,title:examId,mode:'all',allowBack:true,shuffleSections:false,sections:[{id:'s',title:'Section',shuffleGroups:false,groups:[{id:'g',title:'Group',shuffleQuestions:false,questions:bank.map((q,i)=>({id:`slot${i}`,questionId:q.definition.id,variants:'exact'}))}]}]};
 return submitSession(createSession(exam,bank,id,()=>0,{id:'course',title:'Course'}));
}
test('chapter assessments exclude cumulative sessions and preserve full scores on overall page',()=>{
 const local=session('local',['one','one']),midterm=session('mid',['one','two'],'midterm');
 const records=[local,midterm].map(session=>({session,path:session.id}));
 assert.equal(assessmentChapter(local,'course'),'one');assert.equal(assessmentChapter(midterm,'course'),undefined);
 assert.deepEqual(assessmentGrid(records,'course','one').map(g=>g.id),['checkpoint']);
 assert.equal(assessmentGrid(records,'course').find(g=>g.id==='midterm')!.attempts[0].possible,2);
 midterm.exam.scope={kind:'course'};midterm.entries[1].question.definition.chapters=local.entries[0].question.definition.chapters;
 assert.equal(assessmentChapter(midterm,'course'),undefined);
});
test('attempts are grouped, ordered, deduplicated, and scoped by frozen course',()=>{
 const early=session('early',['one']),late=session('late',['one']);early.finished='2026-01-01T00:00:00Z';late.finished='2026-02-01T00:00:00Z';
 const records=[late,early,early].map(session=>({session,path:session.id}));
 assert.deepEqual(assessmentGrid(records,'course','one')[0].attempts.map(a=>a.id),['early','late']);
 assert.deepEqual(assessmentGrid(records,'other'),[]);
 late.state='active';assert.equal(assessmentGrid(records,'course')[0].attempts.length,1);
 early.exam.scope={kind:'chapter',chapterId:'two'};assert.equal(assessmentChapter(early,'course'),'two');
 assert.throws(()=>validateExam({...early.exam,scope:{kind:'chapter',chapterId:''}}),/scope/);
});
