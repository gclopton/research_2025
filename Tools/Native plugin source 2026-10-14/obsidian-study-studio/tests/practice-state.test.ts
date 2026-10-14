import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseGroup,noteQuestionIds,restoreDraft,signature,draftKey,PracticeDraft} from '../src/practice-state';
import {parseQuestion,template} from '../src/model';
test('groups keep ordered references and note review includes group and single cards',()=>{
 assert.deepEqual(parseGroup('title: Calculus\nquestions: [b, a]'),{title:'Calculus',questions:['b','a']});
 assert.deepEqual(noteQuestionIds('```study\na\n```\n```study-group\ntitle: Review\nquestions: [b, a]\n```'),['a','b']);
 assert.throws(()=>parseGroup('title: Bad\nquestions: [a, a]'));
 assert.deepEqual(parseGroup('title: Empty\nquestions: []'),{title:'Empty',questions:[]});
});
test('draft round trip preserves math and order but rejects changed questions or malformed responses',()=>{
 const q=parseQuestion(template('blank','sample','Sample'),'Sample.md');
 const id=q.definition.answers![0].id;
 const d:PracticeDraft={version:1,signature:signature(q),started:new Date().toISOString(),order:[],response:{choices:[],blanks:{[id]:'x^2'}},mathIds:[id]};
 const restored=restoreDraft(JSON.parse(JSON.stringify(d)),q)!;
 assert.deepEqual(restored,d);restored.response.blanks[id]='other';assert.equal(d.response.blanks[id],'x^2');
 assert.equal(restoreDraft(d,{...q,prompt:q.prompt+' changed'}),undefined);
 assert.equal(restoreDraft({...d,response:{choices:[],blanks:{unknown:'x'}}},q),undefined);
 assert.equal(restoreDraft({...d,mathIds:['unknown']},q),undefined);
 assert.notEqual(draftKey('a','bc'),draftKey('ab','c'));
});
