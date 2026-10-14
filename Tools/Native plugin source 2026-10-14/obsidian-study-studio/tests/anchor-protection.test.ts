import test from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {anchorRemovalChanges,lostAnchorIds,removalPhrase} from '../src/anchor-protection-model';

const before='First passage. ^first\n\nSecond passage.\n^second\n';
test('deletion, replacement and boundary edits cannot erase anchors indirectly',()=>{
  for(const after of ['',before.replace('^first',''),before.replace('^first','^renamed'),before.replace('^first','^first text'),before.replace('First passage. ^first\n','')])
    assert.ok(lostAnchorIds(before,after).includes('^first'));
  assert.deepEqual(lostAnchorIds(before,before.replace('First passage.','Revised passage.')),[]);
  assert.deepEqual(lostAnchorIds(before,before+'New paragraph.'),[]);
});
test('selection deletion is rejected as a whole, preserving surrounding prose too',()=>{
  const state=EditorState.create({doc:before,extensions:EditorState.transactionFilter.of(tr=>lostAnchorIds(tr.startState.doc.toString(),tr.newDoc.toString()).length?[]:tr)});
  assert.equal(state.update({changes:{from:0,to:before.length,insert:''}}).newDoc.toString(),before);
  assert.equal(state.update({changes:{from:0,to:5,insert:'Edited'}}).newDoc.toString(),before.replace('First','Edited'));
});
test('deliberate removal preserves text and other anchors and can be reversed',()=>{
  const state=EditorState.create({doc:before});
  const tr=state.update({changes:anchorRemovalChanges(before,['^first'])});
  assert.equal(tr.newDoc.toString(),before.replace('^first',''));
  assert.equal(tr.changes.invert(state.doc).apply(tr.newDoc).toString(),before);
  assert.equal(state.update({changes:anchorRemovalChanges(before,['^first','^second'])}).newDoc.toString(),before.replace('^first','').replace('^second',''));
});
test('whole-document edits retaining anchors are allowed, losing a duplicate is detected',()=>{
  assert.deepEqual(lostAnchorIds(before,'New second. ^second\nNew first. ^first'),[]);
  assert.deepEqual(lostAnchorIds('A ^same\nB ^same','A ^same'),['^same']);
  assert.deepEqual(lostAnchorIds('```md\nexample ^demo\n```',''),[]);
});
test('confirmation is scoped to one ID or the current note count',()=>{
  assert.equal(removalPhrase(['^first'],false),'REMOVE ^first');
  assert.equal(removalPhrase(['^first','^second'],true),'REMOVE 2 ANCHORS');
});

test('changed-line anchor protection agrees with whole-note checks through random edits',async()=>{
 const {changedAnchorIds}=await import('../src/anchor-protection-model');
 let source=('Plain prose $x^2$\nA passage ^one\n\n```md\nCode ^hidden\n```\nAnother ^two\n\n').repeat(25);
 let seed=8277;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const inserts=['x','^new','\n','```\n','~~~',' ','^','\n\n','\r\n',''];
 for(let i=0;i<400;i++){
  const state=EditorState.create({doc:source}),from=Math.floor(rand()*(source.length+1)),to=Math.min(source.length,from+Math.floor(rand()*18));
  const tr=state.update({changes:{from,to,insert:inserts[Math.floor(rand()*inserts.length)]}});
  assert.deepEqual(changedAnchorIds(tr),lostAnchorIds(source,tr.newDoc.toString()),`edit ${i}`);
  source=tr.newDoc.toString();
 }
});
