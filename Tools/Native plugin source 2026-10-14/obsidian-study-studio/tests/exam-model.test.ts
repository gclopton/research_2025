import {test} from 'node:test';import assert from 'node:assert/strict';
import {ExamDefinition,createSession,submitSession,parseSession,serializeExam,parseExam,examScores,validateExam,replaceExam} from '../src/exam-model';
import {parseQuestion,template} from '../src/model';
const q=(id:string)=>parseQuestion(template('choice',id,id),id+'.md');
const example=():ExamDefinition=>({version:1,id:'exam',title:'Exam',mode:'sections',allowBack:false,shuffleSections:false,sections:[{id:'s1',title:'First',shuffleGroups:false,groups:[{id:'g1',title:'Group',shuffleQuestions:false,questions:[{id:'slot1',questionId:'a',variants:'exact'}]}]},{id:'s2',title:'Second',shuffleGroups:false,groups:[{id:'g2',title:'Next group',shuffleQuestions:false,questions:[{id:'slot2',questionId:'b',variants:'exact'}]}]}]});
test('exam round trip freezes questions and order; result counts unanswered questions and preserves input',()=>{
 const exam=example(),bank=[q('a'),q('b')];assert.deepEqual(parseExam(serializeExam(exam)),exam);
 const s=createSession(exam,bank,'session',()=>0);bank[0].prompt='Changed later';assert.notEqual(s.entries[0].question.prompt,'Changed later');
 s.entries[0].response.choices=[...s.entries[0].question.definition.correct!];const restored=parseSession(JSON.stringify(s));assert.deepEqual(restored,s);
 const finished=submitSession(restored);assert.equal(s.state,'active');assert.equal(finished.state,'submitted');assert.deepEqual(examScores(finished).overall,{earned:1,possible:2,pending:0});assert.equal(examScores(finished).sections[1].earned,0);assert.throws(()=>submitSession(finished),/already/);
});
test('shuffle respects dependency ordering and retains group blocks',()=>{
 const exam=example();exam.shuffleSections=true;exam.sections[1].after=['s1'];const s=createSession(exam,[q('a'),q('b')],'session',()=>0.99);assert.deepEqual(s.sectionOrder,['s1','s2']);assert.deepEqual(s.entries.map(e=>e.groupId),['g1','g2']);
 exam.sections[0].after=['s2'];assert.throws(()=>validateExam(exam),/cycle/);
});
test('fixed ordering conflicts, missing references and duplicate question selection fail',()=>{
 const exam=example();exam.sections[0].after=['s2'];assert.throws(()=>validateExam(exam),/Fixed order/);
 delete exam.sections[0].after;assert.throws(()=>createSession(exam,[q('a')],'session'),/Missing question/);
 exam.sections[1].groups[0].questions[0].questionId='a';assert.throws(()=>createSession(exam,[q('a')],'session'),/selected twice/);
});
test('family slots choose requested variants without repetition and preserve frozen versions',()=>{
 const bank=[q('a'),q('a2'),q('b')];bank[0].definition.familyId='family';bank[1].definition.familyId='family';const exam=example();exam.sections[0].groups[0].questions[0].variants=2;
 const s=createSession(exam,bank,'session',()=>0);assert.equal(s.entries.length,3);assert.equal(new Set(s.entries.map(e=>e.question.definition.id)).size,3);
 exam.sections[0].groups[0].questions[0].variants=1;assert.equal(createSession(exam,bank,'session').entries.length,2);
});

test('exam edits preserve unrelated frontmatter and note prose; corrupt sessions fail',()=>{
 const e=example();const raw=serializeExam(e).replace('studyExam:','tags: [personal]\n# keep this comment\nstudyExam:')+'\nMy extra notes.\n';const updated=replaceExam(raw,{...e,title:'Updated'});assert.match(updated,/tags: \[\s*personal\s*\]/);assert.match(updated,/# keep this comment/);assert.ok(updated.endsWith('\nMy extra notes.\n'));assert.equal(parseExam(updated).title,'Updated');
 const s=createSession(e,[q('a'),q('b')],'session');s.entries[0].order=['invalid'];assert.throws(()=>parseSession(JSON.stringify(s)),/option order/);
});
