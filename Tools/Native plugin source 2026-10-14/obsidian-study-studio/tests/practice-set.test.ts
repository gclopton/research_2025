import test from 'node:test';import assert from 'node:assert/strict';
import {practiceSetSummary} from '../src/practice-set-model';
import {HistoryRow} from '../src/history-model';import {Question} from '../src/model';
const qs=['a','b'].map(id=>({definition:{id}} as Question));
const row=(id:string,earned:number,extra:Partial<HistoryRow>={}):HistoryRow=>({key:id,source:'practice',paths:[],questionId:id,familyId:id,title:id,concepts:[],course:{id:'c',title:'C'},finished:'2026-09-01T00:00:00Z',mode:'attempt',classification:'first',earned,possible:100,activeSeconds:null,...extra});
test('competency requires full coverage and ignores assessment, reveal, pending and other course records',()=>{
 assert.equal(practiceSetSummary(qs,[],'c').status,'Unmeasured');
 const rows=[row('a',100),row('b',100,{source:'exam'}),row('b',100,{mode:'reveal'}),row('b',100,{assessment:'pending'}),row('b',100,{course:{id:'other',title:'Other'}})];
 const m=practiceSetSummary(qs,rows,'c');assert.equal(m.coverage,1);assert.equal(m.status,'Incomplete coverage');assert.equal(m.percent,100);assert.equal(m.pending,1);
 assert.equal(practiceSetSummary(qs,[row('a',90),row('b',90)],'c').status,'Proficient');
});
test('latest response replaces prior score and rounded thresholds match grade colors',()=>{
 const rows=[row('a',100),row('a',70,{finished:'2026-09-02T00:00:00Z'}),row('b',90)];
 const m=practiceSetSummary(qs,rows,'c');assert.equal(m.percent,80);assert.equal(m.status,'Needs work');assert.equal(m.attempts,3);
 assert.equal(practiceSetSummary(qs,[row('a',85),row('b',85)],'c').status,'Developing');
 assert.equal(practiceSetSummary(qs,[row('a',89.5),row('b',89.5)],'c').status,'Proficient');
});
import {practiceSetRuns} from '../src/practice-set-model';
test('attempt columns group explicit runs and retain pending and partial coverage',()=>{
 const rows=[row('a',0,{practiceContext:'practice-set:r1'}),row('a',100,{practiceContext:'practice-set:r1',finished:'2026-09-02T00:00:00Z'}),row('b',50,{practiceContext:'practice-set:r1'}),row('a',100,{practiceContext:'practice-set:r2',finished:'2026-09-03T00:00:00Z'}),row('b',0,{practiceContext:'practice-set:r2',assessment:'pending',earned:null}),row('a',100,{practiceContext:'old-modal'})];
 const runs=practiceSetRuns(qs,rows,'c');assert.equal(runs.length,2);assert.equal(runs[0].earned,150);assert.equal(runs[0].possible,200);assert.equal(runs[1].pending,1);assert.equal(runs[1].possible,100);assert.equal(runs[1].coverage,2);
});
test('missed-question review updates competency without changing original set score',()=>{
 const rows=[row('a',0,{practiceContext:'practice-set:original'}),row('b',100,{practiceContext:'practice-set:original'}),row('a',100,{practiceContext:'practice-review:practice-set:original:round1',finished:'2026-09-02T00:00:00Z'})];
 const runs=practiceSetRuns(qs,rows,'c');assert.equal(runs.length,1);assert.equal(runs[0].earned,100);assert.equal(runs[0].possible,200);assert.equal(practiceSetSummary(qs,rows,'c').percent,100);
});
