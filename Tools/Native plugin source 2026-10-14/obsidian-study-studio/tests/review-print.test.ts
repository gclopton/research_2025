import test from 'node:test';
import assert from 'node:assert/strict';
import {locateQuote,safeColor,anchorRanges,touchesAnchorInterior} from '../src/review-model';
import {printableQuestion} from '../src/exam-print';
import {parseQuestion,template} from '../src/model';
test('critique follows a unique passage when preceding prose changes',()=>{const a={quote:'Eulerian',before:'the ',after:' approach'};assert.deepEqual(locateQuote('New paragraph. the Eulerian approach',a),{from:19,to:27});});
test('ambiguous and removed passages never acquire a guessed highlight',()=>{assert.equal(locateQuote('a term and a term',{quote:'term',before:'',after:''}),undefined);assert.equal(locateQuote('new text',{quote:'old',before:'',after:''}),undefined);assert.deepEqual(locateQuote('a term and a term',{quote:'term',before:'and a ',after:''}),{from:13,to:17});});
test('color cannot inject highlight styles',()=>{assert.equal(safeColor('red;background:url(x)'),'#55aa77');});
test('printed fill blanks contain no keys or explanations',()=>{const q=parseQuestion(template('blank','print-blank','Blank'),'test.md');q.explanation='SECRET EXPLANATION';q.definition.answers![0].accepted=['SECRET ANSWER'];const sheet=printableQuestion(q,1);assert.ok(sheet.includes('study-print-blank'));assert.ok(!sheet.includes('{{blank:'));assert.ok(!sheet.includes('SECRET'));});
test('printed table keeps supplied cells and hides required answers',()=>{const q=parseQuestion(template('table','print-table','Table'),'test.md');q.definition.answers![0].accepted=['SECRET'];const sheet=printableQuestion(q,2);assert.ok(sheet.includes('__________'));assert.ok(sheet.includes('Quantity'));assert.ok(!sheet.includes('SECRET'));});

test('anchors preserve code examples and prevent partial deletion',()=>{const text='Text. ^link-id\n\n```\ncode ^example\n```';assert.equal(anchorRanges(text).length,1);assert.equal(touchesAnchorInterior(text,8,9),true);assert.equal(touchesAnchorInterior(text,6,14),true);assert.equal(touchesAnchorInterior(text,0,14),false);});

import {commentPalette,defaultCommentPalette,darkCommentColor} from '../src/review-model';
test('comment palette migrates older stores and preserves unlimited custom meanings',()=>{
 assert.equal(commentPalette(undefined).length,9);
 const entries=Array.from({length:40},(_,i)=>({color:'#123456',darkColor:'#abcdef',meaning:`Meaning ${i}`}));
 assert.deepEqual(commentPalette(entries),entries);assert.deepEqual(commentPalette([]),[]);
 assert.equal(commentPalette([{color:'invalid',meaning:'Bad'}]).length,0);
});
test('dark variants are brighter and old comments get a safe fallback',()=>{
 for(const c of defaultCommentPalette())assert.ok(parseInt(darkCommentColor(c).slice(1),16)>parseInt(c.color.slice(1),16));
 assert.equal(darkCommentColor({color:'#000000'}),'#666666');
 assert.equal(darkCommentColor({color:'#000000',darkColor:'#aabbcc'}),'#aabbcc');
});
