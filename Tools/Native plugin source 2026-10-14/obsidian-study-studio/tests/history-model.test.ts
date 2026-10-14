import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseQuestion,template,makeAttempt,validate} from '../src/model';
import {createSession,submitSession,ExamDefinition} from '../src/exam-model';
import {normalizeHistory,filterHistory,HistoryFile} from '../src/history-model';
import {courseSource,parseCourse,replaceProperty,validateMembership} from '../src/course-model';
const q=()=>parseQuestion(template('blank','q','Question'),'q.md');
const c={id:'course-a',title:'Course A'};
function attempt(id:string,when:string,mode:'attempt'|'reveal'='attempt',course:any=c){const a=makeAttempt(q(),{choices:[],blanks:{a:'answer'}},[],mode,'note','2026-09-28T10:00:00Z',id,course);a.finished=when;return a;}
const file=(a:unknown,path='a.json'):HistoryFile=>({path,raw:JSON.stringify(a),kind:'practice'});
const exam:ExamDefinition={version:1,id:'e',title:'Exam',courseIds:['course-a','course-b'],mode:'all',allowBack:true,shuffleSections:false,sections:[{id:'s',title:'Section',shuffleGroups:false,groups:[{id:'g',title:'Group',shuffleQuestions:false,questions:[{id:'slot',questionId:'q',variants:'exact'}]}]}]};
test('course identities and memberships validate and unrelated content survives',()=>{
 const course={version:1 as const,...c};assert.deepEqual(parseCourse(courseSource(course)),course);
 const raw=courseSource(course)+'\nKeep this paragraph.\n';const updated=replaceProperty(raw,'studyCourse',{...course,title:'New name'});assert.equal(parseCourse(updated).id,c.id);assert.ok(updated.endsWith('Keep this paragraph.\n'));
 assert.throws(()=>validateMembership(['course-a','course-a']));assert.throws(()=>validateMembership('course-a'));assert.throws(()=>parseCourse('---\nstudyCourse:\n  version: 1\n  id: bad id\n  title: X\n---'));
 const question=q();question.definition.courseIds=['course-a','course-b'];validate(question.definition,question.prompt);
});
test('legacy remains unassigned; new membership never backfills history; no fake durations',()=>{
 const a=attempt('legacy','2026-09-28T11:00:00Z');delete a.course;a.question.definition.courseIds=['course-a'];const result=normalizeHistory([file(a)]);
 assert.equal(result.rows[0].course,null);assert.equal(result.rows[0].activeSeconds,null);assert.equal(filterHistory(result.rows,'course-a').length,0);assert.equal(filterHistory(result.rows,'unassigned').length,1);
});
test('first/retry spans practice and exams per course and exact question, excluding reveals',()=>{
 const s=submitSession(createSession(exam,[q()],'session',()=>0,c));s.started='2026-09-28T10:00:00Z';s.finished='2026-09-28T13:00:00Z';
 const result=normalizeHistory([file(attempt('retry','2026-09-28T12:00:00Z')),file(attempt('reveal','2026-09-28T10:30:00Z','reveal')),file(attempt('first','2026-09-28T11:00:00Z')),file(attempt('other-course','2026-09-28T14:00:00Z','attempt',{id:'course-b',title:'B'})),{kind:'exam',path:'s.json',raw:JSON.stringify(s)}]);
 assert.deepEqual(result.rows.map(x=>x.classification),['reveal','first','retry','retry','first']);assert.equal(result.rows[0].earned,null);assert.equal(result.rows[3].section,'Section');assert.equal(filterHistory(result.rows,'course-a','retry').length,2);
});
test('duplicate files deduplicate by event identity; conflicts excluded and reported',()=>{
 const a=attempt('same','2026-09-28T11:00:00Z');let result=normalizeHistory([file(a,'1.json'),file(a,'2.json')]);assert.equal(result.rows.length,1);assert.deepEqual(result.rows[0].paths,['1.json','2.json']);
 const altered=structuredClone(a);altered.course=null;result=normalizeHistory([file(a),file(altered,'conflict.json')]);assert.equal(result.rows.length,0);assert.equal(result.errors.length,1);
});
test('exam snapshots retain course through submission and copies count once',()=>{
 const session=createSession(exam,[q()],'session',()=>0,c);c.title='Renamed after start';exam.courseIds=[];assert.equal(session.course?.title,'Course A');
 let result=normalizeHistory([{kind:'exam',path:'active.json',raw:JSON.stringify(session)}]);assert.equal(result.rows.length,0);assert.equal(result.activeSessions,1);
 const submitted=submitSession(session);result=normalizeHistory([{kind:'exam',path:'one.json',raw:JSON.stringify(submitted)},{kind:'exam',path:'copy.json',raw:JSON.stringify(submitted)}]);assert.equal(result.rows.length,1);assert.equal(result.rows[0].course?.title,'Course A');assert.equal(result.rows[0].earned,0);
});
test('family variants keep individual identity without multiplying memberships',()=>{
 const a=attempt('a','2026-09-28T11:00:00Z');a.question.definition.familyId='family';a.question.definition.courseIds=['course-a','course-b'];
 const b=structuredClone(a);b.id='b';b.questionId=b.question.definition.id='variant-b';
 const result=normalizeHistory([file(a),file(b)]);assert.equal(result.rows.length,2);assert.deepEqual(result.rows.map(r=>r.classification),['first','first']);assert.ok(result.rows.every(r=>r.familyId==='family'));
});
test('corrupt scores and responses are reported, not silently included',()=>{
 const a=attempt('bad','2026-09-28T11:00:00Z');a.grade!.earned=99;const result=normalizeHistory([file(a),{kind:'practice',path:'broken.json',raw:'{'}]);assert.equal(result.rows.length,0);assert.equal(result.errors.length,2);
});
test('practice course snapshots are independent and recovered drafts retain explicit context',async()=>{
 const {restoreDraft,signature}=await import('../src/practice-state');const course={id:'course-c',title:'Original'};const a=attempt('snap','2026-09-28T11:00:00Z','attempt',course);course.title='Changed';assert.equal(a.course?.title,'Original');
 const question=q(),draft={version:1,signature:signature(question),started:'2026-09-28T10:00:00Z',order:[],response:{choices:[],blanks:{a:'answer'}},mathIds:[],course:a.course};assert.equal(restoreDraft(draft,question)?.course?.title,'Original');assert.equal(restoreDraft({...draft,course:{id:'bad id',title:'Bad'}},question),undefined);
});
