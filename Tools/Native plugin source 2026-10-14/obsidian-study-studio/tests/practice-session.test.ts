import test from 'node:test';import assert from 'node:assert/strict';
import {freezePractice,parsePracticeSession} from '../src/practice-session';
import {practiceSetRuns} from '../src/practice-set-model';import {Attempt,Question} from '../src/model';
const review={fullIds:['b','a'],rootContext:'practice-set:one',required:1 as const,randomize:true,round:0,streaks:{}};
const attempt=(id:string,earned:number)=>({id,questionId:id,context:review.rootContext,mode:'attempt',question:{definition:{id},prompt:'Original prompt'},response:{choices:[],blanks:{a:'Original answer'}},grade:{earned,possible:1}} as unknown as Attempt);
test('submission freezes realized order, final responses, grading and review settings independently of live data',()=>{
 const attempts=[attempt('b',0),attempt('a',1)];const s=freezePractice(review.rootContext,'Set',{id:'c',title:'C'},review,attempts);
 attempts[0].response.blanks.a='Changed';attempts[0].question.prompt='Edited prompt';attempts[0].grade!.earned=1;
 assert.deepEqual(s.attempts.map(a=>a.questionId),['b','a']);assert.equal(s.attempts[0].response.blanks.a,'Original answer');assert.equal(s.attempts[0].question.prompt,'Original prompt');assert.equal(s.attempts[0].grade!.earned,0);assert.deepEqual(parsePracticeSession(JSON.stringify(s)),s);
 const runs=practiceSetRuns([{definition:{id:'a'}} as Question],[],'c',[s]);assert.equal(runs[0].earned,1);assert.equal(runs[0].possible,2);assert.equal(runs[0].total,2);assert.equal(runs[0].frozen?.context,review.rootContext);
});
test('cannot freeze incomplete grading, reveals, duplicate questions or another session',()=>{
 const a=attempt('a',1);for(const entries of [[],[a,a],[{...a,mode:'reveal'} as Attempt],[{...a,context:'other'}],[{...a,grade:{...a.grade!,pending:true}}]])assert.throws(()=>freezePractice(review.rootContext,'Set',undefined,review,entries));
});
