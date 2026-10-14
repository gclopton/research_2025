import {test} from 'node:test';
import assert from 'node:assert/strict';
import {removeQuestionEmbeds,examUsesQuestions} from '../src/deletion-model';
import {embeds,embedSource} from '../src/note-authoring';
import {Question} from '../src/model';
import {ExamDefinition} from '../src/exam-model';
test('whole-question removal covers duplicates and groups without losing prose or other questions',()=>{
 const raw='Before\n'+embedSource(['a'])+'\nMiddle\n'+embedSource(['a','b'],'Review')+'\n'+embedSource(['a'])+'\nAfter';
 const result=removeQuestionEmbeds(raw,new Set(['a']));assert.equal(result.count,3);assert.deepEqual(embeds(result.raw).map(e=>e.ids),[['b']]);assert.equal(embeds(result.raw)[0].title,'Review');for(const text of ['Before','Middle','After'])assert.ok(result.raw.includes(text));
});
test('bulk deletion removes empty groups and preserves fenced examples and CRLF prose',()=>{
 const example='````markdown\n'+embedSource(['a'])+'\n````',raw='Before\r\n'+example+'\r\n'+embedSource(['a','b'],'All')+'\r\nAfter';
 const result=removeQuestionEmbeds(raw,new Set(['a','b']));assert.equal(result.count,2);assert.equal(result.raw,'Before\r\n'+example+'\r\n\r\nAfter');assert.equal(removeQuestionEmbeds(result.raw,new Set(['a'])).count,0);
});
const q=(id:string,familyId?:string)=>({definition:{id,familyId}} as Question);
const exam=(questionId:string,variants:'exact'|1|'all')=>({sections:[{groups:[{questions:[{questionId,variants}]}]}]} as ExamDefinition);
test('exam deletion guard finds direct IDs and indirect random variant dependencies',()=>{
 const a=q('a','family'),b=q('b','family'),c=q('c'),bank=[a,b,c];
 assert.equal(examUsesQuestions(exam('a','exact'),[a],bank),true);
 assert.equal(examUsesQuestions(exam('a','exact'),[b],bank),false);
 assert.equal(examUsesQuestions(exam('a',1),[b],bank),true);
 assert.equal(examUsesQuestions(exam('a','all'),[b],bank),true);
 assert.equal(examUsesQuestions(exam('c',1),[b],bank),false);
});
