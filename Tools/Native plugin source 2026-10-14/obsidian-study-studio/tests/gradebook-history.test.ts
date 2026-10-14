import test from 'node:test';
import assert from 'node:assert/strict';
import {gradebookHistory} from '../src/gradebook-history';
import {courseMetrics} from '../src/metrics-model';
import {HistoryRow} from '../src/history-model';
test('a newer perfect practice attempt cannot replace an assessment grade',()=>{
 const common={paths:[],questionId:'q',familyId:'q',title:'Question',concepts:[],course:{id:'course',title:'Course'},mode:'attempt',classification:'first',possible:10,activeSeconds:null};
 const exam={...common,key:'exam',source:'exam',finished:'2026-09-01',earned:6} as HistoryRow;
 const practice={...common,key:'practice',source:'practice',finished:'2026-09-02',earned:10} as HistoryRow;
 const original=[exam,practice];const rows=gradebookHistory(original);
 assert.deepEqual(rows,[exam]);assert.equal(original.length,2);
 const metrics=courseMetrics([],rows,'course');assert.equal(metrics.latest.earned,6);assert.equal(metrics.latest.possible,10);
 assert.deepEqual(gradebookHistory([practice]),[]);
});
