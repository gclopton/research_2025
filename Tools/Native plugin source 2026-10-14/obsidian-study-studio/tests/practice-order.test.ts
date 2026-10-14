import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterOrder,shuffledPractice} from '../src/practice-order';
import {Question} from '../src/model';
const q=(id:string,order?:number)=>({path:id,definition:{id,sourceOrder:order}} as Question);
test('practice source order is stable, with natural legacy fallback and no input mutation',()=>{const a=[q('q10'),q('b',2),q('a',1),q('q2')];assert.deepEqual(chapterOrder(a).map(q=>q.path),['a','b','q2','q10']);assert.equal(a[0].path,'q10');});
test('shuffling preserves each question identity and can be reset to chapter order',()=>{const a=[q('a',1),q('b',2),q('c',3)];const b=shuffledPractice(a,()=>0);assert.deepEqual(b.map(q=>q.path),['b','c','a']);assert.deepEqual(chapterOrder(b),a);assert.equal(new Set(b).size,3);});
