import test from 'node:test';import assert from 'node:assert/strict';
import {visibleAttempt,attemptColumnLabel} from '../src/attempt-window';
test('sixth attempt drops oldest visible score without deleting history or renumbering',()=>{
 const attempts=[1,2,3,4,5,6];assert.deepEqual(Array.from({length:5},(_,i)=>visibleAttempt(attempts,i,5)),[2,3,4,5,6].map(n=>({attempt:n,number:n})));assert.equal(attempts.length,6);
});
test('mixed-length rows align latest values and preserve empty cells',()=>{
 assert.equal(visibleAttempt([1],0,5),undefined);assert.deepEqual(visibleAttempt([1],4,5),{attempt:1,number:1});assert.equal(visibleAttempt([],0,1),undefined);assert.equal(attemptColumnLabel(4,5),'Latest');assert.equal(attemptColumnLabel(3,5),'Previous');
});
