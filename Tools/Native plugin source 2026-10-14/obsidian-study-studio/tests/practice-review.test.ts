import test from 'node:test';import assert from 'node:assert/strict';
import {nextReview,PracticeReviewState} from '../src/practice-review';import {Attempt} from '../src/model';
const r=(earned:number,possible=1)=>({mode:'attempt',grade:{earned,possible}} as Attempt);
const initial:PracticeReviewState={fullIds:['a','b','c'],rootContext:'original',required:2,randomize:false,round:0,streaks:{}};
test('initial queue contains partial, wrong and unanswered but removes correct',()=>{assert.deepEqual(nextReview(['a','b','c'],[r(1),r(1,2),r(0)],initial).remaining,['b','c']);});
test('two consecutive rounds clear questions and a miss resets the streak',()=>{const first=nextReview(['b'],[r(0)],initial);const one=nextReview(['b'],[r(1)],first.state);assert.deepEqual(one.remaining,['b']);const miss=nextReview(['b'],[r(0)],one.state);assert.equal(miss.state.streaks.b,0);const two=nextReview(['b'],[r(1)],one.state);assert.deepEqual(two.remaining,[]);assert.equal(initial.streaks.b,undefined);assert.deepEqual(nextReview(['b'],[r(1)],one.state),two);});
test('one correct review clears a question; new set starts independently',()=>{const start={...initial,required:1 as const};const queue=nextReview(['a'],[r(0)],start);assert.deepEqual(nextReview(['a'],[r(1)],queue.state).remaining,[]);assert.deepEqual(nextReview(['a'],[r(0)],start).remaining,['a']);});
